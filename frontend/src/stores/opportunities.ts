import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Opportunity,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
} from '@/types'
import { opportunityApi } from '@/services/api'

export const useOpportunityStore = defineStore('opportunities', () => {
  const opportunities = ref<Opportunity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const opportunitiesByStatus = computed(() => {
    return {
      applied: opportunities.value.filter(opp => opp.status === 'applied'),
      interview: opportunities.value.filter(opp => opp.status === 'interview'),
      accepted: opportunities.value.filter(opp => opp.status === 'accepted'),
      rejected: opportunities.value.filter(opp => opp.status === 'rejected'),
    }
  })

  const fetchOpportunities = async () => {
    loading.value = true
    error.value = null
    try {
      opportunities.value = await opportunityApi.getAll()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch opportunities'
    } finally {
      loading.value = false
    }
  }

  const createOpportunity = async (opportunity: CreateOpportunityRequest) => {
    loading.value = true
    error.value = null
    try {
      const newOpportunity = await opportunityApi.create(opportunity)
      opportunities.value.push(newOpportunity)
      return newOpportunity
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to create opportunity'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateOpportunity = async (
    id: number,
    updates: UpdateOpportunityRequest
  ) => {
    loading.value = true
    error.value = null
    try {
      const updatedOpportunity = await opportunityApi.update(id, updates)
      const index = opportunities.value.findIndex(opp => opp.id === id)
      if (index !== -1) {
        opportunities.value[index] = updatedOpportunity
      }
      return updatedOpportunity
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to update opportunity'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteOpportunity = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await opportunityApi.delete(id)
      opportunities.value = opportunities.value.filter(opp => opp.id !== id)
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to delete opportunity'
      throw err
    } finally {
      loading.value = false
    }
  }

  const moveOpportunity = async (
    id: number,
    newStatus: Opportunity['status']
  ) => {
    await updateOpportunity(id, { status: newStatus })
  }

  const getOpportunityById = (id: number) => {
    return opportunities.value.find(opp => opp.id === id)
  }

  const fetchOpportunityById = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      const opportunity = await opportunityApi.getById(id)
      const index = opportunities.value.findIndex(opp => opp.id === id)
      if (index !== -1) {
        opportunities.value[index] = opportunity
      } else {
        opportunities.value.push(opportunity)
      }
      return opportunity
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch opportunity'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    opportunities,
    opportunitiesByStatus,
    loading,
    error,
    fetchOpportunities,
    fetchOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    moveOpportunity,
    getOpportunityById,
  }
})
