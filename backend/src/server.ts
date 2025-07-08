import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import { resumeRoutes } from './routes/resumes'
import { opportunityRoutes } from './routes/opportunities'
import { llmRoutes } from './routes/llm'
import { promises as fs } from 'fs'
import path from 'path'

const fastify = Fastify({
  logger: true,
})

async function start() {
  try {
    await fs.mkdir('./uploads', { recursive: true })

    await fastify.register(cors, {
      origin: true,
    })

    await fastify.register(multipart)

    await fastify.register(resumeRoutes, { prefix: '/api/resumes' })
    await fastify.register(opportunityRoutes, { prefix: '/api/opportunities' })
    await fastify.register(llmRoutes, { prefix: '/api/llm' })

    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() }
    })

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on port ${port}`)
  } catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

start()
