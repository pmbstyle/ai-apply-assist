<template>
  <div class="min-h-screen bg-base-100">
    <div class="container mx-auto px-4 py-6">
      <div class="breadcrumbs text-sm mb-6">
        <ul>
          <li><router-link to="/" class="link">Opportunities</router-link></li>
          <li>{{ opportunity?.company }} - {{ opportunity?.position }}</li>
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
                <h1 class="text-3xl font-bold">{{ opportunity.company }}</h1>
                <h2 class="text-xl text-primary mt-1">
                  {{ opportunity.position }}
                </h2>
                <div class="flex items-center gap-4 mt-2">
                  <span class="badge badge-lg" :class="statusBadgeClass">
                    {{ opportunity.status }}
                  </span>
                  <span v-if="salaryDisplay" class="text-success font-semibold">
                    {{ salaryDisplay }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  v-if="opportunity.url"
                  @click="openJobUrl"
                  class="btn btn-outline btn-sm"
                >
                  View Job Posting
                </button>
                <button
                  @click="router.push(`/opportunity/${opportunity.id}/edit`)"
                  class="btn btn-outline btn-sm"
                >
                  Edit
                </button>
                <button @click="deleteOpportunity" class="btn btn-error btn-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="space-y-6">
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h3 class="card-title">Job Description</h3>
                <div class="prose max-w-none">
                  <pre class="whitespace-pre-wrap text-sm">{{
                    opportunity.jobDescription
                  }}</pre>
                </div>
              </div>
            </div>

            <div
              v-if="opportunity.extractedSkills"
              class="card bg-base-200 shadow-lg"
            >
              <div class="card-body">
                <h3 class="card-title">Extracted Skills</h3>
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

            <div v-if="opportunity.notes" class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h3 class="card-title">Notes</h3>
                <p class="text-sm">{{ opportunity.notes }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <div class="flex justify-between items-center">
                  <h3 class="card-title">Optimized Resume</h3>
                  <div class="flex gap-2">
                    <button
                      @click="showDiff = !showDiff"
                      class="btn btn-outline btn-sm"
                      :disabled="!originalResumeText"
                    >
                      {{ showDiff ? 'Hide Diff' : 'Show Diff' }}
                    </button>
                    <button
                      @click="regenerateResume"
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
              v-if="showDiff && originalResumeText"
              class="card bg-base-200 shadow-lg"
            >
              <div class="card-body">
                <h4 class="font-semibold mb-4">Changes Made</h4>
                <div class="diff-container" v-html="diffHtml"></div>
              </div>
            </div>

            <div v-if="!showDiff" class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <div class="flex justify-between items-center mb-4">
                  <h4 class="font-semibold">Resume Content</h4>
                  <div class="flex gap-2">
                    <button
                      @click="toggleEditorMode"
                      class="btn btn-outline btn-sm"
                    >
                      {{ editorMode === 'edit' ? 'Preview' : 'Edit' }}
                    </button>

                    <div class="dropdown dropdown-end">
                      <div
                        tabindex="0"
                        role="button"
                        class="btn btn-outline btn-sm"
                      >
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
                        <li><a @click="exportResume('txt')">TXT</a></li>
                        <li><a @click="exportResume('pdf')">PDF</a></li>
                        <li><a @click="exportResume('docx')">DOCX</a></li>
                      </ul>
                    </div>

                    <button
                      @click="saveResume"
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

                <div v-if="editorMode === 'edit'" class="space-y-2">
                  <div class="flex flex-wrap gap-2 p-2 bg-base-300 rounded-lg">
                    <button
                      @click="applyFormat('bold')"
                      class="btn btn-sm btn-outline"
                      title="Bold"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      @click="applyFormat('italic')"
                      class="btn btn-sm btn-outline"
                      title="Italic"
                    >
                      <em>I</em>
                    </button>
                    <button
                      @click="applyFormat('underline')"
                      class="btn btn-sm btn-outline"
                      title="Underline"
                    >
                      <u>U</u>
                    </button>
                    <div class="divider divider-horizontal"></div>
                    <button
                      @click="applyFormat('heading1')"
                      class="btn btn-sm btn-outline"
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      @click="applyFormat('heading2')"
                      class="btn btn-sm btn-outline"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      @click="applyFormat('heading3')"
                      class="btn btn-sm btn-outline"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <div class="divider divider-horizontal"></div>
                    <button
                      @click="applyFormat('bullet')"
                      class="btn btn-sm btn-outline"
                      title="Bullet List"
                    >
                      •
                    </button>
                    <button
                      @click="applyFormat('link')"
                      class="btn btn-sm btn-outline"
                      title="Link"
                    >
                      🔗
                    </button>
                  </div>

                  <textarea
                    ref="textareaRef"
                    v-model="editableResumeMarkdown"
                    class="textarea textarea-bordered w-full font-mono text-sm resize-none"
                    style="height: calc(100vh - 400px); min-height: 400px"
                    placeholder="Resume content..."
                    @keydown="handleKeyDown"
                  ></textarea>
                </div>

                <div v-else class="prose max-w-none">
                  <div
                    class="border rounded-lg p-6 bg-white text-sm shadow-inner overflow-auto"
                    style="height: calc(100vh - 400px); min-height: 400px"
                  >
                    <div
                      v-html="renderedMarkdown"
                      class="resume-content-preview"
                    ></div>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOpportunityStore } from '@/stores/opportunities'
import { useResumeStore } from '@/stores/resumes'
import { llmApi } from '@/services/api'
import type { Opportunity } from '@/types'
import { html } from 'diff2html'
import * as Diff from 'diff'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const opportunityStore = useOpportunityStore()
const resumeStore = useResumeStore()

const opportunity = ref<Opportunity | null>(null)
const editableResume = ref('')
const editableResumeMarkdown = ref('')
const originalResumeText = ref('')
const loading = ref(true)
const error = ref<string | null>(null)
const showDiff = ref(false)
const regenerating = ref(false)
const saving = ref(false)
const editorMode = ref<'edit' | 'preview'>('preview')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const statusBadgeClass = computed(() => {
  const status = opportunity.value?.status
  switch (status) {
    case 'applied':
      return 'badge-info'
    case 'interview':
      return 'badge-warning'
    case 'accepted':
      return 'badge-success'
    case 'rejected':
      return 'badge-error'
    default:
      return 'badge-ghost'
  }
})

const salaryDisplay = computed(() => {
  if (!opportunity.value) return ''
  if (opportunity.value.salaryNA) return 'Salary: N/A'
  if (opportunity.value.salaryFrom && opportunity.value.salaryTo) {
    return `$${opportunity.value.salaryFrom.toLocaleString()} - $${opportunity.value.salaryTo.toLocaleString()}`
  }
  if (opportunity.value.salaryFrom) {
    return `$${opportunity.value.salaryFrom.toLocaleString()}+`
  }
  return ''
})

const renderedMarkdown = computed(() => {
  if (!editableResumeMarkdown.value) return ''

  try {
    const result = marked.parse(editableResumeMarkdown.value, {
      breaks: true,
      gfm: true,
    })

    if (typeof result === 'string') {
      return result
    } else if (result && typeof result.toString === 'function') {
      return result.toString()
    } else {
      return String(result)
    }
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return `<p>${editableResumeMarkdown.value.replace(/\n/g, '<br>')}</p>`
  }
})

const diffHtml = computed(() => {
  if (!originalResumeText.value || !editableResume.value) return ''

  const diff = Diff.createTwoFilesPatch(
    'original.txt',
    'optimized.txt',
    originalResumeText.value,
    editableResume.value,
    'Original Resume',
    'Optimized Resume'
  )

  return html(diff, {
    drawFileList: false,
    outputFormat: 'line-by-line',
    colorScheme: 'auto',
    renderNothingWhenEmpty: false,
  })
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
    editableResume.value = opportunity.value?.optimizedResume || ''
    editableResumeMarkdown.value =
      opportunity.value?.resumeMarkdown ||
      convertTextToMarkdown(opportunity.value?.optimizedResume || '')

    if (opportunity.value?.resumeId) {
      const resume = await resumeStore.getResumeById(opportunity.value.resumeId)
      if (resume) {
        originalResumeText.value = resume.originalText
      }
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to fetch opportunity'
  } finally {
    loading.value = false
  }
}

const regenerateResume = async () => {
  if (!opportunity.value || !originalResumeText.value) return

  regenerating.value = true
  try {
    const optimized = await llmApi.optimizeResume(
      originalResumeText.value,
      opportunity.value.jobDescription,
      opportunity.value.extractedSkills
    )
    editableResume.value = optimized
    editableResumeMarkdown.value = convertTextToMarkdown(optimized)
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to regenerate resume'
  } finally {
    regenerating.value = false
  }
}

const convertTextToMarkdown = (text: string): string => {
  return text
    .replace(/^([A-Z][^a-z]*(?:\s+[A-Z][^a-z]*)*)\s*$/gm, '# $1')
    .replace(/^(\s*)-\s+/gm, '- ')
    .replace(/^(\s*)\d+\.\s+/gm, '$1- ')
}

const convertMarkdownToText = (markdown: string): string => {
  return markdown
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^-\s+/gm, '• ')
}

const toggleEditorMode = () => {
  if (editorMode.value === 'edit') {
    editableResume.value = convertMarkdownToText(editableResumeMarkdown.value)
    editorMode.value = 'preview'
  } else {
    editorMode.value = 'edit'
  }
}

const saveResume = async () => {
  if (!opportunity.value) return

  saving.value = true
  try {
    const plainTextResume = convertMarkdownToText(editableResumeMarkdown.value)

    const response = await fetch(`/api/opportunities/${opportunity.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        optimizedResume: plainTextResume,
        resumeMarkdown: editableResumeMarkdown.value,
        updatedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save resume')
    }

    opportunity.value = await response.json()
    editableResume.value = plainTextResume
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save resume'
  } finally {
    saving.value = false
  }
}

const exportResume = async (format: 'txt' | 'pdf' | 'docx') => {
  const content = convertMarkdownToText(editableResumeMarkdown.value)
  const filename = `${opportunity.value?.company}_${opportunity.value?.position}_resume.${format}`

  if (format === 'txt') {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  } else if (format === 'pdf') {
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.left = '-9999px'
      iframe.style.top = '-9999px'
      iframe.style.width = '210mm'
      iframe.style.height = '297mm'
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'

      document.body.appendChild(iframe)

      await new Promise(resolve => {
        iframe.onload = resolve
        iframe.src = 'about:blank'
      })

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) throw new Error('Could not access iframe document')

      const cleanHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #000000;
              background-color: #ffffff;
              padding: 15mm;
              width: 210mm;
              min-height: 297mm;
            }
            h1 {
              font-size: 20px;
              font-weight: bold;
              margin-top: 16px;
              margin-bottom: 8px;
              color: #000000;
            }
            h2 {
              font-size: 18px;
              font-weight: 600;
              margin-top: 12px;
              margin-bottom: 6px;
              color: #000000;
            }
            h3 {
              font-size: 16px;
              font-weight: 600;
              margin-top: 12px;
              margin-bottom: 6px;
              color: #000000;
            }
            p {
              margin-bottom: 8px;
              line-height: 1.6;
              color: #000000;
            }
            ul, ol {
              margin: 8px 0;
              padding-left: 20px;
              color: #000000;
            }
            li {
              margin-bottom: 4px;
              color: #000000;
              list-style-type: disc;
              display: list-item;
              list-style-position: outside;
              padding-left: 5px;
              text-indent: 0;
              line-height: 1.6;
            }
            li::marker {
              content: "• ";
              color: #000000;
            }
            strong {
              font-weight: 600;
              color: #000000;
            }
            em {
              font-style: italic;
              color: #000000;
            }
            a {
              color: #0066cc !important;
              text-decoration: underline !important;
              font-weight: normal;
            }
            a:link, a:visited, a:hover, a:active {
              color: #0066cc !important;
              text-decoration: underline !important;
            }
          </style>
        </head>
        <body>
          ${renderedMarkdown.value}
        </body>
        </html>
      `

      iframeDoc.open()
      iframeDoc.write(cleanHtml)
      iframeDoc.close()

      await new Promise(resolve => setTimeout(resolve, 200))

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
        foreignObjectRendering: false,
      })

      document.body.removeChild(iframe)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pdfWidth = 210
      const pdfHeight = 297
      const margin = 15
      const pageBreakBuffer = 5
      const contentWidth = pdfWidth - margin * 2
      const contentHeight = pdfHeight - margin * 2 - pageBreakBuffer

      const scale = contentWidth / (canvas.width * 0.264583)
      const scaledHeight = canvas.height * 0.264583 * scale

      if (scaledHeight <= contentHeight) {
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, scaledHeight)
      } else {
        let yPosition = 0
        let pageNum = 0

        while (yPosition < scaledHeight) {
          if (pageNum > 0) {
            pdf.addPage()
          }

          const remainingHeight = scaledHeight - yPosition
          const pageContentHeight = Math.min(contentHeight, remainingHeight)

          const srcY = Math.max(0, yPosition / scale / 0.264583)
          const srcHeight = Math.min(
            canvas.height - srcY,
            pageContentHeight / scale / 0.264583
          )

          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = canvas.width
          pageCanvas.height = srcHeight

          const pageCtx = pageCanvas.getContext('2d')
          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0,
              srcY,
              canvas.width,
              srcHeight,
              0,
              0,
              canvas.width,
              srcHeight
            )

            const pageImgData = pageCanvas.toDataURL('image/png')
            pdf.addImage(
              pageImgData,
              'PNG',
              margin,
              margin,
              contentWidth,
              pageContentHeight
            )
          }

          yPosition += contentHeight
          pageNum++
        }
      }

      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  } else if (format === 'docx') {
    try {
      const { Document, Paragraph, TextRun, HeadingLevel, Packer } =
        await import('docx')
      const { saveAs } = await import('file-saver')

      const lines = editableResumeMarkdown.value.split('\n')
      const children = []

      for (const line of lines) {
        if (line.trim() === '') {
          children.push(new Paragraph({ text: '' }))
          continue
        }

        if (line.startsWith('### ')) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.replace('### ', ''),
                  bold: true,
                  size: 32,
                  color: '000000',
                }),
              ],
            })
          )
        } else if (line.startsWith('## ')) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.replace('## ', ''),
                  bold: true,
                  size: 36,
                  color: '000000',
                }),
              ],
            })
          )
        } else if (line.startsWith('# ')) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.replace('# ', ''),
                  bold: true,
                  size: 40,
                  color: '000000',
                }),
              ],
            })
          )
        } else if (line.startsWith('- ')) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.replace('- ', ''),
                  color: '000000',
                }),
              ],
              bullet: { level: 0 },
            })
          )
        } else {
          const runs = []
          let remainingText = line

          while (remainingText.length > 0) {
            const boldMatch = remainingText.match(/\*\*(.*?)\*\*/)
            const italicMatch = remainingText.match(/(?<!\*)\*([^*]+)\*(?!\*)/)
            const underlineMatch = remainingText.match(/<u>(.*?)<\/u>/)
            const linkMatch = remainingText.match(/\[([^\]]+)\]\(([^)]+)\)/)
            const urlMatch = remainingText.match(/(https?:\/\/[^\s]+)/)

            let nextMatch = null
            let nextIndex = remainingText.length

            if (
              boldMatch &&
              boldMatch.index !== undefined &&
              boldMatch.index < nextIndex
            ) {
              nextMatch = { type: 'bold', match: boldMatch }
              nextIndex = boldMatch.index
            }
            if (
              italicMatch &&
              italicMatch.index !== undefined &&
              italicMatch.index < nextIndex
            ) {
              nextMatch = { type: 'italic', match: italicMatch }
              nextIndex = italicMatch.index
            }
            if (
              underlineMatch &&
              underlineMatch.index !== undefined &&
              underlineMatch.index < nextIndex
            ) {
              nextMatch = { type: 'underline', match: underlineMatch }
              nextIndex = underlineMatch.index
            }
            if (
              linkMatch &&
              linkMatch.index !== undefined &&
              linkMatch.index < nextIndex
            ) {
              nextMatch = { type: 'link', match: linkMatch }
              nextIndex = linkMatch.index
            }
            if (
              urlMatch &&
              urlMatch.index !== undefined &&
              urlMatch.index < nextIndex
            ) {
              nextMatch = { type: 'url', match: urlMatch }
              nextIndex = urlMatch.index
            }

            if (nextIndex > 0) {
              const beforeText = remainingText.substring(0, nextIndex)
              if (beforeText.trim()) {
                runs.push(
                  new TextRun({
                    text: beforeText,
                    color: '000000',
                  })
                )
              }
            }

            if (nextMatch) {
              if (nextMatch.type === 'bold') {
                runs.push(
                  new TextRun({
                    text: nextMatch.match[1],
                    color: '000000',
                    bold: true,
                  })
                )
              } else if (nextMatch.type === 'italic') {
                runs.push(
                  new TextRun({
                    text: nextMatch.match[1],
                    color: '000000',
                    italics: true,
                  })
                )
              } else if (nextMatch.type === 'underline') {
                runs.push(
                  new TextRun({
                    text: nextMatch.match[1],
                    color: '000000',
                    underline: {},
                  })
                )
              } else if (nextMatch.type === 'link') {
                runs.push(
                  new TextRun({
                    text: nextMatch.match[1],
                    color: '0066cc',
                  })
                )
              } else if (nextMatch.type === 'url') {
                runs.push(
                  new TextRun({
                    text: nextMatch.match[1],
                    color: '0066cc',
                  })
                )
              }

              remainingText = remainingText.substring(
                nextIndex + nextMatch.match[0].length
              )
            } else {
              if (remainingText.trim()) {
                runs.push(
                  new TextRun({
                    text: remainingText,
                    color: '000000',
                  })
                )
              }
              break
            }
          }

          if (runs.length > 0) {
            children.push(new Paragraph({ children: runs }))
          }
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, filename)
    } catch (error) {
      console.error('Error generating DOCX:', error)
      alert('Error generating DOCX. Please try again.')
    }
  }
}

