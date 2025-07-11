<template>
  <div class="diff-viewer">
    <div class="flex justify-between items-center mb-4">
      <h4 class="font-semibold">Review AI Changes</h4>
      <div class="flex gap-2">
        <button
          @click="acceptAllChanges"
          class="btn btn-success btn-sm"
          :disabled="!hasPendingChanges"
        >
          Accept All
        </button>
        <button
          @click="rejectAllChanges"
          class="btn btn-error btn-sm"
          :disabled="!hasPendingChanges"
        >
          Reject All
        </button>
      </div>
    </div>

    <div class="resume-diff-container">
      <div
        class="resume-content"
        v-html="inlineResumeHtml"
        @click="handleDiffClick"
      ></div>
    </div>

    <div
      v-if="hasChanges"
      class="mt-4 p-3 bg-base-100 border border-base-300 rounded-lg"
    >
      <div class="text-sm flex items-center justify-between">
        <div>
          <span class="text-success font-medium"
            >{{ acceptedCount }} accepted</span
          >
          •
          <span class="text-error font-medium"
            >{{ rejectedCount }} rejected</span
          >
          •
          <span class="text-warning font-medium"
            >{{ pendingCount }} pending</span
          >
        </div>
        <div class="text-xs text-base-content/60">
          Click highlighted text to accept/reject changes
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DiffMatchPatch from 'diff-match-patch'

interface DiffChange {
  id: string
  type: 'addition' | 'deletion' | 'replacement'
  originalContent: string
  modifiedContent: string
  accepted: boolean
  rejected: boolean
}

interface Props {
  originalText: string
  modifiedText: string
  viewMode?: 'inline' | 'sideBySide'
}

interface Emits {
  (e: 'changes-applied', text: string): void
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'inline',
})

const emit = defineEmits<Emits>()

const viewMode = ref(props.viewMode)
const processedChanges = ref<DiffChange[]>([])

const dmp = new DiffMatchPatch()

const hasChanges = computed(() => {
  return processedChanges.value.length > 0
})

const hasPendingChanges = computed(() => {
  return (
    processedChanges.value.length > 0 &&
    processedChanges.value.some(change => !change.accepted && !change.rejected)
  )
})

const acceptedCount = computed(() => {
  return processedChanges.value.filter(change => change.accepted).length
})

const rejectedCount = computed(() => {
  return processedChanges.value.filter(change => change.rejected).length
})

const pendingCount = computed(() => {
  return processedChanges.value.filter(
    change => !change.accepted && !change.rejected
  ).length
})

const computeChanges = () => {
  if (!props.originalText || !props.modifiedText) {
    processedChanges.value = []
    return
  }

  const diffs = dmp.diff_main(props.originalText, props.modifiedText)
  dmp.diff_cleanupSemantic(diffs)
  const changeBlocks = groupChanges(diffs)

  const newChanges: DiffChange[] = []
  let changeIndex = 0

  changeBlocks.forEach(block => {
    if (block.type !== 'unchanged') {
      const changeId = `change-${changeIndex++}`
      const change = {
        id: changeId,
        type: block.type,
        originalContent: block.originalText || '',
        modifiedContent: block.modifiedText || '',
        accepted: false,
        rejected: false,
      }
      newChanges.push(change)
    }
  })

  processedChanges.value = newChanges
}

