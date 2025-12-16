<template>
  <div v-if="sample" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
    <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-secondary-900">
            Sample Details
          </h2>
          <p class="text-sm text-gray-500">
            Sample ID: {{ formatFieldValue(sample.sample_id || sample.id) }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-lg font-semibold text-primary-600">
            Time Lapsed
          </div>
          <div class="text-2xl font-bold text-gray-900">
            {{ calculateTimeLapsed(sample.requested_at) }}
          </div>
        </div>
        <button
          @click="handleClose"
          class="ml-4 text-gray-500 hover:text-gray-700"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column - Patient & Sample Information -->
        <div class="space-y-6">
          <!-- Patient Information -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-secondary-900 mb-4">
              Patient Information
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Patient Name</p>
                <p class="text-sm text-gray-900">{{ sample.patient_name || sample.caller_name || 'Not provided' }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Contact Number</p>
                <p class="text-sm text-gray-900">{{ sample.caller_number || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Sample Information -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-secondary-900 mb-4">
              Sample Information
            </h3>
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Sample ID</p>
                  <p class="text-sm text-gray-900">{{ formatFieldValue(sample.sample_id || sample.id) }}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <span :class="getStatusClass(sample.status)">
                    {{ formatStatus(sample.status) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Priority</p>
                  <span :class="getPriorityClass(sample.priority)">
                    {{ formatPriority(sample.priority) }}
                  </span>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Center</p>
                  <p class="text-sm text-gray-900">{{ sample.center_name || 'N/A' }}</p>
                </div>
              </div>
              <div v-if="sample.center_address">
                <p class="text-sm font-medium text-gray-500">Center Address</p>
                <p class="text-sm text-gray-900">{{ sample.center_address }}</p>
              </div>
              <div v-if="sample.notes">
                <p class="text-sm font-medium text-gray-500">Notes</p>
                <p class="text-sm text-gray-900">{{ sample.notes }}</p>
              </div>
              <div v-if="sample.test_names && sample.test_names.length > 0">
                <p class="text-sm font-medium text-gray-500">Tests</p>
                <p class="text-sm text-gray-900">{{ Array.isArray(sample.test_names) ? sample.test_names.join(', ') : sample.test_names }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Timeline -->
        <div class="space-y-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-secondary-900 mb-4">
              Timeline
            </h3>
            <div class="relative space-y-4">
              <div
                v-for="(event, index) in timelineEvents"
                :key="index"
                class="relative flex gap-4"
              >
                <div class="flex flex-col items-center">
                  <div
                    :class="[
                      'rounded-full p-2 shadow-sm',
                      event.isComplete
                        ? event.status === 'Completed' || event.status === 'Delivered'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                        : 'bg-gray-50 text-gray-300 border border-gray-200'
                    ]"
                  >
                    <svg v-if="event.icon === 'request'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else-if="event.icon === 'driver'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                    <svg v-else-if="event.icon === 'collect'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <svg v-else-if="event.icon === 'register'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                    </svg>
                    <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div
                    v-if="index !== timelineEvents.length - 1"
                    :class="[
                      'w-0.5 mt-2',
                      event.isComplete && timelineEvents[index + 1]?.isComplete
                        ? 'bg-green-300'
                        : event.isComplete
                        ? 'bg-blue-300'
                        : 'bg-gray-200'
                    ]"
                    style="height: 24px"
                  ></div>
                </div>
                <div class="flex-1">
                  <div :class="['text-sm font-medium', event.isComplete ? 'text-gray-900' : 'text-gray-400']">
                    {{ event.status }}
                  </div>
                  <div class="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                    </svg>
                    <span :class="event.isComplete ? '' : 'text-gray-400'">
                      {{ event.time ? formatDate(event.time) : 'Pending' }}
                    </span>
                  </div>
                  <div :class="['text-xs mt-0.5', event.isComplete ? 'text-gray-600' : 'text-gray-400']">
                    {{ event.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="handleClose"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sample: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const formatFieldValue = (value) => {
  if (!value) return 'N/A'
  if (typeof value === 'object' && 'seconds' in value) {
    return formatDate(value)
  }
  if (Array.isArray(value)) {
    return value[0] || 'N/A'
  }
  return String(value)
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A'
  
  let date
  if (dateValue.toDate) {
    date = dateValue.toDate()
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue)
  } else if (dateValue.seconds) {
    date = new Date(dateValue.seconds * 1000)
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
  } else if (requestedAt.seconds) {
    start = new Date(requestedAt.seconds * 1000).getTime()
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

const getStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    collected: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    registered: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800',
    received: 'px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800',
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

const formatPriority = (priority) => {
  return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Routine'
}

const timelineEvents = computed(() => {
  if (!props.sample) return []
  
  const sample = props.sample
  return [
    {
      status: 'Pending',
      time: sample.requested_at || null,
      description: 'Sample collection request received',
      icon: 'request',
      isComplete: true,
    },
    {
      status: 'Driver Assigned',
      time: sample.driver_assigned_at || (sample.assigned_driver ? sample.requested_at : null),
      description: sample.assigned_driver
        ? `Driver ${sample.assigned_driver.name} assigned for collection`
        : 'Awaiting driver assignment',
      icon: 'driver',
      isComplete: !!sample.assigned_driver,
    },
    {
      status: 'Accepted',
      time: sample.accepted_collection_at || null,
      description: ['collected', 'registered', 'received', 'completed', 'delivered'].includes(sample.status)
        ? 'Collection request accepted'
        : 'Awaiting acceptance',
      icon: 'accept',
      isComplete: ['collected', 'registered', 'received', 'completed', 'delivered'].includes(sample.status),
    },
    {
      status: 'Collected',
      time: sample.collected_at || null,
      description: sample.collected_at
        ? `Sample collected${sample.collected_by ? ` by ${sample.collected_by}` : ''}`
        : 'Awaiting collection',
      icon: 'collect',
      isComplete: !!sample.collected_at || ['registered', 'received', 'completed', 'delivered'].includes(sample.status),
    },
    {
      status: 'Registered',
      time: sample.time_registered || sample.registered_at || null,
      description: ['registered', 'received', 'completed', 'delivered'].includes(sample.status)
        ? `Sample registered${sample.accession_number ? ` with ID ${formatFieldValue(sample.accession_number)}` : ''}`
        : 'Sample not yet registered',
      icon: 'register',
      isComplete: !!sample.time_registered || ['registered', 'received', 'completed', 'delivered'].includes(sample.status),
    },
    {
      status: 'Received',
      time: sample.received_at || null,
      description: ['received', 'completed', 'delivered'].includes(sample.status)
        ? 'Sample received at laboratory'
        : 'Awaiting laboratory reception',
      icon: 'receive',
      isComplete: ['received', 'completed', 'delivered'].includes(sample.status),
    },
    {
      status: 'Completed',
      time: sample.completed_at || sample.date_created || null,
      description: ['completed', 'delivered'].includes(sample.status)
        ? 'All tests completed successfully'
        : 'Tests not yet completed',
      icon: 'complete',
      isComplete: ['completed', 'delivered'].includes(sample.status),
    },
    {
      status: 'Delivered',
      time: sample.delivered_at || null,
      description: sample.status === 'delivered'
        ? `Results delivered${sample.received_by ? ` to ${sample.received_by}` : ''}`
        : 'Results pending delivery',
      icon: 'delivered',
      isComplete: sample.status === 'delivered',
    },
  ]
})

const handleClose = () => {
  emit('close')
}
</script>

