<template>
  <div class="markdown-editor relative">
    <div
      v-if="editable"
      ref="toolbarRef"
      :class="[
        'toolbar flex gap-2 p-2 bg-base-200 transition-all duration-200 z-10',
        isToolbarSticky
          ? 'fixed top-0 left-0 right-0 shadow-lg border-b'
          : 'mb-2 rounded-t-lg',
      ]"
      :style="
        isToolbarSticky
          ? `left: ${toolbarOffset.left}px; width: ${toolbarOffset.width}px;`
          : ''
      "
    >
      <button
        @click="editor?.chain().focus().toggleBold().run()"
        :class="{ 'bg-primary text-primary-content': editor?.isActive('bold') }"
        class="btn btn-sm btn-outline"
      >
        <strong>B</strong>
      </button>
      <button
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="{
          'bg-primary text-primary-content': editor?.isActive('italic'),
        }"
        class="btn btn-sm btn-outline"
      >
        <em>I</em>
      </button>
      <button
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{
          'bg-primary text-primary-content': editor?.isActive('heading', {
            level: 1,
          }),
        }"
        class="btn btn-sm btn-outline"
      >
        H1
      </button>
      <button
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{
          'bg-primary text-primary-content': editor?.isActive('heading', {
            level: 2,
          }),
        }"
        class="btn btn-sm btn-outline"
      >
        H2
      </button>
      <button
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="{
          'bg-primary text-primary-content': editor?.isActive('bulletList'),
        }"
        class="btn btn-sm btn-outline"
      >
        • List
      </button>
      <button
        @click="toggleLink"
        :class="{ 'bg-primary text-primary-content': editor?.isActive('link') }"
        class="btn btn-sm btn-outline"
      >
        🔗 Link
      </button>
    </div>

    <div
      v-if="editable && isToolbarSticky"
      class="toolbar-spacer"
      :style="`height: ${toolbarHeight}px;`"
    ></div>

    <div
      ref="editorElement"
      :class="[
        'prose prose-sm max-w-none min-h-[400px] p-4 border rounded-lg',
        editable && !isToolbarSticky
          ? 'rounded-t-none border-t-0'
          : 'rounded-lg',
        'bg-white text-black',
      ]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

interface Props {
  modelValue?: string
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  editable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorElement = ref<HTMLElement>()
const toolbarRef = ref<HTMLElement>()
const editor = ref<Editor>()
const isToolbarSticky = ref(false)
const toolbarHeight = ref(0)
const toolbarOffset = ref({ left: 0, width: 0 })

const markdownToHtml = (markdown: string): string => {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  let result = []
  let inList = false

  for (let line of lines) {
    let processedLine = line

    if (line.match(/^# /)) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      processedLine = line.replace(/^# (.*)$/, '<h1>$1</h1>')
    } else if (line.match(/^## /)) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      processedLine = line.replace(/^## (.*)$/, '<h2>$1</h2>')
    } else if (line.match(/^### /)) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      processedLine = line.replace(/^### (.*)$/, '<h3>$1</h3>')
    } else if (line.match(/^- /)) {
      if (!inList) {
        result.push('<ul>')
        inList = true
      }
      processedLine = '<li>' + line.replace(/^- /, '') + '</li>'
    } else {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      if (line.trim() && !line.match(/^<[h1-6]/)) {
        processedLine = '<p>' + line + '</p>'
      }
    }

    processedLine = processedLine
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

    result.push(processedLine)
  }

  if (inList) {
    result.push('</ul>')
  }

  return result.join('\n')
}

const htmlToMarkdown = (html: string): string => {
  if (!html) return ''

  let markdown = html
    // Convert headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    // Convert formatting
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Convert links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Convert lists - handle nested structure
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Convert paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Clean up
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')

  return markdown
}

const toggleLink = () => {
  if (editor.value?.isActive('link')) {
    const currentUrl = editor.value.getAttributes('link').href
    const url = prompt('Edit URL (leave empty to remove link):', currentUrl)
    if (url === '') {
      editor.value.chain().focus().unsetLink().run()
    } else if (url !== null) {
      editor.value.chain().focus().setLink({ href: url }).run()
    }
  } else {
    const url = prompt('Enter URL:')
    if (url) {
      editor.value?.chain().focus().setLink({ href: url }).run()
    }
  }
}

const updateToolbarPosition = () => {
  if (!toolbarRef.value || !props.editable) return

  const rect = toolbarRef.value.getBoundingClientRect()

  if (isToolbarSticky.value) {
    const spacerElement =
      toolbarRef.value.parentElement?.querySelector('.toolbar-spacer')
    if (spacerElement) {
      const spacerRect = spacerElement.getBoundingClientRect()
      if (spacerRect.top >= 0) {
        isToolbarSticky.value = false
      }
    }
  } else {
    if (rect.top <= 0) {
      toolbarHeight.value = rect.height
      toolbarOffset.value = {
        left: rect.left + window.scrollX,
        width: rect.width,
      }
      isToolbarSticky.value = true
    }
  }

  if (isToolbarSticky.value && toolbarRef.value) {
    const parentRect = toolbarRef.value.parentElement?.getBoundingClientRect()
    if (parentRect) {
      toolbarOffset.value = {
        left: parentRect.left + window.scrollX,
        width: parentRect.width,
      }
    }
  }
}

const handleScroll = () => {
  requestAnimationFrame(updateToolbarPosition)
}

const handleResize = () => {
  if (isToolbarSticky.value) {
    updateToolbarPosition()
  }
}

onMounted(() => {
  if (editorElement.value) {
    editor.value = new Editor({
      element: editorElement.value,
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false,
          linkOnPaste: true,
          HTMLAttributes: {
            class: 'text-blue-600 underline cursor-pointer',
          },
        }),
      ],
      content: markdownToHtml(props.modelValue),
      editable: props.editable,
      onUpdate: ({ editor }) => {
        const markdown = htmlToMarkdown(editor.getHTML())
        emit('update:modelValue', markdown)
      },
      editorProps: {
        attributes: {
          class: 'prose prose-sm max-w-none focus:outline-none text-black',
          spellcheck: 'false',
        },
        handleKeyDown: (view, event) => {
          if (event.key === 'Enter') {
            const { state } = view
            const { selection } = state
            const node = state.doc.nodeAt(selection.from)

            if (node?.type.name === 'heading') {
              return false
            }
          }
          return false
        },
      },
    })
  }

  if (props.editable) {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()

  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})

watch(
  () => props.modelValue,
  newValue => {
    if (editor.value && newValue !== htmlToMarkdown(editor.value.getHTML())) {
      const htmlContent = markdownToHtml(newValue || '')
      editor.value.commands.setContent(htmlContent, false)
    }
  }
)

watch(
  () => props.editable,
  (newValue, oldValue) => {
    if (editor.value) {
      editor.value.setEditable(newValue)
    }

    if (newValue && !oldValue) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize, { passive: true })
    } else if (!newValue && oldValue) {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      isToolbarSticky.value = false
    }
  }
)
</script>

