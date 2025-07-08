<template>
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-4xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-lg">Edit Opportunity</h3>
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
              <span class="label-text">Status</span>
            </label>
            <select v-model="form.status" class="select select-bordered">
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Base Resume</span>
              <span class="label-text-alt">Change resume to re-optimize</span>
            </label>
            <select v-model="form.resumeId" class="select select-bordered">
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
              <span class="label-text">Job Description</span>
            </label>
            <textarea
              v-model="form.jobDescription"
              class="textarea textarea-bordered h-40"
              placeholder="Job description..."
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

          <div class="flex gap-2 mb-4">
            <button
              @click="reprocessWithAI"
              :disabled="!canReprocessWithAI || reprocessing"
              class="btn btn-secondary flex-1"
            >
              <span v-if="reprocessing" class="loading loading-spinner"></span>
              {{
                reprocessing
                  ? 'Re-processing...'
                  : 'Re-extract Skills & Re-optimize Resume'
              }}
            </button>
          </div>

          <div v-if="currentExtractedSkills" class="card bg-base-200">
            <div class="card-body">
              <h4 class="card-title text-md">Extracted Skills</h4>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-semibold text-sm">Hard Skills</h5>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span
                      v-for="skill in currentExtractedSkills.hardSkills"
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
                      v-for="skill in currentExtractedSkills.softSkills"
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

        <div class="modal-action">
          <button @click="$emit('close')" class="btn">Cancel</button>
          <button
            @click="updateOpportunity"
            :disabled="!canUpdate || updating"
            class="btn btn-primary"
          >
            <span v-if="updating" class="loading loading-spinner"></span>
            {{ updating ? 'Updating...' : 'Update Opportunity' }}
          </button>
        </div>

        <div v-if="error" class="alert alert-error mt-4">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOpportunityStore } from '@/stores/opportunities'
import { useResumeStore } from '@/stores/resumes'
import { llmApi } from '@/services/api'
import type { Opportunity, Resume, ExtractedSkills } from '@/types'

interface Props {
  opportunity: Opportunity
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const opportunityStore = useOpportunityStore()
const resumeStore = useResumeStore()

const form = ref({
  company: '',
  position: '',
  url: '',
  salaryFrom: null as number | null,
  salaryTo: null as number | null,
  salaryNA: false,
  notes: '',
  status: 'applied' as Opportunity['status'],
  jobDescription: '',
  resumeId: 0,
})

const currentExtractedSkills = ref<ExtractedSkills | null>(null)
const updating = ref(false)
const reprocessing = ref(false)
const error = ref<string | null>(null)

const resumes = computed(() => resumeStore.resumes)
const selectedResume = computed(() =>
  resumes.value.find(r => r.id === form.value.resumeId)
)

const canUpdate = computed(
  () =>
    form.value.company.trim() &&
    form.value.position.trim() &&
    form.value.jobDescription.trim()
)

const canReprocessWithAI = computed(
  () => form.value.jobDescription.trim() && form.value.resumeId > 0
)

const reprocessWithAI = async () => {
  if (!canReprocessWithAI.value || !selectedResume.value) return

  reprocessing.value = true
  error.value = null

  try {
    const skills = await llmApi.extractSkills(form.value.jobDescription)
    currentExtractedSkills.value = skills

    const optimized = await llmApi.optimizeResume(
      selectedResume.value.originalText,
      form.value.jobDescription,
      skills
    )

    await opportunityStore.updateOpportunity(props.opportunity.id, {
      optimizedResume: optimized,
      extractedSkills: JSON.stringify(skills),
      resumeId: form.value.resumeId,
    })
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to reprocess with AI'
  } finally {
    reprocessing.value = false
  }
}

const updateOpportunity = async () => {
  if (!canUpdate.value) return

  updating.value = true
  error.value = null

  try {
    const updateData: any = {
      company: form.value.company,
      position: form.value.position,
      jobDescription: form.value.jobDescription,
      url: form.value.url || undefined,
      salaryFrom: form.value.salaryFrom || undefined,
      salaryTo: form.value.salaryTo || undefined,
      salaryNA: form.value.salaryNA,
      notes: form.value.notes || undefined,
      status: form.value.status,
    }

    if (
      form.value.resumeId &&
      form.value.resumeId !== props.opportunity.resumeId
    ) {
      updateData.resumeId = form.value.resumeId
    }

    await opportunityStore.updateOpportunity(props.opportunity.id, updateData)

    emit('updated')
    emit('close')
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to update opportunity'
  } finally {
    updating.value = false
  }
}

onMounted(() => {
  if (resumeStore.resumes.length === 0) {
    resumeStore.fetchResumes()
  }

  form.value = {
    company: props.opportunity.company || '',
    position: props.opportunity.position || '',
    url: props.opportunity.url || '',
    salaryFrom: props.opportunity.salaryFrom || null,
    salaryTo: props.opportunity.salaryTo || null,
    salaryNA: props.opportunity.salaryNA || false,
    notes: props.opportunity.notes || '',
    status: props.opportunity.status || 'applied',
    jobDescription: props.opportunity.jobDescription || '',
    resumeId: props.opportunity.resumeId || 0,
  }

  currentExtractedSkills.value = props.opportunity.extractedSkills || null
})
</script>
