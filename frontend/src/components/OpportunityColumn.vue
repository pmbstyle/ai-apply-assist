<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between p-4 bg-base-200 rounded-t-lg">
      <h2 class="text-xl font-bold capitalize">{{ status }}</h2>
      <div class="badge badge-primary">{{ opportunities.length }}</div>
    </div>

    <div
      ref="columnRef"
      :data-status="status"
      class="flex-1 p-4 space-y-4 bg-base-100 rounded-lg overflow-y-auto"
      style="min-height: calc(100vh - 180px)"
    >
      <OpportunityCard
        v-for="opportunity in opportunities"
        :key="opportunity.id"
        :opportunity="opportunity"
        @edit="$emit('edit', opportunity)"
        @delete="$emit('delete', $event)"
        @view-resume="$emit('viewResume', opportunity)"
      />

      <div
        v-if="opportunities.length === 0"
        class="text-center py-8 text-base-content/50"
      >
        No opportunities yet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sortable from 'sortablejs'
import OpportunityCard from './OpportunityCard.vue'
import type { Opportunity } from '@/types'

interface Props {
  status: string
  opportunities: Opportunity[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [opportunity: Opportunity]
  delete: [id: number]
  viewResume: [opportunity: Opportunity]
  move: [opportunityId: number, newStatus: string]
}>()

const columnRef = ref<HTMLElement>()
let sortable: Sortable | null = null

onMounted(() => {
  if (columnRef.value) {
    sortable = new Sortable(columnRef.value, {
      group: 'opportunities',
      animation: 150,
      ghostClass: 'opacity-50',
      onEnd: evt => {
        const opportunityId = parseInt(evt.item.dataset.opportunityId || '0')
        const newStatus = evt.to.dataset.status || ''

        if (opportunityId && newStatus && evt.from !== evt.to) {
          emit('move', opportunityId, newStatus)
        }
      },
    })
  }
})

onUnmounted(() => {
  if (sortable) {
    sortable.destroy()
  }
})
</script>
