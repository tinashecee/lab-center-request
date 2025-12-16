<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-secondary-900">Request History</h1>
        <p class="mt-2 text-sm text-secondary-600">View your previous sample collection requests</p>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <label class="text-sm font-medium text-secondary-700">Filter by Status:</label>
          <select
            v-model="statusFilter"
            class="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p class="mt-4 text-secondary-600">Loading requests...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-600">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredRequests.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-secondary-900">No requests found</h3>
        <p class="mt-2 text-sm text-secondary-600">You haven't submitted any sample collection requests yet.</p>
        <div class="mt-6">
          <router-link
            to="/new-request"
            class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Create New Request
          </router-link>
        </div>
      </div>

      <!-- Requests List -->
      <div v-else class="space-y-4">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-secondary-900">
                  {{ request.center_name }}
                </h3>
                <span :class="getStatusClass(request.status)">
                  {{ formatStatus(request.status) }}
                </span>
                <span :class="getPriorityClass(request.priority)">
                  {{ formatPriority(request.priority) }}
                </span>
              </div>
              
              <div class="space-y-2 text-sm text-secondary-600">
                <p v-if="request.center_address">
                  <span class="font-medium">Address:</span> {{ request.center_address }}
                </p>
                <p v-if="request.caller_name">
                  <span class="font-medium">Contact:</span> {{ request.caller_name }}
                </p>
                <p v-if="request.caller_number">
                  <span class="font-medium">Phone:</span> {{ request.caller_number }}
                </p>
                <p v-if="request.test_names && request.test_names.length > 0">
                  <span class="font-medium">Tests:</span> {{ request.test_names.join(', ') }}
                </p>
                <p v-if="request.notes">
                  <span class="font-medium">Notes:</span> {{ request.notes }}
                </p>
                <p v-if="request.requested_at">
                  <span class="font-medium">Requested:</span> {{ formatDate(request.requested_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCollectionRequests } from '@/composables/useCollectionRequests'
import { useAuth } from '@/composables/useAuth'

const { requests, loading, error, fetchRequestsByCenter, fetchRequestsByUser } = useCollectionRequests()
const { userData } = useAuth()

const statusFilter = ref('all')

const filteredRequests = computed(() => {
  if (statusFilter.value === 'all') {
    return requests.value
  }
  return requests.value.filter(r => r.status === statusFilter.value)
})

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    processing: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    completed: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    rejected: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
}

const getPriorityClass = (priority) => {
  const classes = {
    routine: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800',
    urgent: 'px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800',
    emergency: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
  }
  return classes[priority] || 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
}

const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatPriority = (priority) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A'
  
  let date
  if (dateValue.toDate) {
    date = dateValue.toDate()
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue)
  } else {
    date = dateValue
  }
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(async () => {
  try {
    if (userData.value?.center) {
      await fetchRequestsByCenter(userData.value.center)
    } else if (userData.value?.id) {
      await fetchRequestsByUser(userData.value.id)
    }
  } catch (err) {
    console.error('Error fetching requests:', err)
  }
})
</script>

