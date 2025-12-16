import { ref, onUnmounted } from 'vue'
import { authService } from '@/services/authService'
import { useRouter } from 'vue-router'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/services/firebase'

export function useAuth() {
  const user = ref(null)
  const userData = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const router = useRouter()
  
  // Listen to auth state changes
  const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser
      
      // Check center_users collection first
      try {
        const centerUsersRef = collection(db, 'center_users')
        const centerUserQuery = query(centerUsersRef, where('email', '==', firebaseUser.email))
        const centerUserSnapshot = await getDocs(centerUserQuery)
        
        if (!centerUserSnapshot.empty) {
          const centerUserData = centerUserSnapshot.docs[0].data()
          userData.value = {
            id: centerUserSnapshot.docs[0].id,
            name: centerUserData.name,
            email: centerUserData.email,
            phoneNumber: centerUserData.phoneNumber,
            center: centerUserData.centerName,
            centerId: centerUserData.centerId,
            role: 'Center User',
            department: 'Sample Collection',
            status: centerUserData.status === 'approved' ? 'Active' : centerUserData.status
          }
        } else {
          // Fallback: Check users collection (for existing users)
          const usersRef = collection(db, 'users')
          const q = query(usersRef, where('email', '==', firebaseUser.email))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data()
            userData.value = { ...data, id: querySnapshot.docs[0].id }
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err)
      }
    } else {
      user.value = null
      userData.value = null
    }
    loading.value = false
  })
  
  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
  
  const login = async (email, password) => {
    try {
      error.value = null
      loading.value = true
      const result = await authService.login(email, password)
      user.value = result.authUser
      userData.value = result.userData
      return result
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const logout = async () => {
    try {
      await authService.logout()
      user.value = null
      userData.value = null
      router.push('/login')
    } catch (err) {
      error.value = err.message || 'Logout failed'
      throw err
    }
  }
  
  return {
    user,
    userData,
    loading,
    error,
    login,
    logout
  }
}