const openJobUrl = () => {
  if (opportunity.value?.url) {
    window.open(opportunity.value.url, '_blank')
  }
}

const applyFormat = (format: string) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = editableResumeMarkdown.value.substring(start, end)
  const beforeText = editableResumeMarkdown.value.substring(0, start)
  const afterText = editableResumeMarkdown.value.substring(end)

  let newText = ''
  let newCursorPos = start

  switch (format) {
    case 'bold':
      newText = `**${selectedText}**`
      newCursorPos = selectedText ? end + 4 : start + 2
      break
    case 'italic':
      newText = `*${selectedText}*`
      newCursorPos = selectedText ? end + 2 : start + 1
      break
    case 'underline':
      newText = `<u>${selectedText}</u>`
      newCursorPos = selectedText ? end + 7 : start + 3
      break
    case 'heading1':
      newText = `# ${selectedText}`
      newCursorPos = selectedText ? end + 2 : start + 2
      break
    case 'heading2':
      newText = `## ${selectedText}`
      newCursorPos = selectedText ? end + 3 : start + 3
      break
    case 'heading3':
      newText = `### ${selectedText}`
      newCursorPos = selectedText ? end + 4 : start + 4
      break
    case 'bullet':
      const lines = selectedText.split('\n')
      newText = lines.map(line => (line.trim() ? `- ${line}` : line)).join('\n')
      newCursorPos = end + lines.length * 2
      break
    case 'link':
      const url = selectedText.startsWith('http') ? selectedText : 'https://'
      const linkText = selectedText.startsWith('http')
        ? 'Link Text'
        : selectedText || 'Link Text'
      newText = `[${linkText}](${url})`
      newCursorPos = end + 4 + url.length
      break
    default:
      newText = selectedText
  }

  editableResumeMarkdown.value = beforeText + newText + afterText

  setTimeout(() => {
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        applyFormat('bold')
        break
      case 'i':
        event.preventDefault()
        applyFormat('italic')
        break
      case 'u':
        event.preventDefault()
        applyFormat('underline')
        break
    }
  }
}

const deleteOpportunity = async () => {
  if (!opportunity.value) return

  if (
    !confirm(
      'Are you sure you want to delete this opportunity? This action cannot be undone.'
    )
  ) {
    return
  }

  try {
    const response = await fetch(`/api/opportunities/${opportunity.value.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete opportunity')
    }

    router.push('/')
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Failed to delete opportunity'
  }
}

onMounted(() => {
  fetchOpportunity()
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

.resume-content-preview {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #000000;
  background-color: #ffffff;
}

.resume-content-preview p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.resume-content-preview h1 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #000000;
}

.resume-content-preview h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #000000;
}

.resume-content-preview h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #000000;
}

.resume-content-preview ul,
.resume-content-preview ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: #000000;
  list-style-type: disc;
}

.resume-content-preview li {
  margin-bottom: 0.25rem;
  color: #000000;
  display: list-item;
  list-style-type: disc;
  list-style-position: outside;
}

.resume-content-preview strong {
  font-weight: 600;
  color: #000000;
}

.resume-content-preview em {
  font-style: italic;
  color: #000000;
}

.resume-content-preview a {
  color: #0066cc;
  text-decoration: underline;
}
</style>
