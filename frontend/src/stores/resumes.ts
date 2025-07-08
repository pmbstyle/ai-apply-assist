import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Resume } from '@/types'
import { resumeApi } from '@/services/api'

export const useResumeStore = defineStore('resumes', () => {
  const resumes = ref<Resume[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchResumes = async () => {
    loading.value = true
    error.value = null
    try {
      resumes.value = await resumeApi.getAll()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch resumes'
    } finally {
      loading.value = false
    }
  }

  const uploadResume = async (file: File) => {
    loading.value = true
    error.value = null
    try {
      const newResume = await resumeApi.upload(file)
      resumes.value.push(newResume)
      return newResume
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to upload resume'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateResume = async (id: number, originalText: string) => {
    loading.value = true
    error.value = null
    try {
      const updatedResume = await resumeApi.update(id, originalText)
      const index = resumes.value.findIndex(r => r.id === id)
      if (index !== -1) {
        resumes.value[index] = updatedResume
      }
      return updatedResume
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to update resume'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteResume = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await resumeApi.delete(id)
      resumes.value = resumes.value.filter(r => r.id !== id)
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to delete resume'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getResumeById = (id: number) => {
    return resumes.value.find(r => r.id === id)
  }

  return {
    resumes,
    loading,
    error,
    fetchResumes,
    uploadResume,
    updateResume,
    deleteResume,
    getResumeById,
  }
})
