<template>
  <div v-if="extractedSkills" class="space-y-6">
    <div class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <div
          class="flex justify-between items-center cursor-pointer"
          @click="isExpanded = !isExpanded"
        >
          <h3 class="card-title">Extracted Skills</h3>
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
        <div
          v-if="isExpanded"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
        >
          <div>
            <h4 class="font-semibold text-sm mb-2">Hard Skills</h4>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="skill in extractedSkills.hardSkills"
                :key="skill"
                class="badge badge-primary badge-sm"
              >
                {{ skill }}
              </span>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-sm mb-2">Soft Skills</h4>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="skill in extractedSkills.softSkills"
                :key="skill"
                class="badge badge-secondary badge-sm"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ExtractedSkills {
  hardSkills: string[]
  softSkills: string[]
}

interface Props {
  extractedSkills: ExtractedSkills | null
  resumeText: string
}

defineProps<Props>()

const isExpanded = ref(false)
</script>
