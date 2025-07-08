<template>
  <div class="min-h-screen flex flex-col bg-base-200">
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <img src="/logo.png" alt="AI Apply Assistant Logo" class="w-64" />
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li><a @click="currentView = 'resumes'">Resumes</a></li>
          <li><a @click="currentView = 'opportunities'">Opportunities</a></li>
          <li>
            <button @click="openSettings" class="btn btn-ghost btn-sm">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Settings
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="container mx-auto p-4">
      <div v-if="currentView === 'resumes'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResumeUpload @uploaded="handleResumeUploaded" />
          <ResumeList
            @selected="handleResumeSelected"
            @view="handleResumeView"
          />
        </div>
      </div>

      <div v-else-if="currentView === 'opportunities'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Job Opportunities</h1>
          <button @click="showCreateModal = true" class="btn btn-primary">
            Add Opportunity
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <OpportunityColumn
            v-for="status in statuses"
            :key="status"
            :status="status"
            :opportunities="opportunitiesByStatus[status]"
            @edit="handleEditOpportunity"
            @delete="handleDeleteOpportunity"
            @view-resume="handleViewResume"
            @move="handleMoveOpportunity"
          />
        </div>
      </div>
    </div>

    <CreateOpportunityModal
      v-if="showCreateModal"
      :preselected-resume="selectedResumeForNewOpportunity"
      @close="showCreateModal = false; selectedResumeForNewOpportunity = null"
      @created="handleOpportunityCreated"
    />

    <EditOpportunityModal
      v-if="showEditModal && editingOpportunity"
      :opportunity="editingOpportunity"
      @close="showEditModal = false;editingOpportunity = null"
      @updated="handleOpportunityUpdated"
    />

    <ResumeViewModal
      v-if="showResumeModal && viewingResumeFile"
      :resume="viewingResumeFile"
      @close="showResumeModal = false; viewingResumeFile = null"
      @updated="handleResumeUpdated"
    />

    <div v-if="viewingResume" class="modal modal-open">
      <div class="modal-box w-11/12 max-w-4xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">
            {{ viewingResume.company }} - Optimized Resume
          </h3>
          <button
            @click="viewingResume = null"
            class="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <div v-if="viewingResume.extractedSkills" class="card bg-base-200">
            <div class="card-body">
              <h4 class="card-title text-md">Extracted Skills</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-semibold text-sm">Hard Skills</h5>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span
                      v-for="skill in viewingResume.extractedSkills.hardSkills"
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
                      v-for="skill in viewingResume.extractedSkills.softSkills"
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

          <div class="card bg-base-200">
            <div class="card-body">
              <div class="flex justify-between items-center mb-2">
                <h4 class="card-title text-md">Optimized Resume</h4>
                <button
                  @click="toggleResumeEdit"
                  class="btn btn-sm btn-outline"
                >
                  {{ editingResumeText ? 'Cancel' : 'Edit' }}
                </button>
              </div>
              <textarea
                v-model="currentResumeText"
                :readonly="!editingResumeText"
                class="textarea textarea-bordered h-96 text-sm"
                :class="{ 'bg-base-100': editingResumeText }"
              ></textarea>
              <div v-if="editingResumeText" class="mt-2">
                <button
                  @click="saveResumeChanges"
                  :disabled="savingResumeText"
                  class="btn btn-sm btn-primary"
                >
                  <span
                    v-if="savingResumeText"
                    class="loading loading-spinner"
                  ></span>
                  {{ savingResumeText ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <div class="dropdown dropdown-top">
            <div tabindex="0" role="button" class="btn btn-primary">
              Download
              <svg
                class="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
            >
              <li><a @click="downloadResume('txt')">Text (.txt)</a></li>
              <li><a @click="downloadResume('pdf')">PDF (.pdf)</a></li>
              <li><a @click="downloadResume('docx')">Word (.docx)</a></li>
            </ul>
          </div>
          <button @click="viewingResume = null" class="btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResumeStore } from '@/stores/resumes'
import { useOpportunityStore } from '@/stores/opportunities'
import ResumeUpload from '@/components/ResumeUpload.vue'
import ResumeList from '@/components/ResumeList.vue'
import ResumeViewModal from '@/components/ResumeViewModal.vue'
import OpportunityColumn from '@/components/OpportunityColumn.vue'
import CreateOpportunityModal from '@/components/CreateOpportunityModal.vue'
import EditOpportunityModal from '@/components/EditOpportunityModal.vue'
import {
  downloadDocument,
  type DocumentFormat,
} from '@/utils/documentGenerator'
import type { Resume, Opportunity } from '@/types'

const router = useRouter()
const resumeStore = useResumeStore()
const opportunityStore = useOpportunityStore()

const currentView = ref<'resumes' | 'opportunities'>('opportunities')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showResumeModal = ref(false)
const editingOpportunity = ref<Opportunity | null>(null)
const viewingResume = ref<Opportunity | null>(null)
const viewingResumeFile = ref<Resume | null>(null)
const selectedResumeForNewOpportunity = ref<Resume | null>(null)
const editingResumeText = ref(false)
const currentResumeText = ref('')
const originalResumeText = ref('')
const savingResumeText = ref(false)

const statuses = ['applied', 'interview', 'accepted', 'rejected'] as const
const opportunitiesByStatus = computed(
  () => opportunityStore.opportunitiesByStatus
)

const openSettings = () => {
  router.push('/setup')
}

const handleResumeUploaded = (resume: Resume) => {
  console.log('Resume uploaded:', resume)
}

const handleResumeSelected = (resume: Resume) => {
  currentView.value = 'opportunities'
  selectedResumeForNewOpportunity.value = resume
  showCreateModal.value = true
}

const handleResumeView = (resume: Resume) => {
  viewingResumeFile.value = resume
  showResumeModal.value = true
}

const handleEditOpportunity = (opportunity: Opportunity) => {
  editingOpportunity.value = opportunity
  showEditModal.value = true
}

const handleDeleteOpportunity = async (id: number) => {
  await opportunityStore.deleteOpportunity(id)
}

const handleViewResume = (opportunity: Opportunity) => {
  viewingResume.value = opportunity
  currentResumeText.value = opportunity.optimizedResume || ''
  originalResumeText.value = opportunity.optimizedResume || ''
  editingResumeText.value = false
}

const handleMoveOpportunity = async (
  opportunityId: number,
  newStatus: string
) => {
  await opportunityStore.moveOpportunity(
    opportunityId,
    newStatus as Opportunity['status']
  )
}

const handleOpportunityCreated = () => {
  opportunityStore.fetchOpportunities()
  selectedResumeForNewOpportunity.value = null
}

const handleOpportunityUpdated = () => {
  opportunityStore.fetchOpportunities()
  showEditModal.value = false
  editingOpportunity.value = null
}

const handleResumeUpdated = () => {
  resumeStore.fetchResumes()
  showResumeModal.value = false
  viewingResumeFile.value = null
}

const toggleResumeEdit = () => {
  if (editingResumeText.value) {
    currentResumeText.value = originalResumeText.value
    editingResumeText.value = false
  } else {
    editingResumeText.value = true
  }
}

const saveResumeChanges = async () => {
  if (!viewingResume.value) return

  savingResumeText.value = true
  try {
    await opportunityStore.updateOpportunity(viewingResume.value.id, {
      optimizedResume: currentResumeText.value,
    })

    originalResumeText.value = currentResumeText.value
    editingResumeText.value = false

    viewingResume.value.optimizedResume = currentResumeText.value
  } catch (error) {
    console.error('Failed to save resume changes:', error)
  } finally {
    savingResumeText.value = false
  }
}

const downloadResume = async (format: DocumentFormat) => {
  if (!viewingResume.value || !currentResumeText.value) return

  const filename = `${viewingResume.value.company}_${viewingResume.value.position}_resume`
  await downloadDocument(currentResumeText.value, filename, format)
}

onMounted(() => {
  resumeStore.fetchResumes()
  opportunityStore.fetchOpportunities()
})
</script>
