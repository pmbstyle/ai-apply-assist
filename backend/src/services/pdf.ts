import pdf from 'pdf-parse'
import { promises as fs } from 'fs'

export async function parsePDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath)
    const data = await pdf(dataBuffer)
    return data.text
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to parse PDF file')
  }
}

export async function parseText(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    console.error('Error reading text file:', error)
    throw new Error('Failed to read text file')
  }
}