const inlineResumeHtml = computed(() => {
  if (
    !props.originalText ||
    !props.modifiedText ||
    processedChanges.value.length === 0
  ) {
    return escapeHtml(props.originalText || '')
  }

  const diffs = dmp.diff_main(props.originalText, props.modifiedText)
  dmp.diff_cleanupSemantic(diffs)
  const changeBlocks = groupChanges(diffs)

  let html = ''
  let changeIndex = 0

  changeBlocks.forEach(block => {
    if (block.type === 'unchanged') {
      html += escapeHtml(block.text)
    } else {
      const change = processedChanges.value[changeIndex]
      if (change) {
        const changeId = change.id

        if (change.accepted) {
          if (change.type === 'replacement') {
            html += escapeHtml(change.modifiedContent)
          } else if (change.type === 'addition') {
            html += escapeHtml(change.modifiedContent)
          }
        } else if (change.rejected) {
          if (change.type === 'replacement' || change.type === 'deletion') {
            html += escapeHtml(change.originalContent)
          }
        } else {
          if (change.type === 'replacement') {
            html += `<span class="diff-change-block" data-change-id="${changeId}"><span class="diff-old-text">${escapeHtml(change.originalContent)}</span><span class="diff-new-text">${escapeHtml(change.modifiedContent)}</span><span class="diff-actions"><button class="diff-accept" title="Accept change">✓</button><button class="diff-reject" title="Reject change">✗</button></span></span>`
          } else if (change.type === 'addition') {
            html += `<span class="diff-change-block" data-change-id="${changeId}"><span class="diff-new-text">${escapeHtml(change.modifiedContent)}</span><span class="diff-actions"><button class="diff-accept" title="Accept addition">✓</button><button class="diff-reject" title="Reject addition">✗</button></span></span>`
          } else if (change.type === 'deletion') {
            html += `<span class="diff-change-block" data-change-id="${changeId}"><span class="diff-old-text">${escapeHtml(change.originalContent)}</span><span class="diff-actions"><button class="diff-accept" title="Accept deletion">✓</button><button class="diff-reject" title="Reject deletion">✗</button></span></span>`
          }
        }
      }
      changeIndex++
    }
  })

  return html
})

