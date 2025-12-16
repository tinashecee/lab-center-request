import { ref } from 'vue'
import { testService } from '@/services/testService'

export function useTests() {
  const tests = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchTerm = ref('')
  
  const fetchTests = async () => {
    try {
      loading.value = true
      error.value = null
      tests.value = await testService.getAllTests()
      return tests.value
    } catch (err) {
      error.value = err.message || 'Failed to fetch tests'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const searchTests = async (term) => {
    try {
      loading.value = true
      error.value = null
      searchTerm.value = term
      if (!term) {
        tests.value = await testService.getAllTests()
      } else {
        tests.value = await testService.searchTests(term)
      }
      return tests.value
    } catch (err) {
      error.value = err.message || 'Failed to search tests'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Auto-fetch on initialization
  fetchTests()
  
  return {
    tests,
    loading,
    error,
    searchTerm,
    fetchTests,
    searchTests
  }
}

