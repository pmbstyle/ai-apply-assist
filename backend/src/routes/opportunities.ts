import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '../models/database'
import { opportunities, resumes, NewOpportunity } from '../models/schema'
import { extractSkills, optimizeResume } from '../services/openai'
import { eq } from 'drizzle-orm'

const createOpportunitySchema = z.object({
  company: z.string(),
  position: z.string(),
  jobDescription: z.string(),
  url: z.string().optional(),
  salaryFrom: z.number().optional(),
  salaryTo: z.number().optional(),
  salaryNA: z.boolean().optional(),
  notes: z.string().optional(),
  resumeId: z.number(),
})

const updateOpportunitySchema = z.object({
  company: z.string().optional(),
  position: z.string().optional(),
  jobDescription: z.string().optional(),
  url: z.string().optional(),
  salaryFrom: z.number().optional(),
  salaryTo: z.number().optional(),
  salaryNA: z.boolean().optional(),
  notes: z.string().optional(),
  status: z.enum(['applied', 'interview', 'accepted', 'rejected']).optional(),
  optimizedResume: z.string().optional(),
  resumeId: z.number().optional(),
  extractedSkills: z.string().optional(),
})

export async function opportunityRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    try {
      const body = createOpportunitySchema.parse(request.body)

      const [resume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, body.resumeId))
      if (!resume) {
        return reply.code(404).send({ error: 'Resume not found' })
      }

      const skills = await extractSkills(body.jobDescription)
      const optimizedResumeText = await optimizeResume(
        resume.originalText,
        body.jobDescription,
        skills
      )

      const newOpportunity: NewOpportunity = {
        company: body.company,
        position: body.position,
        jobDescription: body.jobDescription,
        url: body.url,
        salaryFrom: body.salaryFrom,
        salaryTo: body.salaryTo,
        salaryNA: body.salaryNA,
        notes: body.notes,
        resumeId: body.resumeId,
        extractedSkills: JSON.stringify(skills),
        optimizedResume: optimizedResumeText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const [opportunity] = await db
        .insert(opportunities)
        .values(newOpportunity)
        .returning()

      return reply.send({
        ...opportunity,
        extractedSkills: skills,
      })
    } catch (error) {
      console.error('Error creating opportunity:', error)
      return reply.code(500).send({ error: 'Failed to create opportunity' })
    }
  })

  fastify.get('/', async (request, reply) => {
    try {
      const allOpportunities = await db.select().from(opportunities)
      return reply.send(
        allOpportunities.map(opp => ({
          ...opp,
          extractedSkills: opp.extractedSkills
            ? JSON.parse(opp.extractedSkills)
            : null,
        }))
      )
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      return reply.code(500).send({ error: 'Failed to fetch opportunities' })
    }
  })

  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const [opportunity] = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, parseInt(id)))

      if (!opportunity) {
        return reply.code(404).send({ error: 'Opportunity not found' })
      }

      return reply.send({
        ...opportunity,
        extractedSkills: opportunity.extractedSkills
          ? JSON.parse(opportunity.extractedSkills)
          : null,
      })
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      return reply.code(500).send({ error: 'Failed to fetch opportunity' })
    }
  })

  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const body = updateOpportunitySchema.parse(request.body)

      const updateData = {
        ...body,
        updatedAt: new Date().toISOString(),
      }

      const [updatedOpportunity] = await db
        .update(opportunities)
        .set(updateData)
        .where(eq(opportunities.id, parseInt(id)))
        .returning()

      if (!updatedOpportunity) {
        return reply.code(404).send({ error: 'Opportunity not found' })
      }

      return reply.send({
        ...updatedOpportunity,
        extractedSkills: updatedOpportunity.extractedSkills
          ? JSON.parse(updatedOpportunity.extractedSkills)
          : null,
      })
    } catch (error) {
      console.error('Error updating opportunity:', error)
      return reply.code(500).send({ error: 'Failed to update opportunity' })
    }
  })

  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await db.delete(opportunities).where(eq(opportunities.id, parseInt(id)))
      return reply.send({ message: 'Opportunity deleted successfully' })
    } catch (error) {
      console.error('Error deleting opportunity:', error)
      return reply.code(500).send({ error: 'Failed to delete opportunity' })
    }
  })
}
