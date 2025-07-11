<template>
  <div
    class="border border-base-300 rounded-lg p-4 hover:bg-base-100 transition-colors"
  >
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h4 class="font-semibold text-lg">{{ interview.title }}</h4>
        <div class="flex items-center gap-2 mt-2">
          <svg
            class="w-4 h-4 text-base-content/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span class="text-sm" :class="dateColorClass">{{
            formattedDate
          }}</span>
          <span v-if="isUpcoming" class="badge badge-warning badge-sm"
            >Upcoming</span
          >
          <span v-else-if="isPast" class="badge badge-ghost badge-sm"
            >Past</span
          >
        </div>
        <div v-if="interview.notes" class="mt-3">
          <p class="text-sm text-base-content/80 line-clamp-2">
            {{ interview.notes }}
          </p>
        </div>
      </div>

      <div class="flex gap-2 ml-4">
        <button
          @click="$emit('edit', interview)"
          class="btn btn-ghost btn-sm"
          title="Edit interview"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            ></path>
          </svg>
        </button>
        <button
          @click="$emit('delete', interview)"
          class="btn btn-ghost btn-sm text-error hover:bg-error/10"
          title="Delete interview"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Interview } from '@/types'

interface Props {
  interview: Interview
}

interface Emits {
  (e: 'edit', interview: Interview): void
  (e: 'delete', interview: Interview): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const interviewDate = computed(() => new Date(props.interview.date))
const now = new Date()

const isUpcoming = computed(() => interviewDate.value > now)
const isPast = computed(() => interviewDate.value < now)

const formattedDate = computed(() => {
  const date = interviewDate.value
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const interviewDay = new Date(date)
  interviewDay.setHours(0, 0, 0, 0)

  const diffTime = interviewDay.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let dateStr = ''
  if (diffDays === 0) {
    dateStr = 'Today'
  } else if (diffDays === 1) {
    dateStr = 'Tomorrow'
  } else if (diffDays === -1) {
    dateStr = 'Yesterday'
  } else if (diffDays > 1 && diffDays <= 7) {
    dateStr = `In ${diffDays} days`
  } else if (diffDays < -1 && diffDays >= -7) {
    dateStr = `${Math.abs(diffDays)} days ago`
  } else {
    dateStr = date.toLocaleDateString()
  }

  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${dateStr} at ${timeStr}`
})

const dateColorClass = computed(() => {
  if (isUpcoming.value) {
    const diffTime = interviewDate.value.getTime() - now.getTime()
    const diffHours = diffTime / (1000 * 60 * 60)

    if (diffHours <= 24) {
      return 'text-warning font-medium'
    } else if (diffHours <= 72) {
      return 'text-info'
    }
    return 'text-base-content/80'
  } else {
    return 'text-base-content/60'
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
