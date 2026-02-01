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
              <router-link to="/samples" class="px-3 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">Samples</router-link>
              <router-link to="/settings" class="px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900">Settings</router-link>
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
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-6 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-secondary-900">Sample Management</h1>
          <p class="mt-2 text-sm text-secondary-600">View and manage all your sample collection requests</p>
        </div>
        <button
          @click="showRequestModal = true"
          class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          New Request
        </button>
      </div>

      <!-- Filters and Controls -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Search..."
              class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Items per page -->
          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-700">Items per page:</span>
            <select
              v-model="itemsPerPage"
              @change="currentPage = 1"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option :value="20">20</option>
              <option :value="40">40</option>
              <option :value="60">60</option>
              <option :value="100">100</option>
              <option :value="-1">All</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabs for Statuses -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex justify-center border-b border-gray-200 overflow-x-auto">
          <button
            v-for="tabStatus in statuses"
            :key="tabStatus"
            @click="setStatus(tabStatus)"
            :class="[
              'px-4 py-2 text-sm font-medium whitespace-nowrap',
              status === tabStatus
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ formatStatusLabel(tabStatus) }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p class="mt-4 text-secondary-600">Loading samples...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-4 text-center text-red-600 bg-red-50">
          <p>{{ error }}</p>
          <button
            @click="fetchSamples"
            class="mt-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredSamples.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-secondary-900">No samples found</h3>
          <p class="mt-2 text-sm text-secondary-600">No samples with status "{{ formatStatusLabel(status) }}" found.</p>
        </div>

        <!-- Samples Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="header in getHeadersForStatus(status)"
                  :key="header.field"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="sample in paginatedSamples"
                :key="sample.id"
                @click="selectSample(sample)"
                class="hover:bg-gray-50 cursor-pointer"
              >
                <td
                  v-for="header in getHeadersForStatus(status)"
                  :key="`${sample.id}-${header.field}`"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  <span v-if="header.field === 'sample_id'">
                    {{ sample.sample_id || sample.id }}
                  </span>
                  <span v-else-if="header.field === 'requested_at'">
                    {{ formatDate(sample.requested_at) }}
                  </span>
                  <span v-else-if="header.field === 'time_lapsed'">
                    {{ calculateTimeLapsed(sample.requested_at) }}
                  </span>
                  <span v-else-if="header.field === 'center_name'">
                    {{ sample.center_name || 'N/A' }}
                  </span>
                  <span v-else-if="header.field === 'priority'">
                    <span :class="getPriorityClass(sample.priority)">
                      {{ formatPriority(sample.priority) }}
                    </span>
                  </span>
                  <span v-else-if="header.field === 'status'">
                    <span :class="getStatusClass(sample.status)">
                      {{ formatStatus(sample.status) }}
                    </span>
                  </span>
                  <span v-else-if="header.field === 'collected_at'">
                    {{ formatDate(sample.collected_at) }}
                  </span>
                  <span v-else-if="header.field === 'patient_name'">
                    {{ sample.patient_name || sample.caller_name || 'N/A' }}
                  </span>
                  <span v-else-if="header.field === 'center_address'">
                    {{ sample.center_address || 'N/A' }}
                  </span>
                  <span v-else-if="header.field === 'caller_name'">
                    {{ sample.caller_name || 'N/A' }}
                  </span>
                  <span v-else-if="header.field === 'caller_number'">
                    {{ sample.caller_number || 'N/A' }}
                  </span>
                  <span v-else-if="header.field === 'notes'">
                    {{ sample.notes || 'N/A' }}
                  </span>
                  <span v-else-if="header.field === 'actions'">
                    <button
                      v-if="(status === 'completed' || status === 'delivered') && sample.reportURL"
                      @click.stop="viewReport(sample.reportURL)"
                      class="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                    >
                      View Report
                    </button>
                    <span v-else class="text-gray-400 text-xs">-</span>
                  </span>
                  <span v-else>
                    {{ sample[header.field] || 'N/A' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="itemsPerPage !== -1 && filteredSamples.length > 0" class="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredSamples.length) }}</span>
                of
                <span class="font-medium">{{ filteredSamples.length }}</span>
                results
                <span class="ml-2 text-xs text-gray-500">
                  (Page {{ currentPage }} of {{ totalPages }})
                </span>
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="currentPage = Math.max(1, currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {{ currentPage }} of {{ totalPages }}
                </span>
                <button
                  @click="currentPage = Math.min(totalPages, currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Center Request Modal -->
    <CenterRequestModal
      :isOpen="showRequestModal"
      @close="showRequestModal = false"
      @request-created="handleRequestCreated"
    />

    <!-- Sample Details Modal -->
    <SampleDetailsModal
      :sample="selectedSample"
      @close="selectedSample = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { collectionRequestService } from '@/services/collectionRequestService'
import CenterRequestModal from '@/components/CenterRequestModal.vue'
import SampleDetailsModal from '@/components/SampleDetailsModal.vue'

const { userData, logout } = useAuth()

const samples = ref([])
const loading = ref(false)
const error = ref(null)
const status = ref('pending')
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(20)
const showRequestModal = ref(false)
const selectedSample = ref(null)

const statuses = [
  'pending',
  'accepted',
  'collected',
  'registered',
  'received',
  'completed',
  'delivered',
  'cancelled'
]

const getHeadersForStatus = (currentStatus) => {
  const headers = {
    pending: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Requested At', field: 'requested_at' },
      { label: 'Time Lapsed', field: 'time_lapsed' },
      { label: 'Center Name', field: 'center_name' },
      { label: 'Priority', field: 'priority' }
    ],
    accepted: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Requested At', field: 'requested_at' },
      { label: 'Time Lapsed', field: 'time_lapsed' },
      { label: 'Center Name', field: 'center_name' },
      { label: 'Priority', field: 'priority' }
    ],
    collected: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Time Requested', field: 'requested_at' },
      { label: 'Time Lapsed', field: 'time_lapsed' },
      { label: 'Collected At', field: 'collected_at' },
      { label: 'Patient Name', field: 'patient_name' },
      { label: 'Center', field: 'center_name' },
      { label: 'Priority', field: 'priority' }
    ],
    registered: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Patient Name', field: 'patient_name' },
      { label: 'Center', field: 'center_name' },
      { label: 'Time Requested', field: 'requested_at' },
      { label: 'Time Lapsed', field: 'time_lapsed' },
      { label: 'Priority', field: 'priority' }
    ],
    received: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Patient Name', field: 'patient_name' },
      { label: 'Center', field: 'center_name' },
      { label: 'Time Requested', field: 'requested_at' },
      { label: 'Time Lapsed', field: 'time_lapsed' }
    ],
    completed: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Patient Name', field: 'patient_name' },
      { label: 'Center', field: 'center_name' },
      { label: 'Time Requested', field: 'requested_at' },
      { label: 'Time Lapsed', field: 'time_lapsed' },
      { label: 'Priority', field: 'priority' },
      { label: 'Actions', field: 'actions' }
    ],
    delivered: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Patient Name', field: 'patient_name' },
      { label: 'Center', field: 'center_name' },
      { label: 'Time Requested', field: 'requested_at' },
      { label: 'Time Lapsed', field: 'time_lapsed' },
      { label: 'Actions', field: 'actions' }
    ],
    cancelled: [
      { label: 'Sample ID', field: 'sample_id' },
      { label: 'Patient Name', field: 'patient_name' },
      { label: 'Center', field: 'center_name' },
      { label: 'Time Lapsed', field: 'time_lapsed' }
    ]
  }
  return headers[currentStatus] || headers.pending
}

