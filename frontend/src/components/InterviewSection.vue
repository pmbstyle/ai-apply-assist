<template>
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <div class="flex justify-between items-center mb-4">
        <h3 class="card-title">Interviews</h3>
        <button @click="showAddModal = true" class="btn btn-primary btn-sm">
          Add Interview
        </button>
      </div>

      <div v-if="loading" class="flex justify-center">
        <span class="loading loading-spinner loading-md"></span>
      </div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div
        v-else-if="interviews.length === 0"
        class="text-center py-8 text-base-content/60"
      >
        <svg
          class="w-12 h-12 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
        <p>No interviews scheduled yet</p>
        <p class="text-sm">Add your first interview to get started</p>
      </div>

      <div v-else class="space-y-3">
        <InterviewCard
          v-for="interview in sortedInterviews"
          :key="interview.id"
          :interview="interview"
          @edit="editInterview"
          @delete="deleteInterview"
        />
      </div>

      <div v-if="showAddModal || editingInterview" class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">
            {{ editingInterview ? 'Edit Interview' : 'Add Interview' }}
          </h3>

          <form @submit.prevent="saveInterview" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Title</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                placeholder="e.g., Technical Interview, HR Round"
                class="input input-bordered"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Date & Time</span>
              </label>
              <input
                v-model="formData.date"
                type="datetime-local"
                class="input input-bordered"
                required
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Notes</span>
              </label>
              <textarea
                v-model="formData.notes"
                placeholder="Interview preparation notes, interviewer details, etc."
                class="textarea textarea-bordered"
                rows="4"
              ></textarea>
            </div>

            <div class="modal-action">
              <button type="button" @click="closeModal" class="btn">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span
                  v-if="saving"
                  class="loading loading-spinner loading-sm"
                ></span>
                {{ editingInterview ? 'Update' : 'Add' }} Interview
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { interviewApi } from '@/services/api'
import type { Interview } from '@/types'
import InterviewCard from '@/components/InterviewCard.vue'

interface Props {
  opportunityId: number
}

const props = defineProps<Props>()

const interviews = ref<Interview[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const showAddModal = ref(false)
const editingInterview = ref<Interview | null>(null)

const formData = ref({
  title: '',
  date: '',
  notes: '',
})

const sortedInterviews = computed(() => {
  return [...interviews.value].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
})

const fetchInterviews = async () => {
  try {
    loading.value = true
    error.value = null
    interviews.value = await interviewApi.getByOpportunityId(
      props.opportunityId
    )
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to fetch interviews'
  } finally {
    loading.value = false
  }
}

const editInterview = (interview: Interview) => {
  editingInterview.value = interview
  formData.value = {
    title: interview.title,
    date: new Date(interview.date).toISOString().slice(0, 16),
    notes: interview.notes || '',
  }
}

const deleteInterview = async (interview: Interview) => {
  if (!confirm('Are you sure you want to delete this interview?')) {
    return
  }

  try {
    await interviewApi.delete(interview.id)
    interviews.value = interviews.value.filter(i => i.id !== interview.id)
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to delete interview'
  }
}

const saveInterview = async () => {
  try {
    saving.value = true
    error.value = null

    const interviewData = {
      opportunityId: props.opportunityId,
      title: formData.value.title,
      date: new Date(formData.value.date).toISOString(),
      notes: formData.value.notes || undefined,
    }

    if (editingInterview.value) {
      const updated = await interviewApi.update(editingInterview.value.id, {
        title: interviewData.title,
        date: interviewData.date,
        notes: interviewData.notes,
      })
      const index = interviews.value.findIndex(
        i => i.id === editingInterview.value!.id
      )
      if (index !== -1) {
        interviews.value[index] = updated
      }
    } else {
      const newInterview = await interviewApi.create(interviewData)
      interviews.value.push(newInterview)
    }

    closeModal()
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to save interview'
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingInterview.value = null
  formData.value = {
    title: '',
    date: '',
    notes: '',
  }
}

onMounted(() => {
  fetchInterviews()
})
</script>
