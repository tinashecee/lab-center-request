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

