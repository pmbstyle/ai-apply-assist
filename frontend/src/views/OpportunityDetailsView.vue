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
        <OpportunityHeader
          :opportunity="opportunity"
          @edit="router.push(`/opportunity/${opportunity.id}/edit`)"
          @delete="deleteOpportunity"
        />

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div class="space-y-6">
            <InterviewSection :opportunity-id="opportunity.id" />

            <SkillGapAnalysis
              v-if="opportunity.extractedSkills"
              :extracted-skills="opportunity.extractedSkills"
              :resume-text="editableResumeMarkdown"
            />

            <JobDescriptionCard :job-description="opportunity.jobDescription" />

            <ExtractedSkillsCard
              :extracted-skills="opportunity.extractedSkills"
              :resume-text="editableResumeMarkdown"
            />

            <div v-if="opportunity.notes" class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h3 class="card-title">Notes</h3>
                <p class="text-sm">{{ opportunity.notes }}</p>
              </div>
            </div>
          </div>

          <div>
            <ResumeEditorCard
              :editable-resume-markdown="editableResumeMarkdown"
              @update:editable-resume-markdown="editableResumeMarkdown = $event"
              :original-resume-text="originalResumeText"
              :show-diff="showDiff"
              :diff-html="diffHtml"
              :editor-mode="editorMode"
              :regenerating="regenerating"
              :saving="saving"
              @toggle-diff="showDiff = !showDiff"
              @regenerate="regenerateResume"
              @toggle-editor-mode="toggleEditorMode"
              @export="exportResume"
              @save="saveResume"
              @changes-applied="handleChangesApplied"
            />
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
import OpportunityHeader from '@/components/OpportunityHeader.vue'
import JobDescriptionCard from '@/components/JobDescriptionCard.vue'
import ExtractedSkillsCard from '@/components/ExtractedSkillsCard.vue'
import ResumeEditorCard from '@/components/ResumeEditorCard.vue'
import InterviewSection from '@/components/InterviewSection.vue'
import SkillGapAnalysis from '@/components/SkillGapAnalysis.vue'
import { markdownToText } from '@/utils/markdown'

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
  if (!editableResumeMarkdown.value) return ''

  const currentText = markdownToText(editableResumeMarkdown.value)
  const originalText = originalResumeText.value || ''

  const diff = Diff.createTwoFilesPatch(
    'original.txt',
    'optimized.txt',
    originalText,
    currentText,
    originalText ? 'Original Resume' : 'Empty',
    'Current Resume'
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
    opportunity.value = await opportunityStore.fetchOpportunityById(id)
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
    showDiff.value = false
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

const toggleEditorMode = () => {
  if (editorMode.value === 'edit') {
    editableResume.value = markdownToText(editableResumeMarkdown.value)
    editorMode.value = 'preview'
  } else {
    editorMode.value = 'edit'
  }
}

const saveResume = async () => {
  if (!opportunity.value) return

  saving.value = true
  try {
    const plainTextResume = markdownToText(editableResumeMarkdown.value)

    opportunity.value = await opportunityStore.updateOpportunity(
      opportunity.value.id,
      {
        optimizedResume: plainTextResume,
        resumeMarkdown: editableResumeMarkdown.value,
      }
    )
    editableResume.value = plainTextResume
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save resume'
  } finally {
    saving.value = false
  }
}

const exportResume = async (format: 'txt' | 'pdf' | 'docx') => {
  const content = markdownToText(editableResumeMarkdown.value)
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

const handleChangesApplied = (appliedText: string) => {
  editableResumeMarkdown.value = convertTextToMarkdown(appliedText)
  editableResume.value = appliedText
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
    await opportunityStore.deleteOpportunity(opportunity.value.id)
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
