import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../models/database'
import { resumes, NewResume } from '../models/schema'
import { parsePDF, parseText } from '../services/pdf'
import { eq } from 'drizzle-orm'
import path from 'path'
import { promises as fs } from 'fs'

const createResumeSchema = z.object({
  filename: z.string(),
  originalText: z.string(),
})

const updateResumeSchema = z.object({
  originalText: z.string(),
})

export async function resumeRoutes(fastify: FastifyInstance) {
  fastify.post('/upload', async (request, reply) => {
    try {
      const data = await request.file()
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' })
      }

      const allowedTypes = ['application/pdf', 'text/plain']
      if (!allowedTypes.includes(data.mimetype)) {
        return reply
          .code(400)
          .send({ error: 'Only PDF and text files are allowed' })
      }

      const filename = `${Date.now()}-${data.filename}`
      const filepath = path.join('./uploads', filename)

      await fs.writeFile(filepath, await data.toBuffer())

      let text: string
      if (data.mimetype === 'application/pdf') {
        text = await parsePDF(filepath)
      } else {
        text = await parseText(filepath)
      }

      const newResume: NewResume = {
        filename: data.filename,
        originalText: text,
        uploadedAt: new Date().toISOString(),
      }

      const [resume] = await db.insert(resumes).values(newResume).returning()

      await fs.unlink(filepath)

      return reply.send(resume)
    } catch (error) {
      console.error('Error uploading resume:', error)
      return reply.code(500).send({ error: 'Failed to upload resume' })
    }
  })

  fastify.get('/', async (request, reply) => {
    try {
      const allResumes = await db.select().from(resumes)
      return reply.send(allResumes)
    } catch (error) {
      console.error('Error fetching resumes:', error)
      return reply.code(500).send({ error: 'Failed to fetch resumes' })
    }
  })

  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const resume = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, parseInt(id)))

      if (resume.length === 0) {
        return reply.code(404).send({ error: 'Resume not found' })
      }

      return reply.send(resume[0])
    } catch (error) {
      console.error('Error fetching resume:', error)
      return reply.code(500).send({ error: 'Failed to fetch resume' })
    }
  })

  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = updateResumeSchema.parse(request.body)

      const [updatedResume] = await db
        .update(resumes)
        .set({ originalText: body.originalText })
        .where(eq(resumes.id, parseInt(id)))
        .returning()

      if (!updatedResume) {
        return reply.code(404).send({ error: 'Resume not found' })
      }

      return reply.send(updatedResume)
    } catch (error) {
      console.error('Error updating resume:', error)
      return reply.code(500).send({ error: 'Failed to update resume' })
    }
  })

  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await db.delete(resumes).where(eq(resumes.id, parseInt(id)))
      return reply.send({ message: 'Resume deleted successfully' })
    } catch (error) {
      console.error('Error deleting resume:', error)
      return reply.code(500).send({ error: 'Failed to delete resume' })
    }
  })
}
