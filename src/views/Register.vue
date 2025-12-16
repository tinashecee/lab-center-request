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
          Create Account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Register for sample collection requests
        </p>
      </div>

      <div class="mt-8 bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              v-model="formData.name"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                errors.name ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="Enter your full name"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              v-model="formData.email"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                errors.email ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="Enter your email"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              v-model="formData.phoneNumber"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="e.g., +263 77 123 4567"
            />
            <p v-if="errors.phoneNumber" class="mt-1 text-sm text-red-600">{{ errors.phoneNumber }}</p>
          </div>

          <!-- Center Selection -->
          <div>
            <label for="center" class="block text-sm font-medium text-gray-700">
              Center <span class="text-red-500">*</span>
            </label>
            <select
              id="center"
              required
              v-model="formData.centerId"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                errors.centerId ? 'border-red-300' : 'border-gray-300'
              ]"
              :disabled="loadingCenters"
            >
              <option value="">Select a center</option>
              <option v-for="center in centers" :key="center.id" :value="center.id">
                {{ center.name }}
              </option>
            </select>
            <p v-if="errors.centerId" class="mt-1 text-sm text-red-600">{{ errors.centerId }}</p>
            <p v-if="loadingCenters" class="mt-1 text-sm text-gray-500">Loading centers...</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              required
              v-model="formData.password"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                errors.password ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="Minimum 6 characters"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm Password <span class="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              v-model="formData.confirmPassword"
              :class="[
                'mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              ]"
              placeholder="Confirm your password"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="p-3 bg-green-50 border border-green-200 rounded-md">
            <p class="text-sm text-green-600">
              Registration successful! Your account is pending approval. You will be able to login once approved.
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || loadingCenters"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? 'Registering...' : 'Register' }}
          </button>

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <router-link to="/login" class="text-primary-600 hover:text-primary-700 font-medium">
                Login here
              </router-link>
            </p>
          </div>
        </form>
      </div>

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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { centerUserService } from '@/services/centerUserService'
import { centerService } from '@/services/centerService'
import { signOut } from 'firebase/auth'
import { auth } from '@/services/firebase'

const router = useRouter()

const formData = reactive({
  name: '',
  email: '',
  phoneNumber: '',
  centerId: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({})
const error = ref(null)
const success = ref(false)
const loading = ref(false)
const loadingCenters = ref(false)
const centers = ref([])

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  let isValid = true
  
  // Name validation
  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }
  
  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Phone validation
  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required'
    isValid = false
  }
  
  // Center validation
  if (!formData.centerId) {
    errors.centerId = 'Please select a center'
    isValid = false
  }
  
  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }
  
  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  return isValid
}

const checkEmailUniqueness = async () => {
  try {
    const existingUser = await centerUserService.getCenterUserByEmail(formData.email)
    if (existingUser) {
      errors.email = 'This email is already registered'
      return false
    }
    return true
  } catch (err) {
    console.error('Error checking email:', err)
    return true // Allow to proceed if check fails
  }
}

const handleSubmit = async () => {
  error.value = null
  success.value = false
  
  if (!validateForm()) {
    return
  }
  
  // Check email uniqueness
  const emailAvailable = await checkEmailUniqueness()
  if (!emailAvailable) {
    return
  }
  
  loading.value = true
  
  try {
    // Find selected center name
    const selectedCenter = centers.value.find(c => c.id === formData.centerId)
    if (!selectedCenter) {
      throw new Error('Selected center not found')
    }
    
    // Create Firebase Auth account
    const authUser = await authService.register(formData.email, formData.password)
    
    // Save to center_users collection
    await centerUserService.registerCenterUser({
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      centerId: formData.centerId,
      centerName: selectedCenter.name
    })
    
    // Sign out immediately (user needs approval)
    await signOut(auth)
    
    success.value = true
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/login')
    }, 3000)
    
  } catch (err) {
    console.error('Registration error:', err)
    error.value = err.message || 'Registration failed. Please try again.'
    
    // If Firebase Auth account was created but Firestore save failed, try to clean up
    if (auth.currentUser) {
      try {
        await signOut(auth)
      } catch (signOutError) {
        console.error('Error signing out:', signOutError)
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadingCenters.value = true
  try {
    centers.value = await centerService.getCenters()
  } catch (err) {
    console.error('Error loading centers:', err)
    error.value = 'Failed to load centers. Please refresh the page.'
  } finally {
    loadingCenters.value = false
  }
})
</script>