const filteredSamples = computed(() => {
  let filtered = [...samples.value]

  // Filter by status
  if (status.value !== 'all') {
    filtered = filtered.filter(s => s.status === status.value)
  }

  // Search filter
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(term)
      )
    )
  }

  return filtered
})

const totalPages = computed(() => {
  if (itemsPerPage.value === -1) return 1
  return Math.ceil(filteredSamples.value.length / itemsPerPage.value)
})

const paginatedSamples = computed(() => {
  if (itemsPerPage.value === -1) {
    return filteredSamples.value
  }
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSamples.value.slice(start, end)
})

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    accepted: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    collected: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    registered: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800',
    received: 'px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800',
    processing: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800',
    completed: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    delivered: 'px-2 py-1 text-xs font-medium rounded-full bg-green-200 text-green-900',
    cancelled: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
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
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
}

const formatStatusLabel = (status) => {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
}

const formatPriority = (priority) => {
  return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Routine'
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

const calculateTimeLapsed = (requestedAt) => {
  if (!requestedAt) return 'N/A'
  
  let start
  if (requestedAt.toDate) {
    start = requestedAt.toDate().getTime()
  } else if (typeof requestedAt === 'string') {
    start = new Date(requestedAt).getTime()
  } else {
    start = new Date(requestedAt).getTime()
  }
  
  const now = new Date().getTime()
  const diffInSeconds = Math.floor((now - start) / 1000)
  const days = Math.floor(diffInSeconds / (3600 * 24))
  const hours = Math.floor((diffInSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((diffInSeconds % 3600) / 60)
  const seconds = diffInSeconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  return parts.join(' ')
}

const setStatus = (newStatus) => {
  status.value = newStatus
  currentPage.value = 1
  fetchSamples()
}

const fetchSamples = async () => {
  loading.value = true
  error.value = null
  
  try {
    if (userData.value?.centerId) {
      samples.value = await collectionRequestService.getRequestsByCenterId(userData.value.centerId)
    } else if (userData.value?.center) {
      samples.value = await collectionRequestService.getRequestsByCenter(userData.value.center)
    } else {
      samples.value = []
    }
  } catch (err) {
    console.error('Error fetching samples:', err)
    error.value = 'Failed to load samples. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleRequestCreated = () => {
  fetchSamples()
}

const selectSample = (sample) => {
  selectedSample.value = sample
}

const viewReport = (reportURL) => {
  if (reportURL) {
    window.open(reportURL, '_blank')
  } else {
    alert('No report URL available for this sample')
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// Watch for status changes to reset pagination
watch(() => status.value, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchSamples()
})
</script>
