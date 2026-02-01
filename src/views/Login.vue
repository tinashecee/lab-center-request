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
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              v-model="password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {{ loading ? 'Logging in...' : 'Log In' }}
          </button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const centerId = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

const handleSubmit = async () => {
  error.value = null
  loading.value = true

  try {
    await login(centerId.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Failed to log in. Please check your credentials.'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>
