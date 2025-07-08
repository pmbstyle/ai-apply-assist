<template>
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-5xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">Create New Opportunity</h3>
        <button @click="$emit('close')" class="btn btn-sm btn-circle btn-ghost">
          ✕
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Company Name *</span>
            </label>
            <input
              v-model="form.company"
              type="text"
              placeholder="Enter company name"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Position *</span>
            </label>
            <input
              v-model="form.position"
              type="text"
              placeholder="e.g., Senior Full Stack Developer"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Job URL</span>
            </label>
            <input
              v-model="form.url"
              type="url"
              placeholder="https://..."
              class="input input-bordered"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Salary Range</span>
            </label>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input
                  v-model.number="form.salaryFrom"
                  type="number"
                  placeholder="From (e.g., 80000)"
                  class="input input-bordered w-full"
                  :disabled="form.salaryNA"
                />
                <span>-</span>
                <input
                  v-model.number="form.salaryTo"
                  type="number"
                  placeholder="To (e.g., 120000)"
                  class="input input-bordered w-full"
                  :disabled="form.salaryNA"
                />
              </div>
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  v-model="form.salaryNA"
                  type="checkbox"
                  class="checkbox checkbox-sm"
                />
                <span class="label-text">Salary not available</span>
              </label>
            </div>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Select Base Resume *</span>
              <span
                v-if="preselectedResume"
                class="label-text-alt text-success"
              >
                ✓ {{ preselectedResume.filename }} selected
              </span>
            </label>
            <select
              v-model="form.resumeId"
              class="select select-bordered"
              required
            >
              <option value="">Choose a resume...</option>
              <option
                v-for="resume in resumes"
                :key="resume.id"
                :value="resume.id"
              >
                {{ resume.filename }}
              </option>
            </select>
          </div>
        </div>

        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Job Description *</span>
            </label>
            <textarea
              v-model="form.jobDescription"
              class="textarea textarea-bordered h-40"
              placeholder="Paste the job description here..."
              required
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Notes</span>
            </label>
            <textarea
              v-model="form.notes"
              class="textarea textarea-bordered h-24"
              placeholder="Add any personal notes about this opportunity..."
            ></textarea>
          </div>

          <div class="flex gap-2">
            <button
              @click="processWithAI"
              :disabled="!canProcessWithAI || processing"
              class="btn btn-primary flex-1"
            >
              <span v-if="processing" class="loading loading-spinner"></span>
              {{
                processing
                  ? 'Processing...'
                  : 'Extract Skills & Optimize Resume'
              }}
            </button>
          </div>
        </div>
      </div>

      <!-- Full-width sections below the two-column layout -->
      <div v-if="extractedSkills" class="mt-6">
        <div class="card bg-base-200">
          <div class="card-body">
            <h4 class="card-title text-md">Extracted Skills</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 class="font-semibold text-sm">Hard Skills</h5>
                <div class="flex flex-wrap gap-1 mt-1">
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
                <h5 class="font-semibold text-sm">Soft Skills</h5>
                <div class="flex flex-wrap gap-1 mt-1">
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

      <div v-if="optimizedResume" class="mt-6">
        <div class="card bg-base-200">
          <div class="card-body">
            <div class="flex justify-between items-center">
              <h4 class="card-title text-md">Optimized Resume</h4>
              <button
                @click="showResumeComparison = !showResumeComparison"
                class="btn btn-sm btn-outline"
              >
                {{ showResumeComparison ? 'Hide' : 'Compare' }}
              </button>
            </div>

            <div v-if="showResumeComparison" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 class="font-semibold text-sm mb-2">Original Resume</h5>
                <textarea
                  :value="originalResumeText"
                  class="textarea textarea-bordered h-40 text-xs w-full"
                  readonly
                ></textarea>
              </div>

              <div>
                <h5 class="font-semibold text-sm mb-2">Optimized Resume</h5>
                <textarea
                  v-model="optimizedResume"
                  class="textarea textarea-bordered h-40 text-xs w-full"
                  placeholder="Optimized resume will appear here..."
                ></textarea>
              </div>
            </div>

            <div v-else>
              <textarea
                v-model="optimizedResume"
                class="textarea textarea-bordered h-40 text-xs w-full"
                placeholder="Optimized resume will appear here..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button @click="$emit('close')" class="btn">Cancel</button>
        <button
          @click="createOpportunity"
          :disabled="!canCreate || creating"
          class="btn btn-primary"
        >
          <span v-if="creating" class="loading loading-spinner"></span>
          {{ creating ? 'Creating...' : 'Create Opportunity' }}
        </button>
      </div>

      <div v-if="error" class="alert alert-error mt-4">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useResumeStore } from '@/stores/resumes'
import { useOpportunityStore } from '@/stores/opportunities'
import { llmApi } from '@/services/api'
import type { Resume, ExtractedSkills } from '@/types'

interface Props {
  preselectedResume?: Resume | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const resumeStore = useResumeStore()
const opportunityStore = useOpportunityStore()

const form = ref({
  company: '',
  position: '',
  url: '',
  salaryFrom: null as number | null,
  salaryTo: null as number | null,
  salaryNA: false,
  notes: '',
  resumeId: 0,
  jobDescription: '',
})

const extractedSkills = ref<ExtractedSkills | null>(null)
const optimizedResume = ref('')
const showResumeComparison = ref(false)
const processing = ref(false)
const creating = ref(false)
const error = ref<string | null>(null)

const resumes = computed(() => resumeStore.resumes)
const selectedResume = computed(() =>
  resumes.value.find(r => r.id === form.value.resumeId)
)
const originalResumeText = computed(
  () => selectedResume.value?.originalText || ''
)

const canProcessWithAI = computed(
  () => form.value.jobDescription.trim() && form.value.resumeId > 0
)

const canCreate = computed(
  () =>
    form.value.company.trim() &&
    form.value.position.trim() &&
    form.value.jobDescription.trim() &&
    form.value.resumeId > 0 &&
    extractedSkills.value &&
    optimizedResume.value.trim()
)

const processWithAI = async () => {
  if (!canProcessWithAI.value) return

  processing.value = true
  error.value = null

  try {
    const skills = await llmApi.extractSkills(form.value.jobDescription)
    extractedSkills.value = skills

    const optimized = await llmApi.optimizeResume(
      originalResumeText.value,
      form.value.jobDescription,
      skills
    )
    optimizedResume.value = optimized
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to process with AI'
  } finally {
    processing.value = false
  }
}

const createOpportunity = async () => {
  if (!canCreate.value) return

  creating.value = true
  error.value = null

  try {
    await opportunityStore.createOpportunity({
      company: form.value.company,
      position: form.value.position,
      jobDescription: form.value.jobDescription,
      url: form.value.url || undefined,
      salaryFrom: form.value.salaryFrom || undefined,
      salaryTo: form.value.salaryTo || undefined,
      salaryNA: form.value.salaryNA,
      notes: form.value.notes || undefined,
      resumeId: form.value.resumeId,
    })

    emit('created')
    emit('close')
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to create opportunity'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  if (resumes.value.length === 0) {
    resumeStore.fetchResumes()
  }

  if (props.preselectedResume) {
    form.value.resumeId = props.preselectedResume.id
  }
})
</script>
