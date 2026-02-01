<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-6">
            <img src="/images/logo.png" alt="Lab Partners" class="h-8 w-auto" />
            <nav class="hidden md:flex gap-4">
              <router-link to="/" class="px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900">Dashboard</router-link>
              <router-link to="/samples" class="px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900">Samples</router-link>
              <router-link to="/settings" class="px-3 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">Settings</router-link>
            </nav>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-secondary-600">{{ userData?.name || userData?.email }}</span>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm text-secondary-700 hover:text-secondary-900 focus:outline-none"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-secondary-900">Account Settings</h1>
        <p class="mt-2 text-sm text-secondary-600">Update your account information</p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-secondary-700 mb-2">
              Full Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              v-model="formData.name"
              required
              :class="[
                'w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.name ? 'border-red-300' : 'border-gray-200'
              ]"
              placeholder="Enter your full name"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-secondary-700 mb-2">
              Email <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              v-model="formData.email"
              required
              :class="[
                'w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.email ? 'border-red-300' : 'border-gray-200'
              ]"
              placeholder="Enter your email"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-secondary-700 mb-2">
              Phone Number <span class="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              v-model="formData.phoneNumber"
              required
              :class="[
                'w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.phoneNumber ? 'border-red-300' : 'border-gray-200'
              ]"
              placeholder="e.g., +263 77 123 4567"
            />
            <p v-if="errors.phoneNumber" class="mt-1 text-sm text-red-600">{{ errors.phoneNumber }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-600">{{ typeof success === 'string' ? success : 'Account updated successfully!' }}</p>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-4">
            <button
              type="button"
              @click="resetForm"
              class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-secondary-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/services/firebase'

const router = useRouter()
const { userData, logout } = useAuth()

const formData = reactive({
  name: '',
  email: '',
  phoneNumber: ''
})

const errors = reactive({})
const error = ref(null)
const success = ref(null)
const loading = ref(false)

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  
  let isValid = true
  
  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = 'Phone number is required'
    isValid = false
  }
  
  return isValid
}

const resetForm = () => {
  formData.name = userData.value?.name || ''
  formData.email = userData.value?.email || ''
  formData.phoneNumber = userData.value?.phoneNumber || ''
  error.value = null
  success.value = null
  Object.keys(errors).forEach(key => delete errors[key])
}

const handleSubmit = async () => {
  error.value = null
  success.value = null
  
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    // Update center user in Firestore
    const userDoc = doc(db, 'center_users', userData.value.id)
    const updateData = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(userDoc, updateData)
    
    // Update local user data and localStorage
    userData.value.name = formData.name
    userData.value.email = formData.email
    userData.value.phoneNumber = formData.phoneNumber
    
    // Update localStorage
    localStorage.setItem('userData', JSON.stringify(userData.value))
    
    success.value = 'Account updated successfully!'
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      success.value = null
    }, 5000)
    
  } catch (err) {
    console.error('Error updating account:', err)
    error.value = err.message || 'Failed to update account. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('Logout error:', err)
  }
}

onMounted(() => {
  // Initialize form with current user data
  formData.name = userData.value?.name || ''
  formData.email = userData.value?.email || ''
  formData.phoneNumber = userData.value?.phoneNumber || ''
})
</script>
