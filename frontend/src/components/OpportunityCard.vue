<template>
  <div
    class="card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-200 cursor-move border border-base-300"
    :data-opportunity-id="opportunity.id"
  >
    <div class="card-body p-4">
      <div class="flex justify-between items-start mb-2">
        <h3 class="card-title text-lg">{{ opportunity.company }}</h3>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
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
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </div>
          <ul
            tabindex="0"
            class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><a @click="editOpportunity">Edit</a></li>
            <li><a @click="viewOptimizedResume">View Resume</a></li>
            <li><a @click="deleteOpportunity" class="text-error">Delete</a></li>
          </ul>
        </div>
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
          <a
            v-if="opportunity.url"
            :href="opportunity.url"
            target="_blank"
            class="btn btn-xs btn-outline"
          >
            View Job
          </a>
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
  edit: [opportunity: Opportunity]
  delete: [id: number]
  viewResume: [opportunity: Opportunity]
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const editOpportunity = () => {
  emit('edit', props.opportunity)
}

const deleteOpportunity = () => {
  if (confirm('Are you sure you want to delete this opportunity?')) {
    emit('delete', props.opportunity.id)
  }
}

const viewOptimizedResume = () => {
  emit('viewResume', props.opportunity)
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
