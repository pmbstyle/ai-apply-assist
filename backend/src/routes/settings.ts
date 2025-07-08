import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { setAIProvider, AIProviderConfig } from '../services/ai-provider'
import fs from 'fs/promises'
import path from 'path'

const AIProviderConfigSchema = z.object({
  provider: z.enum(['openai', 'ollama', 'lmstudio', 'custom']),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  model: z.string().optional(),
  extractModel: z.string().optional(),
  optimizeModel: z.string().optional(),
})

const SETTINGS_FILE = path.join(process.cwd(), 'ai-settings.json')

async function loadSettings(): Promise<AIProviderConfig | null> {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8')
    return JSON.parse(data) as AIProviderConfig
  } catch (error) {
    return null
  }
}

async function saveSettings(config: AIProviderConfig): Promise<void> {
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(config, null, 2))
}

async function testAIProvider(
  config: AIProviderConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const { createAIProvider } = await import('../services/ai-provider')
    const provider = createAIProvider(config)

    await provider.extractSkills(
      'Test job description for software engineer requiring JavaScript and React skills.'
    )
    return { success: true }
  } catch (error) {
    console.error('AI provider test failed:', error)
    let errorMessage = 'Unknown error occurred'

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return { success: false, error: errorMessage }
  }
}

export default async function settingsRoutes(fastify: FastifyInstance) {
  fastify.get('/settings/ai-provider', async (request, reply) => {
    try {
      const settings = await loadSettings()

      if (!settings) {
        return reply.code(200).send({
          provider: 'openai',
          configured: false,
          message: 'No AI provider configured',
        })
      }

      const safeSettings = {
        provider: settings.provider,
        baseUrl: settings.baseUrl,
        model: settings.model,
        extractModel: settings.extractModel,
        optimizeModel: settings.optimizeModel,
        configured: true,
        hasApiKey: !!settings.apiKey,
      }

      return reply.code(200).send(safeSettings)
    } catch (error) {
      console.error('Error getting AI provider settings:', error)
      return reply
        .code(500)
        .send({ error: 'Failed to get AI provider settings' })
    }
  })

  fastify.post('/settings/ai-provider', async (request, reply) => {
    try {
      const config = AIProviderConfigSchema.parse(request.body)

      const testResult = await testAIProvider(config)

      if (!testResult.success) {
        return reply.code(400).send({
          error: 'AI provider test failed',
          message:
            testResult.error ||
            'Could not connect to the AI provider with the provided configuration',
        })
      }

      await saveSettings(config)

      setAIProvider(config)

      return reply.code(200).send({
        success: true,
        message: 'AI provider settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating AI provider settings:', error)

      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Invalid configuration',
          message: 'Please check your configuration parameters',
          details: error.errors,
        })
      }

      return reply.code(500).send({
        error: 'Failed to update AI provider settings',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  })

  fastify.post('/settings/ai-provider/test', async (request, reply) => {
    try {
      const config = AIProviderConfigSchema.parse(request.body)
      const testResult = await testAIProvider(config)

      return reply.code(200).send({
        success: testResult.success,
        message: testResult.success
          ? 'AI provider configuration is working'
          : testResult.error || 'AI provider configuration failed',
      })
    } catch (error) {
      console.error('Error testing AI provider:', error)

      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Invalid configuration',
          message: 'Please check your configuration parameters',
        })
      }

      return reply.code(500).send({
        success: false,
        error: 'Failed to test AI provider configuration',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  })

  fastify.get('/settings/ai-provider/defaults', async (request, reply) => {
    const defaults = {
      openai: {
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        extractModel: 'gpt-3.5-turbo',
        optimizeModel: 'gpt-4o',
      },
      ollama: {
        provider: 'ollama',
        baseUrl: 'http://localhost:11434',
        extractModel: 'llama3.1',
        optimizeModel: 'llama3.1',
      },
      lmstudio: {
        provider: 'lmstudio',
        baseUrl: 'http://localhost:1234',
        extractModel: 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF',
        optimizeModel: 'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF',
      },
      custom: {
        provider: 'custom',
        baseUrl: 'http://localhost:8080',
        extractModel: 'default',
        optimizeModel: 'default',
      },
    }

    return reply.code(200).send(defaults)
  })
}

export async function initializeAIProvider(): Promise<void> {
  try {
    const settings = await loadSettings()
    if (settings) {
      setAIProvider(settings)
      console.log(`AI provider initialized: ${settings.provider}`)
    } else {
      console.log(
        'No AI provider settings found, using default OpenAI configuration'
      )
    }
  } catch (error) {
    console.error('Error initializing AI provider:', error)
    console.log('Falling back to default OpenAI configuration')
  }
}
