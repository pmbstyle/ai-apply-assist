import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

export type DocumentFormat = 'txt' | 'pdf' | 'docx'

export async function downloadDocument(
  content: string,
  filename: string,
  format: DocumentFormat
) {
  const baseFilename = filename.replace(/\.[^/.]+$/, '')

  switch (format) {
    case 'txt':
      downloadAsText(content, `${baseFilename}.txt`)
      break
    case 'pdf':
      await downloadAsPDF(content, `${baseFilename}.pdf`)
      break
    case 'docx':
      await downloadAsDOCX(content, `${baseFilename}.docx`)
      break
  }
}

function downloadAsText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  saveAs(blob, filename)
}

async function downloadAsPDF(content: string, filename: string) {
  const pdf = new jsPDF()
  const margin = 20
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const maxWidth = pageWidth - 2 * margin
  const lineHeight = 7
  const fontSize = 11

  pdf.setFontSize(fontSize)

  const lines = content.split('\n')
  let yPosition = margin

  for (const line of lines) {
    if (!line.trim()) {
      yPosition += lineHeight
      continue
    }

    const wrappedLines = pdf.splitTextToSize(line, maxWidth)

    for (const wrappedLine of wrappedLines) {
      if (yPosition + lineHeight > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
      }

      pdf.text(wrappedLine, margin, yPosition)
      yPosition += lineHeight
    }
  }

  pdf.save(filename)
}

async function downloadAsDOCX(content: string, filename: string) {
  const paragraphs = content.split('\n').map(
    line =>
      new Paragraph({
        children: [new TextRun(line || ' ')],
        spacing: {
          after: 120,
        },
      })
  )

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  })

  const buffer = await Packer.toBlob(doc)
  saveAs(buffer, filename)
}
