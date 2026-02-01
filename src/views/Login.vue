<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <img
          src="/images/logo.png"
          alt="Lab Partners"
          class="mx-auto h-16 w-auto"
        />
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Welcome Back
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Sign in to access your account
        </p>
      </div>

      <div class="mt-8 bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="centerId" class="block text-sm font-medium text-gray-700">
              Center ID
            </label>
            <input
              id="centerId"
              type="text"
              required
              v-model="centerId"
              :disabled="loading || showPinSetup || showPinEntry"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your center ID"
            />
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || showPinSetup || showPinEntry"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>
      </div>

      <!-- PIN Setup Modal -->
      <PinSetupModal
        :isOpen="showPinSetup"
        :centerId="centerIdForPin"
        @close="handlePinSetupClose"
        @pin-set="handlePinSet"
      />

      <!-- PIN Entry Modal -->
      <PinEntryModal
        :isOpen="showPinEntry"
        :centerId="centerIdForPin"
        @close="handlePinEntryClose"
        @pin-verified="handlePinVerified"
      />

      <div class="text-center text-sm text-gray-600">
        <p>Lab Partners Management System V2.0</p>
        <p class="mt-1">
          Powered by
          <a
            href="https://soxfort.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-600 hover:text-primary-700"
          >
            Soxfort Solutions
          </a>
          - Intuitive Innovation © {{ new Date().getFullYear() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import PinSetupModal from '@/components/PinSetupModal.vue'
import PinEntryModal from '@/components/PinEntryModal.vue'

const router = useRouter()
const { login, completeLogin } = useAuth()

const centerId = ref('')
const error = ref(null)
const loading = ref(false)
const showPinSetup = ref(false)
const showPinEntry = ref(false)
const centerIdForPin = ref('')
const userDataForPin = ref(null)

const handleSubmit = async () => {
  error.value = null
  loading.value = true

  try {
    const result = await login(centerId.value)
    
    // Check if PIN setup is required
    if (result.requiresPinSetup) {
      centerIdForPin.value = result.centerDocId || centerId.value
      userDataForPin.value = result.userData
      showPinSetup.value = true
      loading.value = false
      return
    }
    
    // Check if PIN verification is required
    if (result.requiresPinVerification) {
      centerIdForPin.value = result.centerDocId || centerId.value
      userDataForPin.value = result.userData
      showPinEntry.value = true
      loading.value = false
      return
    }
    
    // No PIN required (shouldn't happen, but handle it)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Failed to log in. Please check your center ID.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}

const handlePinSetupClose = () => {
  showPinSetup.value = false
  centerId.value = ''
  centerIdForPin.value = ''
  userDataForPin.value = null
}

const handlePinSet = () => {
  // PIN has been set, complete the login
  showPinSetup.value = false
  if (userDataForPin.value) {
    // Store user data and navigate
    completeLogin(userDataForPin.value)
    router.push('/')
  }
}

const handlePinEntryClose = () => {
  showPinEntry.value = false
  centerId.value = ''
  centerIdForPin.value = ''
  userDataForPin.value = null
}

const handlePinVerified = () => {
  // PIN verified, complete the login
  showPinEntry.value = false
  if (userDataForPin.value) {
    // Store user data and navigate
    completeLogin(userDataForPin.value)
    router.push('/')
  }
}
</script>
