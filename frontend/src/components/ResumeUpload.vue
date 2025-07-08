<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Upload Resume</h2>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Select PDF or Text file</span>
        </label>
        <input
          ref="fileInput"
          type="file"
          accept=".pdf,.txt"
          @change="handleFileSelect"
          class="file-input file-input-bordered w-full"
        />
      </div>

      <div v-if="selectedFile" class="mt-4">
        <p class="text-sm text-base-content/70">
          Selected: {{ selectedFile.name }}
        </p>
      </div>

      <div v-if="uploadedResume" class="mt-4 bg-base-200 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">Parsed Text Preview:</h3>
        <p class="text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
          {{ uploadedResume.originalText.substring(0, 500) }}...
        </p>
      </div>

      <div class="card-actions justify-end mt-4">
        <button
          @click="uploadFile"
          :disabled="!selectedFile || loading"
          class="btn btn-primary"
        >
          <span v-if="loading" class="loading loading-spinner"></span>
          {{ loading ? 'Uploading...' : 'Upload' }}
        </button>
      </div>

      <div v-if="error" class="alert alert-error mt-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '@/stores/resumes'
import type { Resume } from '@/types'

const emit = defineEmits<{
  uploaded: [resume: Resume]
}>()

const resumeStore = useResumeStore()
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploadedResume = ref<Resume | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
  uploadedResume.value = null
  error.value = null
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  loading.value = true
  error.value = null

  try {
    const resume = await resumeStore.uploadResume(selectedFile.value)
    uploadedResume.value = resume
    emit('uploaded', resume)

    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    loading.value = false
  }
}
</script>
