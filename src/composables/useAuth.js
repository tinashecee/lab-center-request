import { ref } from 'vue'
import { authService } from '@/services/authService'
import { useRouter } from 'vue-router'

export function useAuth() {
  const router = useRouter()
  
  // Load user from localStorage immediately
  const storedUser = localStorage.getItem('user')
  const storedUserData = localStorage.getItem('userData')
  
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const userData = ref(storedUserData ? JSON.parse(storedUserData) : null)
  const loading = ref(false)
  const error = ref(null)
  
  const login = async (centerId) => {
    try {
      error.value = null
      loading.value = true
      const result = await authService.login(centerId)
      
      // Don't store user data yet if PIN verification is required
      // PIN setup/verification will be handled in Login.vue
      // Only store if PIN is not required (shouldn't happen, but handle it)
      if (!result.requiresPinSetup && !result.requiresPinVerification) {
        user.value = { centerId: result.userData.centerId }
        userData.value = result.userData
        
        localStorage.setItem('user', JSON.stringify(user.value))
        localStorage.setItem('userData', JSON.stringify(userData.value))
      }
      
      return result
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const completeLogin = (userDataToStore) => {
    // Store user data after PIN verification/setup
    user.value = { centerId: userDataToStore.centerId }
    userData.value = userDataToStore
    
    localStorage.setItem('user', JSON.stringify(user.value))
    localStorage.setItem('userData', JSON.stringify(userData.value))
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
    logout,
    completeLogin
  }
}
