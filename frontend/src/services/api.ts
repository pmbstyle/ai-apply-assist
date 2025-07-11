import axios from 'axios'
import type {
  Resume,
  Opportunity,
  Interview,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  ExtractedSkills,
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

export const resumeApi = {
  async upload(file: File): Promise<Resume> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getAll(): Promise<Resume[]> {
    const { data } = await api.get('/resumes')
    return data
  },

  async getById(id: number): Promise<Resume> {
    const { data } = await api.get(`/resumes/${id}`)
    return data
  },

  async update(id: number, originalText: string): Promise<Resume> {
    const { data } = await api.put(`/resumes/${id}`, { originalText })
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/resumes/${id}`)
  },
}

export const opportunityApi = {
  async create(opportunity: CreateOpportunityRequest): Promise<Opportunity> {
    const { data } = await api.post('/opportunities', opportunity)
    return data
  },

  async getAll(): Promise<Opportunity[]> {
    const { data } = await api.get('/opportunities')
    return data
  },

  async getById(id: number): Promise<Opportunity> {
    const { data } = await api.get(`/opportunities/${id}`)
    return data
  },

  async update(
    id: number,
    opportunity: UpdateOpportunityRequest
  ): Promise<Opportunity> {
    const { data } = await api.put(`/opportunities/${id}`, opportunity)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/opportunities/${id}`)
  },
}

export const interviewApi = {
  async getByOpportunityId(opportunityId: number): Promise<Interview[]> {
    const { data } = await api.get(`/opportunities/${opportunityId}/interviews`)
    return data
  },

  async create(interview: Omit<Interview, 'id' | 'createdAt'>): Promise<Interview> {
    const { data } = await api.post('/interviews', interview)
    return data
  },

  async getById(id: number): Promise<Interview> {
    const { data } = await api.get(`/interviews/${id}`)
    return data
  },

  async update(id: number, interview: Partial<Omit<Interview, 'id' | 'opportunityId' | 'createdAt'>>): Promise<Interview> {
    const { data } = await api.put(`/interviews/${id}`, interview)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/interviews/${id}`)
  },
}

export const llmApi = {
  async extractSkills(jobDescription: string): Promise<ExtractedSkills> {
    const { data } = await api.post('/llm/extract-skills', { jobDescription })
    return data
  },

  async optimizeResume(
    resumeText: string,
    jobDescription: string,
    extractedSkills: ExtractedSkills
  ): Promise<string> {
    const { data } = await api.post('/llm/optimize-resume', {
      resumeText,
      jobDescription,
      extractedSkills,
    })
    return data.optimizedResume
  },
}
