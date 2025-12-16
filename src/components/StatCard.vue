<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-secondary-600">{{ label }}</p>
        <p class="mt-2 text-3xl font-bold text-secondary-900">{{ value }}</p>
        <p class="mt-1 text-xs text-secondary-500">{{ trend }}</p>
      </div>
      <div class="flex-shrink-0">
        <div :class="iconClass">
          <!-- Flask Icon -->
          <svg v-if="icon === 'flask'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <!-- Clock Icon -->
          <svg v-else-if="icon === 'clock'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Processing Icon -->
          <svg v-else-if="icon === 'processing'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <!-- Check Icon -->
          <svg v-else-if="icon === 'check'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <!-- Delivered Icon -->
          <svg v-else-if="icon === 'delivered'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  trend: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  }
})

const iconClass = computed(() => {
  const classes = {
    flask: 'w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600',
    clock: 'w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600',
    processing: 'w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600',
    check: 'w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600',
    delivered: 'w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600'
  }
  return classes[props.icon] || classes.flask
})
</script>