const groupChanges = (diffs: any[]) => {
  const blocks = []
  let i = 0

  while (i < diffs.length) {
    const [operation, text] = diffs[i]

    if (operation === 0) {
      blocks.push({ type: 'unchanged', text })
      i++
    } else {
      let originalText = ''
      let modifiedText = ''
      let hasOriginal = false
      let hasModified = false

      while (i < diffs.length && diffs[i][0] !== 0) {
        const [op, txt] = diffs[i]
        const trimmedText = txt.trim()

        if (trimmedText === '') {
          i++
          continue
        }

        if (op === -1) {
          originalText += txt
          hasOriginal = true
        } else if (op === 1) {
          modifiedText += txt
          hasModified = true
        }
        i++
      }

      if (hasOriginal && hasModified) {
        blocks.push({
          type: 'replacement',
          originalText: originalText.trim(),
          modifiedText: modifiedText.trim(),
        })
      } else if (hasOriginal) {
        blocks.push({
          type: 'deletion',
          originalText: originalText.trim(),
        })
      } else if (hasModified) {
        blocks.push({
          type: 'addition',
          modifiedText: modifiedText.trim(),
        })
      }
    }
  }

  return blocks
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const handleDiffClick = (event: Event) => {
  const target = event.target as HTMLElement

  if (target.classList.contains('diff-accept')) {
    const block = target.closest('[data-change-id]')
    const changeId = block?.getAttribute('data-change-id')
    if (changeId) {
      acceptChange(changeId)
    }
  } else if (target.classList.contains('diff-reject')) {
    const block = target.closest('[data-change-id]')
    const changeId = block?.getAttribute('data-change-id')
    if (changeId) {
      rejectChange(changeId)
    }
  }
}

const acceptChange = (changeId: string) => {
  const changeIndex = processedChanges.value.findIndex(c => c.id === changeId)
  if (changeIndex !== -1) {
    processedChanges.value[changeIndex] = {
      ...processedChanges.value[changeIndex],
      accepted: true,
      rejected: false,
    }
  }
}

const rejectChange = (changeId: string) => {
  const changeIndex = processedChanges.value.findIndex(c => c.id === changeId)
  if (changeIndex !== -1) {
    processedChanges.value[changeIndex] = {
      ...processedChanges.value[changeIndex],
      rejected: true,
      accepted: false,
    }
  }
}

const acceptAllChanges = () => {
  processedChanges.value = processedChanges.value.map(change => ({
    ...change,
    accepted: true,
    rejected: false,
  }))
  applyChangesToText()
}

const rejectAllChanges = () => {
  processedChanges.value = processedChanges.value.map(change => ({
    ...change,
    rejected: true,
    accepted: false,
  }))
  applyChangesToText()
}

const emitCurrentState = () => {
  applyChangesToText()
}

const applyChangesToText = () => {
  let resultText = props.modifiedText

  const diffs = dmp.diff_main(props.originalText, props.modifiedText)
  dmp.diff_cleanupSemantic(diffs)
  const changeBlocks = groupChanges(diffs)

  const patches = []
  let changeIndex = 0

  changeBlocks.forEach(block => {
    if (block.type !== 'unchanged') {
      const change = processedChanges.value[changeIndex]
      if (change && change.rejected) {
        if (change.type === 'replacement') {
          patches.push({
            find: change.modifiedContent,
            replace: change.originalContent,
          })
        } else if (change.type === 'addition') {
          patches.push({
            find: change.modifiedContent,
            replace: '',
          })
        }
      }
      changeIndex++
    }
  })

  if (patches.length > 0 || processedChanges.value.some(c => c.rejected)) {
    resultText = ''
    changeIndex = 0

    changeBlocks.forEach(block => {
      if (block.type === 'unchanged') {
        resultText += block.text
      } else {
        const change = processedChanges.value[changeIndex]
        if (change) {
          if (change.rejected) {
            if (change.type === 'replacement') {
              resultText += change.originalContent
            } else if (change.type === 'deletion') {
              resultText += change.originalContent
            }
          } else {
            if (change.type === 'replacement') {
              resultText += change.modifiedContent
            } else if (change.type === 'addition') {
              resultText += change.modifiedContent
            }
          }
        }
        changeIndex++
      }
    })
  }

  emit('changes-applied', resultText)
}

watch(
  () => [props.originalText, props.modifiedText],
  (newValues, oldValues) => {
    if (processedChanges.value.length === 0) {
      computeChanges()
    } else if (
      oldValues &&
      (newValues[0] !== oldValues[0] || newValues[1] !== oldValues[1]) &&
      processedChanges.value.some(c => c.accepted || c.rejected)
    ) {
      console.log('External text change detected, resetting changes')
      computeChanges()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.resume-diff-container {
  max-height: 600px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.resume-content {
  font-family: 'Times New Roman', Times, serif;
  font-size: 14px;
  line-height: 1.6;
  color: #000000;
  max-width: none;
  white-space: pre-wrap;
}

:deep(.resume-h1) {
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 10px 0;
  color: #000000;
  text-align: center;
}

:deep(.resume-h2) {
  font-size: 18px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #000000;
  border-bottom: 1px solid #cccccc;
  padding-bottom: 2px;
}

:deep(.resume-h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 6px 0;
  color: #000000;
}

:deep(.resume-p) {
  margin: 8px 0;
  text-align: justify;
}

:deep(.resume-strong) {
  font-weight: 600;
  color: #000000;
}

:deep(.resume-li) {
  margin: 4px 0 4px 20px;
  list-style-type: disc;
  display: list-item;
}

:deep(.diff-change-block) {
  display: inline;
  position: relative;
  white-space: nowrap;
}

:deep(.diff-old-text) {
  background-color: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  text-decoration: line-through;
  padding: 2px 4px;
  border-radius: 3px;
  display: inline;
}

:deep(.diff-new-text) {
  background-color: rgba(34, 197, 94, 0.15);
  color: #15803d;
  font-weight: 500;
  padding: 2px 4px;
  border-radius: 3px;
  display: inline;
  margin-left: 2px;
}

:deep(.diff-actions) {
  display: inline;
  margin-left: 6px;
  vertical-align: middle;
}

:deep(.diff-accept),
:deep(.diff-reject) {
  background: white;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: inline-block;
  text-align: center;
  line-height: 16px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 2px;
  vertical-align: middle;
}

:deep(.diff-accept) {
  color: #15803d;
  border-color: rgba(34, 197, 94, 0.3);
}

:deep(.diff-accept:hover) {
  background-color: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.5);
  transform: scale(1.1);
}

:deep(.diff-reject) {
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.3);
}

:deep(.diff-reject:hover) {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.1);
}

:deep(.change-accepted) {
  background-color: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 6px;
  padding: 4px;
}

:deep(.change-accepted .diff-old-text) {
  opacity: 0.5;
  text-decoration: line-through;
}

:deep(.change-accepted .diff-new-text) {
  background-color: rgba(34, 197, 94, 0.3);
  font-weight: 600;
}

:deep(.change-rejected) {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 4px;
}

:deep(.change-rejected .diff-new-text) {
  opacity: 0.5;
  text-decoration: line-through;
}

:deep(.change-rejected .diff-old-text) {
  background-color: rgba(239, 68, 68, 0.3);
  text-decoration: none;
  font-weight: 600;
}
</style>
