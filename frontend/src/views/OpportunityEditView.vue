<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-6">
      <div class="breadcrumbs text-sm mb-6">
        <ul>
          <li><router-link to="/" class="link">Opportunities</router-link></li>
          <li>
            <router-link :to="`/opportunity/${opportunity?.id}`" class="link"
              >{{ opportunity?.company }} -
              {{ opportunity?.position }}</router-link
            >
          </li>
          <li>Edit</li>
        </ul>
      </div>

      <div v-if="loading" class="flex justify-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else-if="opportunity" class="space-y-6">
        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold">Edit Opportunity</h1>
                <p class="text-base-content/70 mt-1">
                  Update opportunity details
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="router.push(`/opportunity/${opportunity.id}`)"
                  class="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  @click="saveOpportunity"
                  class="btn btn-primary btn-sm"
                  :disabled="saving"
                >
                  <span
                    v-if="saving"
                    class="loading loading-spinner loading-sm"
                  ></span>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="space-y-6">
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h3 class="card-title">Basic Information</h3>
                <div class="space-y-4">
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Company Name *</span>
                    </label>
                    <input
                      v-model="form.company"
                      type="text"
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
                      class="input input-bordered"
                    />
                  </div>

                  <div class="form-control">
                    <label class="label">
                      <span class="label-text">Status</span>
                    </label>
                    <select
                      v-model="form.status"
                      class="select select-bordered"
                    >
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h3 class="card-title">Salary Information</h3>
                <div class="space-y-4">
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
            </div>
          </div>

          <div class="space-y-6">
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h3 class="card-title">Job Description</h3>
                <div class="form-control">
                  <textarea
                    v-model="form.jobDescription"
                    class="textarea textarea-bordered resize-none"
                    style="height: 300px"
                    placeholder="Job description..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h3 class="card-title">Notes</h3>
                <div class="form-control">
                  <textarea
                    v-model="form.notes"
                    class="textarea textarea-bordered resize-none"
                    style="height: 150px"
                    placeholder="Personal notes..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="opportunity.extractedSkills"
          class="card bg-base-200 shadow-lg"
        >
          <div class="card-body">
            <h3 class="card-title">Extracted Skills (Read-only)</h3>
            <p class="text-sm text-base-content/70 mb-4">
              Skills are automatically extracted from the job description and
              cannot be edited here.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="font-semibold text-sm mb-2">Hard Skills</h4>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="skill in opportunity.extractedSkills.hardSkills"
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
                    v-for="skill in opportunity.extractedSkills.softSkills"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Opportunity } from '@/types'

const route = useRoute()
const router = useRouter()

const opportunity = ref<Opportunity | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const saving = ref(false)

const form = ref({
  company: '',
  position: '',
  url: '',
  status: 'applied' as 'applied' | 'interview' | 'accepted' | 'rejected',
  salaryFrom: null as number | null,
  salaryTo: null as number | null,
  salaryNA: false,
  jobDescription: '',
  notes: '',
})

const fetchOpportunity = async () => {
  try {
    loading.value = true
    error.value = null

    const id = parseInt(route.params.id as string)
    const response = await fetch(`/api/opportunities/${id}`)

    if (!response.ok) {
      throw new Error('Failed to fetch opportunity')
    }

    opportunity.value = await response.json()

    form.value = {
      company: opportunity.value.company,
      position: opportunity.value.position,
      url: opportunity.value.url || '',
      status: opportunity.value.status,
      salaryFrom: opportunity.value.salaryFrom,
      salaryTo: opportunity.value.salaryTo,
      salaryNA: opportunity.value.salaryNA || false,
      jobDescription: opportunity.value.jobDescription,
      notes: opportunity.value.notes || '',
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to fetch opportunity'
  } finally {
    loading.value = false
  }
}

const saveOpportunity = async () => {
  if (!opportunity.value) return

  saving.value = true
  error.value = null

  try {
    const response = await fetch(`/api/opportunities/${opportunity.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: form.value.company,
        position: form.value.position,
        url: form.value.url || undefined,
        status: form.value.status,
        salaryFrom: form.value.salaryFrom || undefined,
        salaryTo: form.value.salaryTo || undefined,
        salaryNA: form.value.salaryNA,
        jobDescription: form.value.jobDescription,
        notes: form.value.notes || undefined,
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save opportunity')
    }

    router.push(`/opportunity/${opportunity.value.id}`)
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to save opportunity'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchOpportunity()
})
</script>
