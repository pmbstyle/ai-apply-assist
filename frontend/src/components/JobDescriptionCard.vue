<template>
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <div
        class="flex justify-between items-center cursor-pointer"
        @click="isExpanded = !isExpanded"
      >
        <h3 class="card-title">Job Description</h3>
        <svg
          class="w-5 h-5 transition-transform"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>
      <div v-if="isExpanded" class="prose max-w-none mt-4">
        <pre class="whitespace-pre-wrap text-sm">{{ jobDescription }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  jobDescription: string
}

defineProps<Props>()

const isExpanded = ref(false)
</script>
