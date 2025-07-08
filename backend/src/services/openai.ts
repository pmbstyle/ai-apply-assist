import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ExtractedSkills {
  hardSkills: string[]
  softSkills: string[]
}

export async function extractSkills(
  jobDescription: string
): Promise<ExtractedSkills> {
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
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(content) as ExtractedSkills
  } catch (error) {
    console.error('Error extracting skills:', error)
    throw new Error('Failed to extract skills from job description')
  }
}

export async function optimizeResume(
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
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 5000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return content
  } catch (error) {
    console.error('Error optimizing resume:', error)
    throw new Error('Failed to optimize resume')
  }
}
