export interface Resume {
  id: number
  filename: string
  originalText: string
  uploadedAt: string
}

export interface ExtractedSkills {
  hardSkills: string[]
  softSkills: string[]
}

export interface Interview {
  id: number
  opportunityId: number
  title: string
  date: string
  notes?: string
  createdAt: string
}

export interface Opportunity {
  id: number
  company: string
  position: string
  jobDescription: string
  url?: string
  salaryFrom?: number
  salaryTo?: number
  salaryNA?: boolean
  notes?: string
  status: 'applied' | 'interview' | 'accepted' | 'rejected'
  resumeId?: number
  extractedSkills?: ExtractedSkills
  optimizedResume?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOpportunityRequest {
  company: string
  position: string
  jobDescription: string
  url?: string
  salaryFrom?: number
  salaryTo?: number
  salaryNA?: boolean
  notes?: string
  resumeId: number
}

export interface UpdateOpportunityRequest {
  company?: string
  position?: string
  jobDescription?: string
  url?: string
  salaryFrom?: number
  salaryTo?: number
  salaryNA?: boolean
  notes?: string
  status?: 'applied' | 'interview' | 'accepted' | 'rejected'
  optimizedResume?: string
  resumeId?: number
  extractedSkills?: string
}
