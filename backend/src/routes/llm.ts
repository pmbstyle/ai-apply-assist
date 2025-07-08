import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getAIProvider } from '../services/ai-provider'

const extractSkillsSchema = z.object({
  jobDescription: z.string(),
})

const optimizeResumeSchema = z.object({
  resumeText: z.string(),
  jobDescription: z.string(),
  extractedSkills: z.object({
    hardSkills: z.array(z.string()),
    softSkills: z.array(z.string()),
  }),
})

export async function llmRoutes(fastify: FastifyInstance) {
  fastify.post('/extract-skills', async (request, reply) => {
    try {
      const body = extractSkillsSchema.parse(request.body)
      const aiProvider = getAIProvider()
      const skills = await aiProvider.extractSkills(body.jobDescription)
      return reply.send(skills)
    } catch (error) {
      console.error('Error extracting skills:', error)
      return reply.code(500).send({
        error: 'Failed to extract skills',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })

  fastify.post('/optimize-resume', async (request, reply) => {
    try {
      const body = optimizeResumeSchema.parse(request.body)
      const aiProvider = getAIProvider()
      const optimizedResume = await aiProvider.optimizeResume(
        body.resumeText,
        body.jobDescription,
        body.extractedSkills
      )
      return reply.send({ optimizedResume })
    } catch (error) {
      console.error('Error optimizing resume:', error)
      return reply.code(500).send({
        error: 'Failed to optimize resume',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
}
