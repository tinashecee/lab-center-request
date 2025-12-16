<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-secondary-700 mb-2">
        Search Tests
      </label>
      <input
        type="text"
        v-model="localSearchTerm"
        @input="handleSearch"
        placeholder="Search by test name or ID..."
        class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p class="mt-2 text-sm text-secondary-600">Loading tests...</p>
    </div>

    <div v-else-if="error" class="text-red-600 text-sm p-3 bg-red-50 rounded-lg">
      {{ error }}
    </div>

    <div v-else class="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
      <div
        v-for="test in filteredTests"
        :key="test.id"
        @click="toggleTest(test)"
        :class="[
          'p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors',
          isSelected(test.id) ? 'bg-primary-50 border-primary-200' : ''
        ]"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-secondary-900">{{ test.testName || 'Unnamed Test' }}</p>
            <p v-if="test.testID" class="text-sm text-secondary-600">ID: {{ test.testID }}</p>
          </div>
          <div v-if="isSelected(test.id)" class="text-primary-600">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div v-if="filteredTests.length === 0" class="p-4 text-center text-secondary-600">
        No tests found
      </div>
    </div>

    <div v-if="selectedTests.length > 0" class="mt-4">
      <p class="text-sm font-medium text-secondary-700 mb-2">
        Selected Tests ({{ selectedTests.length }})
      </p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="test in selectedTests"
          :key="test.id"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
        >
          {{ test.testName || test.testID }}
          <button
            @click.stop="removeTest(test.id)"
            class="ml-2 text-primary-600 hover:text-primary-800"
          >
            ×
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTests } from '@/composables/useTests'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const { tests, loading, error, searchTerm, searchTests: searchTestsFn, fetchTests } = useTests()
const selectedTests = ref([...props.modelValue])
const localSearchTerm = ref('')

const filteredTests = computed(() => {
  if (!localSearchTerm.value) {
    return tests.value
  }
  return tests.value.filter(test => {
    const term = localSearchTerm.value.toLowerCase()
    return (
      test.testName?.toLowerCase().includes(term) ||
      test.testID?.toLowerCase().includes(term)
    )
  })
})

const isSelected = (testId) => {
  return selectedTests.value.some(t => t.id === testId)
}

const toggleTest = (test) => {
  const index = selectedTests.value.findIndex(t => t.id === test.id)
  if (index > -1) {
    selectedTests.value.splice(index, 1)
  } else {
    selectedTests.value.push(test)
  }
  emit('update:modelValue', selectedTests.value)
}

const removeTest = (testId) => {
  const index = selectedTests.value.findIndex(t => t.id === testId)
  if (index > -1) {
    selectedTests.value.splice(index, 1)
    emit('update:modelValue', selectedTests.value)
  }
}

const handleSearch = () => {
  // Just filter locally, don't call API for every keystroke
  // The tests are already loaded
}

watch(() => props.modelValue, (newValue) => {
  selectedTests.value = [...newValue]
}, { deep: true })
</script>

