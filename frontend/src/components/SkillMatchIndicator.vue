<template>
  <div
    class="flex items-center justify-between p-2 rounded-lg border"
    :class="containerClasses"
  >
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full" :class="indicatorClasses"></div>
      <span class="text-sm font-medium">{{ skill }}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="text-xs font-medium" :class="statusTextClasses">
        {{ matched ? 'Matched' : 'Missing' }}
      </span>
      <svg
        v-if="matched"
        class="w-4 h-4 text-success"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
      <svg
        v-else
        class="w-4 h-4 text-warning"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        ></path>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  skill: string
  matched: boolean
  type: 'hard' | 'soft'
}

const props = defineProps<Props>()

const containerClasses = computed(() => {
  const baseClasses = 'transition-colors'

  if (props.matched) {
    return `${baseClasses} bg-success/10 border-success/20 hover:bg-success/15`
  } else {
    return `${baseClasses} bg-warning/10 border-warning/20 hover:bg-warning/15`
  }
})

const indicatorClasses = computed(() => {
  if (props.matched) {
    return 'bg-success'
  } else {
    return 'bg-warning'
  }
})

const statusTextClasses = computed(() => {
  if (props.matched) {
    return 'text-success'
  } else {
    return 'text-warning'
  }
})
</script>
