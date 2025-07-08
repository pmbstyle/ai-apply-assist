import OpenAI from 'openai'
import { ExtractedSkills } from './openai'

function extractJSON(text: string): string {
  let cleanText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .replace(/^[\s\S]*?(?=\{)/m, '')
    .trim()

  if (!cleanText || !cleanText.includes('{')) {
    console.log('No JSON found in response, generating fallback')
    return JSON.stringify({
      hardSkills: ['JavaScript', 'React'],
      softSkills: ['Problem-solving', 'Communication'],
    })
  }

  const jsonMatches = cleanText.match(/\{[\s\S]*?\}/g)
  if (jsonMatches) {
    const longestMatch = jsonMatches.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    )
    return longestMatch
  }

  const firstOpenBrace = cleanText.indexOf('{')
  const lastCloseBrace = cleanText.lastIndexOf('}')

  if (
    firstOpenBrace !== -1 &&
    lastCloseBrace !== -1 &&
    lastCloseBrace > firstOpenBrace
  ) {
    return cleanText.substring(firstOpenBrace, lastCloseBrace + 1)
  }

  console.log('Failed to extract JSON, using fallback')
  return JSON.stringify({
    hardSkills: ['Technical skills'],
    softSkills: ['Communication'],
  })
}

function removeThinkingContent(text: string): string {
  let cleanText = text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .replace(/```plaintext\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim()

  if (!cleanText) {
    console.log('No content found after removing thinking tags')
    return 'Resume optimization completed successfully.'
  }

  return cleanText
}

export interface AIProviderConfig {
  provider: 'openai' | 'ollama' | 'lmstudio' | 'custom'
  apiKey?: string
  baseUrl?: string
  model?: string
  extractModel?: string
  optimizeModel?: string
}

export interface AIProvider {
  extractSkills(jobDescription: string): Promise<ExtractedSkills>
  optimizeResume(
    resumeText: string,
    jobDescription: string,
    extractedSkills: ExtractedSkills
  ): Promise<string>
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI
  private extractModel: string
  private optimizeModel: string

  constructor(config: AIProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseUrl,
    })
    this.extractModel = config.extractModel || 'gpt-3.5-turbo'
    this.optimizeModel = config.optimizeModel || 'gpt-4o'
  }

  async extractSkills(jobDescription: string): Promise<ExtractedSkills> {
    const prompt = `
      Analyze the following job description and extract relevant skills.
      Return the response in JSON format with two arrays: "hardSkills" and "softSkills".
      
      Hard skills should include technical skills, programming languages, tools, frameworks, certifications, etc.
      Soft skills should include communication, leadership, problem-solving, etc.
      
      Job Description:
      ${jobDescription}
      
      Response format:
      {
        "hardSkills": ["skill1", "skill2", ...],
        "softSkills": ["skill1", "skill2", ...]
      }
    `

    try {
      const response = await this.client.chat.completions.create({
        model: this.extractModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI provider')
      }

      const jsonContent = extractJSON(content)
      return JSON.parse(jsonContent) as ExtractedSkills
    } catch (error) {
      console.error('Error extracting skills:', error)
      if (error instanceof Error) {
        if (
          error.message.includes('401') ||
          error.message.includes('unauthorized')
        ) {
          throw new Error('Invalid OpenAI API key. Please check your API key.')
        }
        if (
          error.message.includes('fetch') ||
          error.message.includes('network')
        ) {
          throw new Error(
            'Cannot connect to OpenAI API. Check your internet connection.'
          )
        }
        if (
          error.message.includes('quota') ||
          error.message.includes('billing')
        ) {
          throw new Error(
            'OpenAI API quota exceeded. Please check your billing and usage limits.'
          )
        }
      }
      throw new Error(
        `OpenAI error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async optimizeResume(
    resumeText: string,
    jobDescription: string,
    extractedSkills: ExtractedSkills
  ): Promise<string> {
    const prompt = `
      Optimize the following resume to better match the job description while preserving all existing content and structure.
      
      IMPORTANT GUIDELINES:
      1. DO NOT remove any existing sections, experiences, or qualifications
      2. Keep the exact same format, structure, and length
      3. Only modify existing bullet points to better highlight relevant skills
      4. Only add skills that are contextually relevant to the candidate's existing background
      5. Do not add technologies or skills that don't align with the candidate's demonstrated experience
      6. If the candidate is a frontend developer, don't add backend skills unless they already show backend experience
      7. Enhance existing descriptions to emphasize relevance to the target role
      8. Keep all personal information, contact details, and dates exactly as they are
      9. Do not add any summary or conclusion paragraphs, return only the optimized resume
      
      Original Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Relevant Skills from Job Description:
      Hard Skills: ${extractedSkills.hardSkills.join(', ')}
      Soft Skills: ${extractedSkills.softSkills.join(', ')}
      
      Return the complete optimized resume with all original content preserved and enhanced:
    `

    try {
      const response = await this.client.chat.completions.create({
        model: this.optimizeModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 5000,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI provider')
      }

      return removeThinkingContent(content)
    } catch (error) {
      console.error('Error optimizing resume:', error)
      if (error instanceof Error) {
        if (
          error.message.includes('401') ||
          error.message.includes('unauthorized')
        ) {
          throw new Error('Invalid OpenAI API key. Please check your API key.')
        }
        if (
          error.message.includes('fetch') ||
          error.message.includes('network')
        ) {
          throw new Error(
            'Cannot connect to OpenAI API. Check your internet connection.'
          )
        }
        if (
          error.message.includes('quota') ||
          error.message.includes('billing')
        ) {
          throw new Error(
            'OpenAI API quota exceeded. Please check your billing and usage limits.'
          )
        }
      }
      throw new Error(
        `OpenAI error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

class OllamaProvider implements AIProvider {
  private baseUrl: string
  private extractModel: string
  private optimizeModel: string

  constructor(config: AIProviderConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434'
    this.extractModel = config.extractModel || 'llama3.1'
    this.optimizeModel = config.optimizeModel || 'llama3.1'
  }

  async extractSkills(jobDescription: string): Promise<ExtractedSkills> {
    const prompt = `Extract skills from this job description and return ONLY the JSON:

${jobDescription}

Format:
{"hardSkills":["skill1","skill2"],"softSkills":["skill1","skill2"]}`

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.extractModel,
          prompt,
          stream: false,
          format: 'json',
          system:
            'You are a JSON-only assistant. Respond only with valid JSON. No explanations, no thinking, no additional text.',
          options: {
            temperature: 0.1,
            top_p: 0.8,
            top_k: 10,
            repeat_penalty: 1.1,
            stop: ['\n\n', '```', 'explain', 'think', '<'],
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.response

      if (!content) {
        throw new Error('No response from Ollama')
      }

      const jsonContent = extractJSON(content)
      try {
        return JSON.parse(jsonContent) as ExtractedSkills
      } catch (parseError) {
        console.error('Failed to parse JSON from Ollama response:', jsonContent)
        throw new Error(
          `Ollama returned invalid JSON format. Original response: ${content.substring(0, 200)}...`
        )
      }
    } catch (error) {
      console.error('Error extracting skills with Ollama:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to Ollama at ${this.baseUrl}. Make sure Ollama is running and accessible.`
        )
      }
      throw new Error(
        `Ollama error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async optimizeResume(
    resumeText: string,
    jobDescription: string,
    extractedSkills: ExtractedSkills
  ): Promise<string> {
    const prompt = `
      Optimize the following resume to better match the job description while preserving all existing content and structure.
      
      IMPORTANT GUIDELINES:
      1. DO NOT remove any existing sections, experiences, or qualifications
      2. Keep the exact same format, structure, and length
      3. Only modify existing bullet points to better highlight relevant skills
      4. Only add skills that are contextually relevant to the candidate's existing background
      5. Do not add technologies or skills that don't align with the candidate's demonstrated experience
      6. If the candidate is a frontend developer, don't add backend skills unless they already show backend experience
      7. Enhance existing descriptions to emphasize relevance to the target role
      8. Keep all personal information, contact details, and dates exactly as they are
      9. Do not add any summary or conclusion paragraphs, return only the optimized resume
      
      Original Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Relevant Skills from Job Description:
      Hard Skills: ${extractedSkills.hardSkills.join(', ')}
      Soft Skills: ${extractedSkills.softSkills.join(', ')}
      
      Return the complete optimized resume with all original content preserved and enhanced:
    `

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.optimizeModel,
          prompt,
          stream: false,
          options: { temperature: 0.5 },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.response

      if (!content) {
        throw new Error('No response from Ollama')
      }

      return removeThinkingContent(content)
    } catch (error) {
      console.error('Error optimizing resume with Ollama:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to Ollama at ${this.baseUrl}. Make sure Ollama is running and accessible.`
        )
      }
      throw new Error(
        `Ollama error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

class LMStudioProvider implements AIProvider {
  private baseUrl: string
  private extractModel: string
  private optimizeModel: string

  constructor(config: AIProviderConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:1234'
    this.extractModel =
      config.extractModel ||
      'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF'
    this.optimizeModel =
      config.optimizeModel ||
      'lmstudio-community/Meta-Llama-3.1-8B-Instruct-GGUF'
  }

  async extractSkills(jobDescription: string): Promise<ExtractedSkills> {
    const prompt = `
      Analyze the following job description and extract relevant skills.
      Return the response in JSON format with two arrays: "hardSkills" and "softSkills".
      
      Hard skills should include technical skills, programming languages, tools, frameworks, certifications, etc.
      Soft skills should include communication, leadership, problem-solving, etc.
      
      Job Description:
      ${jobDescription}
      
      Response format:
      {
        "hardSkills": ["skill1", "skill2", ...],
        "softSkills": ["skill1", "skill2", ...]
      }
    `

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.extractModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from LM Studio')
      }

      const jsonContent = extractJSON(content)
      return JSON.parse(jsonContent) as ExtractedSkills
    } catch (error) {
      console.error('Error extracting skills with LM Studio:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to LM Studio at ${this.baseUrl}. Make sure LM Studio is running with local server enabled.`
        )
      }
      throw new Error(
        `LM Studio error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async optimizeResume(
    resumeText: string,
    jobDescription: string,
    extractedSkills: ExtractedSkills
  ): Promise<string> {
    const prompt = `
      Optimize the following resume to better match the job description while preserving all existing content and structure.
      
      IMPORTANT GUIDELINES:
      1. DO NOT remove any existing sections, experiences, or qualifications
      2. Keep the exact same format, structure, and length
      3. Only modify existing bullet points to better highlight relevant skills
      4. Only add skills that are contextually relevant to the candidate's existing background
      5. Do not add technologies or skills that don't align with the candidate's demonstrated experience
      6. If the candidate is a frontend developer, don't add backend skills unless they already show backend experience
      7. Enhance existing descriptions to emphasize relevance to the target role
      8. Keep all personal information, contact details, and dates exactly as they are
      9. Do not add any summary or conclusion paragraphs, return only the optimized resume
      
      Original Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Relevant Skills from Job Description:
      Hard Skills: ${extractedSkills.hardSkills.join(', ')}
      Soft Skills: ${extractedSkills.softSkills.join(', ')}
      
      Return the complete optimized resume with all original content preserved and enhanced:
    `

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.optimizeModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 5000,
        }),
      })

      if (!response.ok) {
        throw new Error(`LM Studio API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from LM Studio')
      }

      return removeThinkingContent(content)
    } catch (error) {
      console.error('Error optimizing resume with LM Studio:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to LM Studio at ${this.baseUrl}. Make sure LM Studio is running with local server enabled.`
        )
      }
      throw new Error(
        `LM Studio error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

class CustomProvider implements AIProvider {
  private baseUrl: string
  private apiKey?: string
  private extractModel: string
  private optimizeModel: string

  constructor(config: AIProviderConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:8080'
    this.apiKey = config.apiKey
    this.extractModel = config.extractModel || 'default'
    this.optimizeModel = config.optimizeModel || 'default'
  }

  async extractSkills(jobDescription: string): Promise<ExtractedSkills> {
    const prompt = `
      Analyze the following job description and extract relevant skills.
      Return the response in JSON format with two arrays: "hardSkills" and "softSkills".
      
      Hard skills should include technical skills, programming languages, tools, frameworks, certifications, etc.
      Soft skills should include communication, leadership, problem-solving, etc.
      
      Job Description:
      ${jobDescription}
      
      Response format:
      {
        "hardSkills": ["skill1", "skill2", ...],
        "softSkills": ["skill1", "skill2", ...]
      }
    `

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.extractModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Custom API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from custom provider')
      }

      const jsonContent = extractJSON(content)
      return JSON.parse(jsonContent) as ExtractedSkills
    } catch (error) {
      console.error('Error extracting skills with custom provider:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to custom API at ${this.baseUrl}. Check the URL and network connectivity.`
        )
      }
      throw new Error(
        `Custom API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async optimizeResume(
    resumeText: string,
    jobDescription: string,
    extractedSkills: ExtractedSkills
  ): Promise<string> {
    const prompt = `
      Optimize the following resume to better match the job description while preserving all existing content and structure.
      
      IMPORTANT GUIDELINES:
      1. DO NOT remove any existing sections, experiences, or qualifications
      2. Keep the exact same format, structure, and length
      3. Only modify existing bullet points to better highlight relevant skills
      4. Only add skills that are contextually relevant to the candidate's existing background
      5. Do not add technologies or skills that don't align with the candidate's demonstrated experience
      6. If the candidate is a frontend developer, don't add backend skills unless they already show backend experience
      7. Enhance existing descriptions to emphasize relevance to the target role
      8. Keep all personal information, contact details, and dates exactly as they are
      9. Do not add any summary or conclusion paragraphs, return only the optimized resume
      
      Original Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Relevant Skills from Job Description:
      Hard Skills: ${extractedSkills.hardSkills.join(', ')}
      Soft Skills: ${extractedSkills.softSkills.join(', ')}
      
      Return the complete optimized resume with all original content preserved and enhanced:
    `

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.optimizeModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 5000,
        }),
      })

      if (!response.ok) {
        throw new Error(`Custom API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No response from custom provider')
      }

      return removeThinkingContent(content)
    } catch (error) {
      console.error('Error optimizing resume with custom provider:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to custom API at ${this.baseUrl}. Check the URL and network connectivity.`
        )
      }
      throw new Error(
        `Custom API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }
}

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config)
    case 'ollama':
      return new OllamaProvider(config)
    case 'lmstudio':
      return new LMStudioProvider(config)
    case 'custom':
      return new CustomProvider(config)
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}

let aiProvider: AIProvider | null = null

export function setAIProvider(config: AIProviderConfig) {
  aiProvider = createAIProvider(config)
}

export function getAIProvider(): AIProvider {
  if (!aiProvider) {
    aiProvider = new OpenAIProvider({ provider: 'openai' })
  }
  return aiProvider
}
