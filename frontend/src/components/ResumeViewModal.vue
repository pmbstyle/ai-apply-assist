<template>
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-5xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">
          {{ isEditing ? 'Edit' : 'View' }} Resume: {{ resume.filename }}
        </h3>
        <div class="flex gap-2">
          <button
            v-if="!isEditing"
            @click="toggleEdit"
            class="btn btn-sm btn-primary"
          >
            Edit
          </button>
          <button
            @click="$emit('close')"
            class="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-semibold text-sm">Filename</h4>
              <p class="text-sm">{{ resume.filename }}</p>
            </div>
          </div>

          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-semibold text-sm">Uploaded</h4>
              <p class="text-sm">{{ formatDate(resume.uploadedAt) }}</p>
            </div>
          </div>

          <div class="card bg-base-200">
            <div class="card-body p-4">
              <h4 class="font-semibold text-sm">Characters</h4>
              <p class="text-sm">{{ resumeText.length.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-semibold">Resume Content</span>
            <span v-if="isEditing" class="label-text-alt text-warning">
              Changes will be saved to the database
            </span>
          </label>
          <textarea
            v-model="resumeText"
            :readonly="!isEditing"
            class="textarea textarea-bordered h-96 text-sm"
            :class="{ 'bg-base-200': !isEditing }"
            placeholder="Resume content..."
          ></textarea>
        </div>

        <div v-if="isEditing" class="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="stroke-current shrink-0 w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span
            >You can edit the resume content here. This will update the stored
            text in the database.</span
          >
        </div>
      </div>

      <div class="modal-action">
        <button @click="downloadResume" class="btn btn-outline">
          Download
        </button>

        <div v-if="isEditing" class="flex gap-2">
          <button @click="cancelEdit" class="btn">Cancel</button>
          <button
            @click="saveResume"
            :disabled="saving"
            class="btn btn-primary"
          >
            <span v-if="saving" class="loading loading-spinner"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

        <button v-else @click="$emit('close')" class="btn">Close</button>
      </div>

      <div v-if="error" class="alert alert-error mt-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useResumeStore } from '@/stores/resumes'
import type { Resume } from '@/types'

interface Props {
  resume: Resume
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const resumeStore = useResumeStore()

const isEditing = ref(false)
const resumeText = ref('')
const originalText = ref('')
const saving = ref(false)
const error = ref<string | null>(null)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const toggleEdit = () => {
  isEditing.value = true
  originalText.value = resumeText.value
}

const cancelEdit = () => {
  isEditing.value = false
  resumeText.value = originalText.value
  error.value = null
}

const saveResume = async () => {
  saving.value = true
  error.value = null

  try {
    await updateResumeText(props.resume.id, resumeText.value)
    isEditing.value = false
    originalText.value = resumeText.value
    emit('updated')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save resume'
  } finally {
    saving.value = false
  }
}

const updateResumeText = async (id: number, newText: string) => {
  await resumeStore.updateResume(id, newText)
}

const downloadResume = () => {
  const blob = new Blob([resumeText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.resume.filename.replace(/\.[^/.]+$/, '')}_edited.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  resumeText.value = props.resume.originalText
  originalText.value = props.resume.originalText
})
</script>
