import { ref } from 'vue'
import { collectionRequestService } from '@/services/collectionRequestService'

export function useCollectionRequests() {
  const requests = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const createRequest = async (requestData) => {
    try {
      loading.value = true
      error.value = null
      const requestId = await collectionRequestService.createRequest(requestData)
      return requestId
    } catch (err) {
      error.value = err.message || 'Failed to create request'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchRequestsByCenter = async (centerName) => {
    try {
      loading.value = true
      error.value = null
      requests.value = await collectionRequestService.getRequestsByCenter(centerName)
      return requests.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch requests'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchRequestsByUser = async (userId) => {
    try {
      loading.value = true
      error.value = null
      requests.value = await collectionRequestService.getRequestsByUser(userId)
      return requests.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch requests'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    requests,
    loading,
    error,
    createRequest,
    fetchRequestsByCenter,
    fetchRequestsByUser
  }
}

