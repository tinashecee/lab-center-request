import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export const authService = {
  async login(centerId, password) {
    try {
      // Query center_users by center_id
      const centerUsersRef = collection(db, 'center_users')
      const centerUserQuery = query(centerUsersRef, where('center_id', '==', centerId))
      const centerUserSnapshot = await getDocs(centerUserQuery)
      
      if (centerUserSnapshot.empty) {
        throw new Error('Invalid center ID or password')
      }

      const centerDoc = centerUserSnapshot.docs[0]
      const centerUserData = centerDoc.data()

      // Verify password (assuming it's stored in the collection)
      if (centerUserData.password !== password) {
        throw new Error('Invalid center ID or password')
      }

      // Check approval status
      if (centerUserData.status === 'pending') {
        throw new Error('Your account is pending approval. Please wait for administrator approval.')
      }
      
      if (centerUserData.status === 'rejected') {
        throw new Error('Your account has been rejected. Please contact an administrator.')
      }

      if (centerUserData.status !== 'approved') {
        throw new Error('Your account is not approved yet.')
      }

      // Return user data
      return {
        userData: {
          id: centerDoc.id,
          name: centerUserData.name,
          email: centerUserData.email,
          phoneNumber: centerUserData.phone || centerUserData.phoneNumber,
          center: centerUserData.center || centerUserData.centerName,
          centerId: centerUserData.center_id || centerUserData.centerId,
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
