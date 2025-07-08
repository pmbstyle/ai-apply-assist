<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Your Resumes</h2>

      <div v-if="loading" class="flex justify-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else-if="resumes.length === 0" class="text-center py-8">
        <p class="text-base-content/70">No resumes uploaded yet</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="resume in resumes"
          :key="resume.id"
          class="card bg-base-200 shadow-sm"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="font-semibold">{{ resume.filename }}</h3>
                <p class="text-sm text-base-content/70">
                  Uploaded: {{ formatDate(resume.uploadedAt) }}
                </p>
                <p class="text-sm text-base-content/70 mt-2">
                  {{ resume.originalText.substring(0, 150) }}...
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="viewResume(resume)"
                  class="btn btn-sm btn-primary"
                >
                  View/Edit
                </button>
                <button
                  @click="selectResume(resume)"
                  class="btn btn-sm btn-secondary"
                >
                  Select
                </button>
                <button
                  @click="deleteResume(resume.id)"
                  class="btn btn-sm btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useResumeStore } from '@/stores/resumes'
import type { Resume } from '@/types'

const emit = defineEmits<{
  selected: [resume: Resume]
  view: [resume: Resume]
}>()

const resumeStore = useResumeStore()

const resumes = computed(() => resumeStore.resumes)
const loading = computed(() => resumeStore.loading)
const error = computed(() => resumeStore.error)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const selectResume = (resume: Resume) => {
  emit('selected', resume)
}

const viewResume = (resume: Resume) => {
  emit('view', resume)
}

const deleteResume = async (id: number) => {
  if (confirm('Are you sure you want to delete this resume?')) {
    await resumeStore.deleteResume(id)
  }
}

onMounted(() => {
  resumeStore.fetchResumes()
})
</script>
