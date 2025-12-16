<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
        @click="handleClose"
      />

      <!-- Modal -->
      <div class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="px-4 pt-5 pb-4 bg-white sm:p-6">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-secondary-900">
              Request Sample Collection
            </h3>
            <button
              @click="handleClose"
              class="p-1 text-secondary-400 hover:text-secondary-500 rounded-full focus:outline-none"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {{ error }}
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Center (Display Only) -->
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Collection Center
              </label>
              <input
                type="text"
                :value="userData?.center || 'Not available'"
                disabled
                class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-secondary-600 cursor-not-allowed"
              />
            </div>

            <!-- Caller Name (Display Only) -->
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                :value="userData?.name || 'Not available'"
                disabled
                class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-secondary-600 cursor-not-allowed"
              />
            </div>

            <!-- Caller Number (Display Only) -->
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                :value="userData?.phoneNumber || 'Not available'"
                disabled
                class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-secondary-600 cursor-not-allowed"
              />
            </div>

            <!-- Priority -->
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Priority <span class="text-red-500">*</span>
              </label>
              <select
                v-model="formData.priority"
                required
                :class="[
                  'w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500',
                  formErrors.priority ? 'border-red-500' : 'border-gray-200'
                ]"
              >
                <option value="">Select priority...</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
              <p v-if="formErrors.priority" class="mt-1 text-sm text-red-500">
                {{ formErrors.priority }}
              </p>
            </div>

            <!-- Call Notes -->
            <div>
              <label class="block text-sm font-medium text-secondary-700 mb-1">
                Notes
              </label>
              <textarea
                v-model="formData.callNotes"
                rows="3"
                placeholder="Enter any additional information or special instructions..."
                class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <!-- Submit Buttons -->
            <div class="flex justify-end gap-3 mt-6">
              <button
                type="button"
                @click="handleClose"
                class="px-4 py-2 text-sm text-secondary-600 hover:text-secondary-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loading || !canSubmit"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {{ loading ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useCollectionRequests } from '@/composables/useCollectionRequests'
import { centerService } from '@/services/centerService'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'request-created'])

const { userData } = useAuth()
const { createRequest, loading, error: requestError } = useCollectionRequests()

const error = ref(null)
const formData = reactive({
  priority: '',
  callNotes: ''
})

const formErrors = reactive({
  priority: ''
})

// Check if form can be submitted
const canSubmit = computed(() => {
  return formData.priority && userData.value?.center && userData.value?.centerId
})

// Reset form when modal closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

const resetForm = () => {
  formData.priority = ''
  formData.callNotes = ''
  formErrors.priority = ''
  error.value = null
}

const validateForm = () => {
  formErrors.priority = ''
  let isValid = true

  if (!formData.priority) {
    formErrors.priority = 'Priority is required'
    isValid = false
  }

  if (!userData.value?.center) {
    error.value = 'Center information is not available. Please contact support.'
    isValid = false
  }

  if (!userData.value?.centerId) {
    error.value = 'Center ID is not available. Please contact support.'
    isValid = false
  }

  return isValid
}

const getCoordinates = async (address) => {
  const apiKey = '1796b7c0c7384fed9f9f0cf3ea518eae'
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length === 0) {
      console.warn(`⚠️ No coordinates found for: ${address}`)
      return { lat: -17.8048449, lng: 31.093114 }
    }

    const { lat, lon } = data.features[0].properties
    console.log(`✅ Coordinates found: ${lat}, ${lon}`)

    return { lat, lng: lon }
  } catch (error) {
    console.error('❌ Error fetching coordinates:', error)
    return { lat: -17.8048449, lng: 31.093114 }
  }
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  error.value = null

  if (!validateForm()) {
    return
  }

  try {
    // Get center details to fetch address if needed
    let centerAddress = ''
    let centerCoordinates = { lat: 0, lng: 0 }

    // Try to get center details from centerService
    try {
      const centerDetails = await centerService.getCenterById(userData.value.centerId)
      if (centerDetails) {
        centerAddress = centerDetails.address || ''
        // If center has coordinates, use them; otherwise geocode
        if (centerDetails.coordinates?.lat && centerDetails.coordinates?.lng) {
          centerCoordinates = {
            lat: centerDetails.coordinates.lat,
            lng: centerDetails.coordinates.lng
          }
        } else if (centerAddress) {
          // Geocode the address
          centerCoordinates = await getCoordinates(centerAddress)
        }
      }
    } catch (err) {
      console.warn('Could not fetch center details, using geocoding fallback:', err)
    }

    // If we still don't have coordinates, try geocoding the center name
    if (!centerCoordinates.lat && !centerCoordinates.lng && userData.value.center) {
      centerCoordinates = await getCoordinates(userData.value.center)
    }

    // Prepare request data
    const requestData = {
      center_name: userData.value.center,
      center_id: userData.value.centerId,
      center_address: centerAddress || userData.value.center,
      center_coordinates: {
        lat: centerCoordinates.lat,
        lng: centerCoordinates.lng
      },
      caller_name: userData.value.name || '',
      caller_number: userData.value.phoneNumber || '',
      priority: formData.priority,
      notes: formData.callNotes || '',
      sample_type: 'center_requested'
    }

    // Create the request
    await createRequest(requestData)

    // Emit success event
    emit('request-created')
    
    // Close modal and reset form
    resetForm()
    handleClose()
  } catch (err) {
    console.error('Error submitting request:', err)
    error.value = err.message || 'Failed to submit request. Please try again.'
  }
}

// Watch for request errors from the composable
watch(() => requestError.value, (newError) => {
  if (newError) {
    error.value = newError
  }
})
</script>

