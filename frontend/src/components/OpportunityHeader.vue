<template>
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold">{{ opportunity.company }}</h1>
          <h2 class="text-xl text-primary mt-1">
            {{ opportunity.position }}
          </h2>
          <div class="flex items-center gap-4 mt-2">
            <span class="badge badge-lg" :class="statusBadgeClass">
              {{ opportunity.status }}
            </span>
            <span v-if="salaryDisplay" class="text-success font-semibold">
              {{ salaryDisplay }}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            v-if="opportunity.url"
            @click="openJobUrl"
            class="btn btn-outline btn-sm"
          >
            View Job Posting
          </button>
          <button @click="$emit('edit')" class="btn btn-outline btn-sm">
            Edit
          </button>
          <button @click="$emit('delete')" class="btn btn-error btn-sm">
            Delete
          </button>
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

interface Emits {
  (e: 'edit'): void
  (e: 'delete'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const statusBadgeClass = computed(() => {
  const status = props.opportunity.status
  switch (status) {
    case 'applied':
      return 'badge-info'
    case 'interview':
      return 'badge-warning'
    case 'accepted':
      return 'badge-success'
    case 'rejected':
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
})

const salaryDisplay = computed(() => {
  if (!props.opportunity) return ''
  if (props.opportunity.salaryNA) return 'Salary: N/A'
  if (props.opportunity.salaryFrom && props.opportunity.salaryTo) {
    return `$${props.opportunity.salaryFrom.toLocaleString()} - $${props.opportunity.salaryTo.toLocaleString()}`
  }
  if (props.opportunity.salaryFrom) {
    return `$${props.opportunity.salaryFrom.toLocaleString()}+`
  }
  return ''
})

const openJobUrl = () => {
  if (props.opportunity.url) {
    window.open(props.opportunity.url, '_blank')
  }
}
</script>
