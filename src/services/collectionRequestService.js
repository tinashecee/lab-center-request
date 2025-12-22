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

const collectionRequestsRef = collection(db, 'collectionRequests')
const activeDriversRef = collection(db, 'active_drivers')

export const collectionRequestService = {
  async createRequest(requestData) {
    try {
      const nowIso = new Date().toISOString()
      
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
        // Include test information if provided
        ...(requestData.test_ids ? { test_ids: requestData.test_ids } : {}),
        ...(requestData.test_names ? { test_names: requestData.test_names } : {}),
      }
      
      const docRef = await addDoc(collectionRequestsRef, sampleRequest)
      
      // Update the document with its ID after creation
      await updateDoc(doc(db, 'collectionRequests', docRef.id), {
        sample_id: docRef.id
      })

      // Broadcast notification to all ACTIVE drivers (non-blocking)
      try {
        const activeDriversQuery = query(activeDriversRef, where('status', '==', 'ACTIVE'))
        const activeDriversSnapshot = await getDocs(activeDriversQuery)
        const drivers = activeDriversSnapshot.docs
          .map(docSnap => docSnap.data())
          .filter(driver => !!driver.message_token)

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

        await Promise.all(
          drivers.map(async (driver) => {
            try {
              const response = await fetch('https://app.labpartners.co.zw/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  token: driver.message_token,
                  message,
                }),
              })

              if (!response.ok) {
                console.warn(
                  `Failed to send notification to driver ${driver.driver_id || driver.id || 'unknown'}`
                )
              }
            } catch (notifyError) {
              console.warn('Failed to send notification to driver', driver, notifyError)
            }
          })
        )
      } catch (broadcastError) {
        console.warn('Failed to broadcast notifications to active drivers:', broadcastError)
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

