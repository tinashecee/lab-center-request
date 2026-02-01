import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export const authService = {
  async login(centerId) {
    try {
      // Query centers collection - try document ID first
      const centersRef = collection(db, 'centers')
      let centerDoc = null
      let centerData = null
      
      // First, try to get the document directly by ID
      try {
        const docRef = doc(db, 'centers', centerId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          centerDoc = docSnap
          centerData = docSnap.data()
        }
      } catch (docError) {
        console.log('Direct document access failed, trying query...', docError)
      }
      
      // If direct access failed, try querying by center_id field
      if (!centerDoc) {
        const centerQuery = query(centersRef, where('center_id', '==', centerId))
        const centerSnapshot = await getDocs(centerQuery)
        
        if (!centerSnapshot.empty) {
          centerDoc = centerSnapshot.docs[0]
          centerData = centerDoc.data()
        }
      }
      
      if (!centerDoc || !centerData) {
        throw new Error('Invalid center ID')
      }

      // TEMPORARILY DISABLED: Approval status check
      // Check approval status - centers might use 'active' instead of 'approved'
      // if (centerData.status === 'pending') {
      //   throw new Error('Your account is pending approval. Please wait for administrator approval.')
      // }
      // 
      // if (centerData.status === 'rejected' || centerData.status === 'inactive') {
      //   throw new Error('Your account has been rejected or is inactive. Please contact an administrator.')
      // }
      //
      // if (centerData.status !== 'approved' && centerData.status !== 'active') {
      //   throw new Error('Your account is not approved yet.')
      // }

      // Return user data mapped from centers collection
      return {
        userData: {
          id: centerDoc.id,
          name: centerData.contactPerson || centerData.name || centerData.docFullName || centerData.centerName || 'Center User',
          email: centerData.email || centerData.contactEmail || '',
          phoneNumber: centerData.docContact || centerData.phone || centerData.phoneNumber || '',
          center: centerData.name || centerData.docFullName || centerData.centerName || 'Unknown Center',
          centerId: centerDoc.id,
          address: centerData.docAddress || centerData.address || '',
          role: 'Center User',
          department: 'Sample Collection',
          status: 'Active'
        }
      }
      
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.message) {
        throw error
      }
      
      throw new Error('Login failed. Please try again.')
    }
  },
  
  async logout() {
    // Clear any stored session data
    localStorage.removeItem('user')
    localStorage.removeItem('userData')
  },

  getCurrentUser() {
    // Return user from localStorage if available
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  }
}
