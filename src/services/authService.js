import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'

export const authService = {
  async login(email, password) {
    try {
      // Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Check center_users collection for approval status
      const centerUsersRef = collection(db, 'center_users')
      const centerUserQuery = query(centerUsersRef, where('email', '==', email))
      const centerUserSnapshot = await getDocs(centerUserQuery)
      
      if (!centerUserSnapshot.empty) {
        const centerUserData = centerUserSnapshot.docs[0].data()
        
        // Check approval status
        if (centerUserData.status === 'pending') {
          await firebaseSignOut(auth)
          throw new Error('Your account is pending approval. Please wait for administrator approval.')
        }
        
        if (centerUserData.status === 'rejected') {
          await firebaseSignOut(auth)
          throw new Error('Your account has been rejected. Please contact an administrator.')
        }
        
        // User is approved, return center user data
        if (centerUserData.status === 'approved') {
          return {
            authUser: userCredential.user,
            userData: {
              id: centerUserSnapshot.docs[0].id,
              name: centerUserData.name,
              email: centerUserData.email,
              phoneNumber: centerUserData.phoneNumber,
              center: centerUserData.centerName,
              centerId: centerUserData.centerId,
              role: 'Center User',
              department: 'Sample Collection',
              status: 'Active'
            }
          }
        }
      }
      
      // Fallback: Check users collection (for existing users)
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data()
        const userId = querySnapshot.docs[0].id
        
        // Check if user is active
        if (userData.status === 'Inactive') {
          await firebaseSignOut(auth)
          throw new Error('Your account is inactive. Please contact an administrator.')
        }
        
        return {
          authUser: userCredential.user,
          userData: { ...userData, id: userId }
        }
      }
      
      // User not found in either collection
      await firebaseSignOut(auth)
      throw new Error('User not found in system')
      
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password')
      }
      
      if (error.message) {
        throw error
      }
      
      throw new Error('Login failed. Please try again.')
    }
  },
  
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email is already registered')
      }
      
      if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters')
      }
      
      throw error
    }
  },
  
  async logout() {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },
  
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  },
  
  getCurrentUser() {
    return auth.currentUser
  }
}

