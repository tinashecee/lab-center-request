<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Enter Your PIN
              </h3>
              <p class="text-sm text-gray-500 mb-6">
                Please enter your 4-digit PIN to continue.
              </p>

              <!-- Error Message -->
              <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ error }}</p>
              </div>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- PIN Input -->
                <div>
                  <label for="pin" class="block text-sm font-medium text-gray-700 mb-2">
                    4-Digit PIN
                  </label>
                  <input
                    id="pin"
                    ref="pinInput"
                    type="password"
                    v-model="pin"
                    maxlength="4"
                    pattern="[0-9]{4}"
                    inputmode="numeric"
                    required
                    autocomplete="off"
                    :class="[
                      'w-full px-4 py-3 text-center text-2xl tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                      error ? 'border-red-500' : 'border-gray-300'
                    ]"
                    placeholder="••••"
                    @input="handlePinInput"
                  />
                </div>

                <!-- Submit Buttons -->
                <div class="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    @click="handleCancel"
                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading || pin.length !== 4"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {{ loading ? 'Verifying...' : 'Verify PIN' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { authService } from '@/services/authService'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  centerId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'pin-verified'])

const pin = ref('')
const error = ref(null)
const loading = ref(false)
const pinInput = ref(null)

const handlePinInput = () => {
  // Only allow numeric input
  pin.value = pin.value.replace(/\D/g, '')
  error.value = null
}

const resetForm = () => {
  pin.value = ''
  error.value = null
}

const handleCancel = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  error.value = null
  
  // Validate PIN length
  if (pin.value.length !== 4) {
    error.value = 'PIN must be exactly 4 digits'
    return
  }
  
  // Validate numeric only
  if (!/^\d{4}$/.test(pin.value)) {
    error.value = 'PIN must contain only numbers'
    return
  }
  
  loading.value = true
  
  try {
    const result = await authService.verifyPin(props.centerId, pin.value)
    
    if (result.valid) {
      emit('pin-verified')
      resetForm()
    } else {
      error.value = result.error || 'Incorrect PIN. Please try again.'
      pin.value = ''
      // Focus back on input after a short delay
      await nextTick()
      if (pinInput.value) {
        pinInput.value.focus()
      }
    }
  } catch (err) {
    console.error('Error verifying PIN:', err)
    error.value = err.message || 'Failed to verify PIN. Please try again.'
    pin.value = ''
  } finally {
    loading.value = false
  }
}

// Focus input when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    resetForm()
    nextTick(() => {
      if (pinInput.value) {
        pinInput.value.focus()
      }
    })
  }
})

onMounted(() => {
  if (props.isOpen && pinInput.value) {
    pinInput.value.focus()
  }
})
</script>
