<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Backdrop -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="handleClose"></div>

      <!-- Modal -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Set Your PIN
              </h3>
              <p class="text-sm text-gray-500 mb-6">
                Please set a 4-digit PIN for security. You'll need this PIN to access your account in the future.
              </p>

              <!-- Error Message -->
              <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ error }}</p>
              </div>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- PIN Input -->
                <div>
                  <label for="pin" class="block text-sm font-medium text-gray-700 mb-2">
                    Enter 4-Digit PIN
                  </label>
                  <input
                    id="pin"
                    type="text"
                    v-model="pin"
                    maxlength="4"
                    pattern="[0-9]{4}"
                    inputmode="numeric"
                    required
                    autocomplete="off"
                    :class="[
                      'w-full px-4 py-3 text-center text-2xl tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.pin ? 'border-red-500' : 'border-gray-300'
                    ]"
                    placeholder="0000"
                    @input="validatePin"
                  />
                  <p v-if="errors.pin" class="mt-1 text-sm text-red-500">{{ errors.pin }}</p>
                </div>

                <!-- Confirm PIN Input -->
                <div>
                  <label for="confirmPin" class="block text-sm font-medium text-gray-700 mb-2">
                    Confirm PIN
                  </label>
                  <input
                    id="confirmPin"
                    type="text"
                    v-model="confirmPin"
                    maxlength="4"
                    pattern="[0-9]{4}"
                    inputmode="numeric"
                    required
                    autocomplete="off"
                    :class="[
                      'w-full px-4 py-3 text-center text-2xl tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                      errors.confirmPin ? 'border-red-500' : 'border-gray-300'
                    ]"
                    placeholder="0000"
                    @input="validateConfirmPin"
                  />
                  <p v-if="errors.confirmPin" class="mt-1 text-sm text-red-500">{{ errors.confirmPin }}</p>
                </div>

                <!-- Submit Buttons -->
                <div class="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    @click="handleClose"
                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading || !canSubmit"
                    class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {{ loading ? 'Setting PIN...' : 'Set PIN' }}
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
import { ref, reactive, computed, watch } from 'vue'
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

const emit = defineEmits(['close', 'pin-set'])

const pin = ref('')
const confirmPin = ref('')
const error = ref(null)
const loading = ref(false)

const errors = reactive({
  pin: '',
  confirmPin: ''
})

const canSubmit = computed(() => {
  return pin.value.length === 4 && 
         confirmPin.value.length === 4 && 
         pin.value === confirmPin.value &&
         /^\d{4}$/.test(pin.value)
})

const validatePin = () => {
  errors.pin = ''
  error.value = null
  
  if (pin.value.length > 0 && !/^\d+$/.test(pin.value)) {
    errors.pin = 'PIN must contain only numbers'
    return false
  }
  
  if (pin.value.length === 4 && !/^\d{4}$/.test(pin.value)) {
    errors.pin = 'PIN must be exactly 4 digits'
    return false
  }
  
  return true
}

const validateConfirmPin = () => {
  errors.confirmPin = ''
  error.value = null
  
  if (confirmPin.value.length > 0 && !/^\d+$/.test(confirmPin.value)) {
    errors.confirmPin = 'PIN must contain only numbers'
    return false
  }
  
  if (confirmPin.value.length === 4) {
    if (pin.value !== confirmPin.value) {
      errors.confirmPin = 'PINs do not match'
      return false
    }
  }
  
  return true
}

const resetForm = () => {
  pin.value = ''
  confirmPin.value = ''
  error.value = null
  errors.pin = ''
  errors.confirmPin = ''
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  error.value = null
  errors.pin = ''
  errors.confirmPin = ''
  
  // Validate PIN
  if (!/^\d{4}$/.test(pin.value)) {
    errors.pin = 'PIN must be exactly 4 digits'
    return
  }
  
  // Validate confirmation
  if (pin.value !== confirmPin.value) {
    errors.confirmPin = 'PINs do not match'
    return
  }
  
  loading.value = true
  
  try {
    await authService.setPin(props.centerId, pin.value)
    emit('pin-set')
    resetForm()
    handleClose()
  } catch (err) {
    console.error('Error setting PIN:', err)
    error.value = err.message || 'Failed to set PIN. Please try again.'
  } finally {
    loading.value = false
  }
}

// Reset form when modal closes
watch(() => props.isOpen, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>
