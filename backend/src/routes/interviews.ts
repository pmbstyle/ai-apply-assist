import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { db } from '../models/database'
import { interviews, opportunities } from '../models/schema'
import { eq, desc } from 'drizzle-orm'

const createInterviewSchema = z.object({
  opportunityId: z.number(),
  title: z.string().min(1),
  date: z.string(),
  notes: z.string().optional(),
})

const updateInterviewSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
})

export async function interviewsRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: { opportunityId: string }
  }>('/opportunities/:opportunityId/interviews', async (request, reply) => {
    try {
      const opportunityId = parseInt(request.params.opportunityId)

      const opportunity = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, opportunityId))
        .limit(1)

      if (opportunity.length === 0) {
        return reply.status(404).send({ error: 'Opportunity not found' })
      }

      const result = await db
        .select()
        .from(interviews)
        .where(eq(interviews.opportunityId, opportunityId))
        .orderBy(desc(interviews.date))

      return result
    } catch (error) {
      console.error('Error fetching interviews:', error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.post<{
    Body: z.infer<typeof createInterviewSchema>
  }>('/interviews', async (request, reply) => {
    try {
      const validatedData = createInterviewSchema.parse(request.body)

      const opportunity = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, validatedData.opportunityId))
        .limit(1)

      if (opportunity.length === 0) {
        return reply.status(404).send({ error: 'Opportunity not found' })
      }

      const [newInterview] = await db
        .insert(interviews)
        .values({
          ...validatedData,
          createdAt: new Date().toISOString(),
        })
        .returning()

      return newInterview
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors })
      }
      console.error('Error creating interview:', error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.get<{
    Params: { id: string }
  }>('/interviews/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id)

      const [interview] = await db
        .select()
        .from(interviews)
        .where(eq(interviews.id, id))
        .limit(1)

      if (!interview) {
        return reply.status(404).send({ error: 'Interview not found' })
      }

      return interview
    } catch (error) {
      console.error('Error fetching interview:', error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.put<{
    Params: { id: string }
    Body: z.infer<typeof updateInterviewSchema>
  }>('/interviews/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id)
      const validatedData = updateInterviewSchema.parse(request.body)

      const existingInterview = await db
        .select()
        .from(interviews)
        .where(eq(interviews.id, id))
        .limit(1)

      if (existingInterview.length === 0) {
        return reply.status(404).send({ error: 'Interview not found' })
      }

      const [updatedInterview] = await db
        .update(interviews)
        .set(validatedData)
        .where(eq(interviews.id, id))
        .returning()

      return updatedInterview
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: error.errors })
      }
      console.error('Error updating interview:', error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  fastify.delete<{
    Params: { id: string }
  }>('/interviews/:id', async (request, reply) => {
    try {
      const id = parseInt(request.params.id)

      const deletedRows = await db
        .delete(interviews)
        .where(eq(interviews.id, id))
        .returning()

      if (deletedRows.length === 0) {
        return reply.status(404).send({ error: 'Interview not found' })
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting interview:', error)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })
}
