<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-6">
            <img src="/images/logo.png" alt="Lab Partners" class="h-8 w-auto" />
            <nav class="hidden md:flex gap-4">
              <router-link to="/" class="px-3 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">Dashboard</router-link>
              <router-link to="/samples" class="px-3 py-2 text-sm font-medium text-secondary-600 hover:text-secondary-900">Samples</router-link>
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
      <!-- Welcome Section -->
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-secondary-900">Welcome back, {{ userData?.name || 'User' }}!</h2>
          <p class="mt-2 text-secondary-600">Manage your sample collection requests</p>
        </div>
        <button
          @click="showRequestModal = true"
          class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          New Request
        </button>
      </div>

      <!-- Time Filter -->
      <div class="mb-6 flex gap-2">
        <button
          v-for="filter in timeFilters"
          :key="filter.value"
          @click="timeFilter = filter.value; fetchStats()"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            timeFilter === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-white text-secondary-700 hover:bg-gray-50 border border-gray-200'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          v-for="stat in statsCards"
          :key="stat.label"
          :label="stat.label"
          :value="statsLoading ? '-' : stat.value.toLocaleString()"
          :trend="stat.trend"
          :icon="stat.icon"
        />
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          @click="showRequestModal = true"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer w-full text-left"
        >
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-secondary-900">New Request</h3>
              <p class="mt-1 text-sm text-secondary-600">Submit a new sample collection request</p>
            </div>
          </div>
        </button>

        <router-link
          to="/samples"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-secondary-900">Sample Management</h3>
              <p class="mt-1 text-sm text-secondary-600">View and manage all samples</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/settings"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-secondary-900">Settings</h3>
              <p class="mt-1 text-sm text-secondary-600">Manage your account details</p>
            </div>
          </div>
        </router-link>
      </div>
    </main>

    <!-- Center Request Modal -->
    <CenterRequestModal
      :isOpen="showRequestModal"
      @close="showRequestModal = false"
      @request-created="handleRequestCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { statsService } from '@/services/statsService'
import StatCard from '@/components/StatCard.vue'
import CenterRequestModal from '@/components/CenterRequestModal.vue'

const router = useRouter()
const { userData, logout } = useAuth()

const showRequestModal = ref(false)
const timeFilter = ref('all')
const stats = ref({
  totalSamples: 0,
  pendingCollections: 0,
  inProgress: 0,
  completed: 0,
  delivered: 0
})
const statsLoading = ref(false)

const timeFilters = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'day' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' }
]

const timeFilterLabels = {
  all: 'All time',
  day: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year'
}

const statsCards = computed(() => [
  {
    label: 'Total Samples',
    value: stats.value.totalSamples,
    trend: timeFilterLabels[timeFilter.value],
    icon: 'flask'
  },
  {
    label: 'Pending Collections',
    value: stats.value.pendingCollections,
    trend: 'Awaiting pickup',
    icon: 'clock'
  },
  {
    label: 'In Progress',
    value: stats.value.inProgress,
    trend: 'Being processed',
    icon: 'processing'
  },
  {
    label: 'Completed',
    value: stats.value.completed,
    trend: 'Tests completed',
    icon: 'check'
  },
  {
    label: 'Delivered',
    value: stats.value.delivered,
    trend: 'Results delivered',
    icon: 'delivered'
  }
])

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const statsData = await statsService.getStats(
      userData.value?.centerId,
      userData.value?.center,
      timeFilter.value
    )
    stats.value = statsData
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    statsLoading.value = false
  }
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (err) {
    console.error('Logout error:', err)
  }
}

const handleRequestCreated = () => {
  // Refresh stats when a new request is created
  fetchStats()
}

onMounted(() => {
  fetchStats()
})
</script>

