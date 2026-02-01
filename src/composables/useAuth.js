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
  
  const login = async (centerId, password) => {
    try {
      error.value = null
      loading.value = true
      const result = await authService.login(centerId, password)
      
      // Store in localStorage
      user.value = { centerId: result.userData.centerId }
      userData.value = result.userData
      
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('userData', JSON.stringify(userData.value))
      
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
