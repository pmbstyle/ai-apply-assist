<template>
  <div class="space-y-6">
    <div class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <h3 class="card-title">Optimized Resume</h3>
            <span v-if="hasChanges" class="badge badge-warning badge-sm"
              >Changes Pending</span
            >
          </div>
          <div class="flex gap-2">
            <button
              @click="$emit('toggle-diff')"
              class="btn btn-outline btn-sm"
              :disabled="!originalResumeText && !editableResumeMarkdown"
            >
              {{
                shouldShowDiff && !showDiff ? 'Show Resume' : 'Show Suggestions'
              }}
            </button>
            <button
              @click="$emit('regenerate')"
              class="btn btn-primary btn-sm"
              :disabled="regenerating"
            >
              <span
                v-if="regenerating"
                class="loading loading-spinner loading-sm"
              ></span>
              Re-generate
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        shouldShowDiff &&
        !showDiff &&
        (originalResumeText || editableResumeMarkdown)
      "
      class="card bg-base-200 shadow-lg"
    >
      <div class="card-body">
        <ResumeDiffViewer
          :original-text="originalResumeText"
          :modified-text="currentPlainText"
          @changes-applied="$emit('changes-applied', $event)"
        />
      </div>
    </div>

    <div v-if="!shouldShowDiff || showDiff" class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-semibold">Resume Content</h4>
          <div class="flex gap-2">
            <button
              @click="$emit('toggle-editor-mode')"
              class="btn btn-outline btn-sm"
            >
              {{ editorMode === 'edit' ? 'Preview' : 'Edit' }}
            </button>

            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-outline btn-sm">
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
                  ></path>
                </svg>
              </div>
              <ul
                tabindex="0"
                class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32"
              >
                <li><a @click="$emit('export', 'txt')">TXT</a></li>
                <li><a @click="$emit('export', 'pdf')">PDF</a></li>
                <li><a @click="$emit('export', 'docx')">DOCX</a></li>
              </ul>
            </div>

            <button
              @click="$emit('save')"
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

        <MarkdownEditor
          :model-value="editableResumeMarkdown"
          @update:model-value="$emit('update:editable-resume-markdown', $event)"
          :editable="editorMode === 'edit'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import ResumeDiffViewer from '@/components/ResumeDiffViewer.vue'
import { markdownToText } from '@/utils/markdown'

interface Props {
  editableResumeMarkdown: string
  originalResumeText: string
  showDiff: boolean
  diffHtml: string
  editorMode: 'edit' | 'preview'
  regenerating: boolean
  saving: boolean
}

interface Emits {
  (e: 'update:editable-resume-markdown', value: string): void
  (e: 'toggle-diff'): void
  (e: 'regenerate'): void
  (e: 'toggle-editor-mode'): void
  (e: 'export', format: 'txt' | 'pdf' | 'docx'): void
  (e: 'save'): void
  (e: 'changes-applied', text: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const currentPlainText = computed(() =>
  markdownToText(props.editableResumeMarkdown)
)

const hasChanges = computed(() => {
  if (!props.originalResumeText || !props.editableResumeMarkdown) return false
  const currentText = currentPlainText.value.trim()
  const originalText = props.originalResumeText.trim()
  return currentText !== originalText
})

const shouldShowDiff = computed(() => {
  return hasChanges.value
})
</script>

<style>
@import 'diff2html/bundles/css/diff2html.min.css';

.diff-container {
  max-height: 400px;
  overflow-y: auto;
}

.d2h-file-diff {
  max-width: 100%;
}

.d2h-code-linenumber {
  display: none;
}

.d2h-code-line {
  padding-left: 2rem;
}
</style>
