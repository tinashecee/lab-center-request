import { 
  collection, 
  addDoc, 
  updateDoc,
  doc,
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { centerService } from './centerService'

const collectionRequestsRef = collection(db, 'collectionRequests')
const usersRef = collection(db, 'users')

export const collectionRequestService = {
  async createRequest(requestData) {
    try {
      const nowIso = new Date().toISOString()
      
      // Get route from requestData or fetch from center if not provided
      let centerRoute = requestData.route || null
      
      // If route not provided, try to fetch it from center
      if (!centerRoute && requestData.center_id) {
        try {
          const centerDetails = await centerService.getCenterById(requestData.center_id)
          if (centerDetails) {
            centerRoute = centerDetails.route
          }
        } catch (routeError) {
          console.warn('Could not fetch route from center:', routeError)
        }
      }
      
      const sampleRequest = {
        status: 'pending',
        priority: requestData.priority,
        center_name: requestData.center_name,
        center_coordinates: {
          lat: requestData.center_coordinates.lat,
          lng: requestData.center_coordinates.lng,
        },
        caller_name: requestData.caller_name || '',
        patient_name: requestData.caller_name || '',
        caller_number: requestData.caller_number,
        notes: requestData.notes || '',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        requested_at: nowIso,
        sample_type: requestData.sample_type || 'general',
        center_id: requestData.center_id || null,
        center_address: requestData.center_address || '',
        // Include route if available
        ...(centerRoute ? { route: centerRoute } : {}),
        // Include test information if provided
        ...(requestData.test_ids ? { test_ids: requestData.test_ids } : {}),
        ...(requestData.test_names ? { test_names: requestData.test_names } : {}),
      }
      
      const docRef = await addDoc(collectionRequestsRef, sampleRequest)
      
      // Update the document with its ID after creation
      await updateDoc(doc(db, 'collectionRequests', docRef.id), {
        sample_id: docRef.id
      })

      // Send notifications to drivers in the same route (non-blocking)
      if (centerRoute) {
        try {
          // Query users collection for drivers with matching route
          const driversQuery = query(
            usersRef,
            where('role', '==', 'Driver'),
            where('route', '==', centerRoute)
          )
          const driversSnapshot = await getDocs(driversQuery)
          const allDrivers = driversSnapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          
          console.log(`🔍 Found ${allDrivers.length} driver(s) with route: ${centerRoute}`)
          
          const drivers = allDrivers.filter(driver => {
            const hasToken = !!driver.messageToken
            if (!hasToken) {
              console.warn(`⚠️ Driver ${driver.name || driver.driver_name || driver.id} (ID: ${driver.id}) has no messageToken, skipping`)
            }
            return hasToken
          })

          console.log(`📨 Sending notifications to ${drivers.length} driver(s) with valid tokens`)

          if (drivers.length > 0) {
            const message = {
              title: `Sample Collection | ${sampleRequest.priority}`,
              body: `Location: ${sampleRequest.center_name}`,
              sample_id: docRef.id,
              requestedAt: sampleRequest.requested_at,
              caller_name: `${sampleRequest.caller_name} ${sampleRequest.center_name}`.trim(),
              caller_number: sampleRequest.caller_number,
              lat: String(sampleRequest.center_coordinates.lat),
              lng: String(sampleRequest.center_coordinates.lng),
              message: sampleRequest.notes || '',
              notification_type: 'collection',
            }

            console.log(`\n🚀 Starting to send ${drivers.length} notification(s)...`)

            await Promise.all(
              drivers.map(async (driver, index) => {
                try {
                  // Use local backend in development, production URL otherwise
                  const notificationUrl = 'http://147.182.222.173:3004/send-notification'
                  
                  const driverId = driver.id || driver.driver_id || 'unknown'
                  const driverName = driver.name || driver.driver_name || 'Unknown Driver'
                  
                  console.log(`\n[${index + 1}/${drivers.length}] Processing driver: ${driverName} (ID: ${driverId})`)
                  
                  const requestBody = {
                    token: driver.messageToken,
                    message,
                    driverId: driverId,
                    driverName: driverName
                  }
                  
                  console.log(`📤 Sending notification to driver: ${driverName} (ID: ${driverId})`)
                  
                  const response = await fetch(notificationUrl, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                  })

                  if (!response.ok) {
                    const errorText = await response.text()
                    console.error(`❌ [${index + 1}/${drivers.length}] Failed to send notification to driver ${driverName} (ID: ${driverId}): ${response.status} ${response.statusText}`)
                    console.error('Error response:', errorText)
                    throw new Error(`HTTP ${response.status}: ${errorText}`)
                  } else {
                    const result = await response.json()
                    console.log(`✅ [${index + 1}/${drivers.length}] Notification sent successfully to driver: ${driverName} (ID: ${driverId})`)
                    console.log(`   Message ID: ${result.response || 'N/A'}`)
                  }
                } catch (notifyError) {
                  const driverId = driver.id || driver.driver_id || 'unknown'
                  const driverName = driver.name || driver.driver_name || 'Unknown Driver'
                  console.error(`❌ [${index + 1}/${drivers.length}] Failed to send notification to driver ${driverName} (ID: ${driverId})`)
                  console.error('Error details:', notifyError.message)
                  // Don't throw - continue with other drivers
                }
              })
            )
            
            console.log(`\n✅ Completed sending notifications to ${drivers.length} driver(s)\n`)
          } else {
            console.log(`No drivers found for route: ${centerRoute}`)
          }
        } catch (broadcastError) {
          console.warn('Failed to send notifications to drivers:', broadcastError)
        }
      } else {
        console.warn('No route available for center, skipping driver notifications')
      }

      return docRef.id
    } catch (error) {
      console.error('Error creating collection request:', error)
      throw error
    }
  },
  
  async getRequestsByCenter(centerName) {
    try {
      const q = query(
        collectionRequestsRef,
        where('center_name', '==', centerName),
        where('sample_type', '==', 'center_requested'),
        orderBy('created_at', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }))
    } catch (error) {
      if (error.message && error.message.includes('requires an index')) {
        console.error('Index required. Please create the following index in Firebase Console:')
        console.error('Collection: collectionRequests')
        console.error('Fields to index: center_name Ascending, sample_type Ascending, created_at Descending')
      }
      console.error('Error fetching requests:', error)
      throw error
    }
  },
  
  async getRequestsByUser(userId) {
    try {
      // If user has center_id stored, query by that
      const q = query(
        collectionRequestsRef,
        where('center_id', '==', userId),
        orderBy('created_at', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }))
    } catch (error) {
      console.error('Error fetching user requests:', error)
      // Fallback: return empty array if query fails
      return []
    }
  },
  
  async getRequestsByCenterId(centerId) {
    try {
      const q = query(
        collectionRequestsRef,
        where('center_id', '==', centerId),
        where('sample_type', '==', 'center_requested'),
        orderBy('created_at', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }))
    } catch (error) {
      if (error.message && error.message.includes('requires an index')) {
        console.error('Index required. Please create the following index in Firebase Console:')
        console.error('Collection: collectionRequests')
        console.error('Fields to index: center_id Ascending, sample_type Ascending, created_at Descending')
      }
      console.error('Error fetching requests by center ID:', error)
      throw error
    }
  }
}

