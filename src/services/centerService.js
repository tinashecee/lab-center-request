import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

const centersRef = collection(db, 'centers')

export const centerService = {
  async getCenters() {
    try {
      const snapshot = await getDocs(centersRef)
      return snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data()
        return {
          id: docSnapshot.id,
          name: data.name || data.docFullName || data.centerName || 'Unknown Center',
          address: data.docAddress || data.address || '',
          phone: data.docContact || data.phone || '',
          contactPerson: data.contactPerson || '',
          coordinates: {
            lat: data.coordinates?.lat || 0,
            lng: data.coordinates?.lng || 0
          },
          status: data.status || 'active'
        }
      }).filter(center => center.status === 'active')
    } catch (error) {
      console.error('Error fetching centers:', error)
      throw error
    }
  },
  
  async getCenterById(centerId) {
    try {
      const q = query(centersRef, where('__name__', '==', centerId))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      const data = snapshot.docs[0].data()
      return {
        id: snapshot.docs[0].id,
        name: data.name || data.docFullName || data.centerName || 'Unknown Center',
        address: data.docAddress || data.address || '',
        phone: data.docContact || data.phone || '',
        contactPerson: data.contactPerson || '',
        coordinates: {
          lat: data.coordinates?.lat || 0,
          lng: data.coordinates?.lng || 0
        }
      }
    } catch (error) {
      console.error('Error fetching center by ID:', error)
      // Fallback: try direct document access
      try {
        const centerDoc = await getDoc(doc(db, 'centers', centerId))
        if (centerDoc.exists()) {
          const data = centerDoc.data()
          return {
            id: centerDoc.id,
            name: data.name || data.docFullName || data.centerName || 'Unknown Center',
            address: data.docAddress || data.address || '',
            phone: data.docContact || data.phone || '',
            contactPerson: data.contactPerson || '',
            coordinates: {
              lat: data.coordinates?.lat || 0,
              lng: data.coordinates?.lng || 0
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
      throw error
    }
  }
}

