<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-secondary-900">New Sample Collection Request</h1>
          <p class="mt-2 text-sm text-secondary-600">Fill in the details below to request a sample collection</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Center Name -->
          <div>
            <label for="center_name" class="block text-sm font-medium text-secondary-700 mb-2">
              Center Name <span class="text-red-500">*</span>
            </label>
            <input
              id="center_name"
              type="text"
              v-model="formData.center_name"
              required
              placeholder="Enter center name"
              class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Center Address -->
          <div>
            <label for="center_address" class="block text-sm font-medium text-secondary-700 mb-2">
              Center Address
            </label>
            <input
              id="center_address"
              type="text"
              v-model="formData.center_address"
              placeholder="Enter center address"
              class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Coordinates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="latitude" class="block text-sm font-medium text-secondary-700 mb-2">
                Latitude <span class="text-red-500">*</span>
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                v-model.number="formData.center_coordinates.lat"
                required
                placeholder="e.g., -17.8292"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label for="longitude" class="block text-sm font-medium text-secondary-700 mb-2">
                Longitude <span class="text-red-500">*</span>
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                v-model.number="formData.center_coordinates.lng"
                required
                placeholder="e.g., 31.0522"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <!-- Contact Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="caller_name" class="block text-sm font-medium text-secondary-700 mb-2">
                Contact Person Name
              </label>
              <input
                id="caller_name"
                type="text"
                v-model="formData.caller_name"
                placeholder="Enter contact person name"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label for="caller_number" class="block text-sm font-medium text-secondary-700 mb-2">
                Contact Phone Number <span class="text-red-500">*</span>
              </label>
              <input
                id="caller_number"
                type="tel"
                v-model="formData.caller_number"
                required
                placeholder="e.g., +263 77 123 4567"
                class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <!-- Priority -->
          <div>
            <label for="priority" class="block text-sm font-medium text-secondary-700 mb-2">
              Priority <span class="text-red-500">*</span>
            </label>
            <select
              id="priority"
              v-model="formData.priority"
              required
              class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <!-- Test Selection -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">
              Select Tests
            </label>
            <TestSelector v-model="selectedTests" />
          </div>

          <!-- Notes -->
          <div>
            <label for="notes" class="block text-sm font-medium text-secondary-700 mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="4"
              placeholder="Enter any additional information or special instructions..."
              class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-600">Request submitted successfully!</p>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4">
            <button
              type="button"
              @click="$router.push('/')"
              class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-secondary-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Submitting...' : 'Submit Request' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCollectionRequests } from '@/composables/useCollectionRequests'
import { useAuth } from '@/composables/useAuth'
import TestSelector from '@/components/TestSelector.vue'

const router = useRouter()
const { createRequest, loading, error } = useCollectionRequests()
const { userData } = useAuth()

const selectedTests = ref([])

const formData = reactive({
  center_name: '',
  center_address: '',
  center_coordinates: {
    lat: 0,
    lng: 0
  },
  caller_name: '',
  caller_number: '',
  priority: 'routine',
  notes: '',
  center_id: null
})

// Initialize form data when userData becomes available
watch(() => userData.value, (newUserData) => {
  if (newUserData) {
    formData.center_name = newUserData.center || ''
    formData.caller_name = newUserData.name || ''
    formData.center_id = newUserData.id || null
  }
}, { immediate: true })

const success = ref(false)

const handleSubmit = async () => {
  try {
    // Validate coordinates
    if (!formData.center_coordinates.lat || !formData.center_coordinates.lng) {
      error.value = 'Please provide valid coordinates'
      return
    }

    const requestData = {
      ...formData,
      test_ids: selectedTests.value.map(t => t.id),
      test_names: selectedTests.value.map(t => t.testName || t.testID),
      sample_type: selectedTests.value.length > 0 ? 'specific' : 'general'
    }

    await createRequest(requestData)
    success.value = true
    
    // Reset form after 2 seconds and redirect
    setTimeout(() => {
      router.push('/history')
    }, 2000)
  } catch (err) {
    console.error('Error submitting request:', err)
  }
}
</script>