<style scoped>
.markdown-editor {
  position: relative;
}

.markdown-editor .toolbar {
  z-index: 1000;
}

.markdown-editor .toolbar.fixed {
  position: fixed;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.markdown-editor .toolbar-spacer {
  flex-shrink: 0;
}

.markdown-editor .prose {
  max-width: none;
  color: #000000 !important;
}

.markdown-editor .prose h1 {
  @apply text-2xl font-bold mt-6 mb-4;
  color: #000000 !important;
}

.markdown-editor .prose h2 {
  @apply text-xl font-bold mt-5 mb-3;
  color: #000000 !important;
}

.markdown-editor .prose h3 {
  @apply text-lg font-bold mt-4 mb-2;
  color: #000000 !important;
}

.markdown-editor .prose ul {
  @apply list-disc list-inside my-2;
  color: #000000 !important;
}

.markdown-editor .prose li {
  @apply my-1;
  color: #000000 !important;
}

.markdown-editor .prose p {
  @apply my-2;
  color: #000000 !important;
}

.markdown-editor .prose strong {
  @apply font-bold;
  color: #000000 !important;
}

.markdown-editor .prose em {
  @apply italic;
  color: #000000 !important;
}

.markdown-editor .prose a {
  @apply text-blue-600 underline;
  color: #2563eb !important;
}

.markdown-editor :deep(.ProseMirror) {
  color: #000000 !important;
  background-color: #ffffff !important;
  min-height: 400px;
  outline: none;
}

.markdown-editor :deep(.ProseMirror h1) {
  color: #000000 !important;
  font-size: 2rem !important;
  font-weight: bold !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1rem !important;
  line-height: 1.2 !important;
}

.markdown-editor :deep(.ProseMirror h2) {
  color: #000000 !important;
  font-size: 1.5rem !important;
  font-weight: bold !important;
  margin-top: 1.25rem !important;
  margin-bottom: 0.75rem !important;
  line-height: 1.3 !important;
}

.markdown-editor :deep(.ProseMirror h3) {
  color: #000000 !important;
  font-size: 1.25rem !important;
  font-weight: bold !important;
  margin-top: 1rem !important;
  margin-bottom: 0.5rem !important;
  line-height: 1.4 !important;
}

.markdown-editor :deep(.ProseMirror p) {
  color: #000000 !important;
  margin-bottom: 0.75rem !important;
  line-height: 1.6 !important;
}

.markdown-editor :deep(.ProseMirror li) {
  color: #000000 !important;
  display: list-item !important;
  margin-bottom: 0.25rem !important;
}

.markdown-editor :deep(.ProseMirror strong) {
  color: #000000 !important;
  font-weight: bold !important;
}

.markdown-editor :deep(.ProseMirror em) {
  color: #000000 !important;
  font-style: italic !important;
}

.markdown-editor :deep(.ProseMirror a) {
  color: #2563eb !important;
  text-decoration: underline !important;
  cursor: pointer !important;
}

.markdown-editor :deep(.ProseMirror ul) {
  list-style-type: disc !important;
  padding-left: 1.5rem !important;
  margin: 0.75rem 0 !important;
}

.markdown-editor :deep(.ProseMirror ol) {
  list-style-type: decimal !important;
  padding-left: 1.5rem !important;
  margin: 0.75rem 0 !important;
}

.markdown-editor :deep(.ProseMirror h1:first-child) {
  margin-top: 0 !important;
}

.markdown-editor :deep(.ProseMirror h2:first-child) {
  margin-top: 0 !important;
}

.markdown-editor :deep(.ProseMirror h3:first-child) {
  margin-top: 0 !important;
}
</style>
