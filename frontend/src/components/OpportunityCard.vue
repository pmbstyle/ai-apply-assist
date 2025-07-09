<template>
  <div
    class="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-200 cursor-move border border-base-300"
    :data-opportunity-id="opportunity.id"
  >
    <div class="card-body p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="card-title text-lg">{{ opportunity.company }}</h3>
      </div>

      <div class="space-y-2">
        <h4 class="text-md font-semibold text-primary">
          {{ opportunity.position }}
        </h4>

        <p v-if="salaryDisplay" class="text-sm text-success font-semibold">
          {{ salaryDisplay }}
        </p>

        <div v-if="opportunity.extractedSkills" class="mt-3">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="skill in opportunity.extractedSkills.hardSkills.slice(
                0,
                3
              )"
              :key="skill"
              class="badge badge-primary badge-sm"
            >
              {{ skill }}
            </span>
            <span
              v-if="opportunity.extractedSkills.hardSkills.length > 3"
              class="badge badge-ghost badge-sm"
            >
              +{{ opportunity.extractedSkills.hardSkills.length - 3 }} more
            </span>
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <span class="text-xs text-base-content/50">
            {{ formatDate(opportunity.createdAt) }}
          </span>
          <router-link
            :to="`/opportunity/${opportunity.id}`"
            class="btn btn-xs btn-outline"
          >
            View Details
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Opportunity } from '@/types'

interface Props {
  opportunity: Opportunity
}

const props = defineProps<Props>()

const salaryDisplay = computed(() => {
  if (props.opportunity.salaryNA) {
    return 'Salary: N/A'
  }
  if (props.opportunity.salaryFrom && props.opportunity.salaryTo) {
    return `$${props.opportunity.salaryFrom.toLocaleString()} - $${props.opportunity.salaryTo.toLocaleString()}`
  }
  if (props.opportunity.salaryFrom) {
    return `$${props.opportunity.salaryFrom.toLocaleString()}+`
  }
  return ''
})

const emit = defineEmits<{
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
