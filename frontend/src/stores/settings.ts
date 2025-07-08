import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface AIProviderConfig {
  provider: 'openai' | 'ollama' | 'lmstudio' | 'custom'
  apiKey?: string
  baseUrl?: string
  model?: string
  extractModel?: string
  optimizeModel?: string
}

export interface AIProviderSettings extends Omit<AIProviderConfig, 'apiKey'> {
  configured: boolean
  hasApiKey: boolean
}

export interface AIProviderDefaults {
  openai: AIProviderConfig
  ollama: AIProviderConfig
  lmstudio: AIProviderConfig
  custom: AIProviderConfig
}

const API_BASE = 'http://localhost:3000/api'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AIProviderSettings | null>(null)
  const defaults = ref<AIProviderDefaults | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSettings = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/settings/ai-provider`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      settings.value = data
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Failed to fetch settings'
      console.error('Error fetching settings:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchDefaults = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings/ai-provider/defaults`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      defaults.value = await response.json()
    } catch (err) {
      console.error('Error fetching defaults:', err)
    }
  }

  const updateSettings = async (config: AIProviderConfig) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/settings/ai-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()

      await fetchSettings()

      return data
    } catch (err) {
      let errorMessage = 'Failed to update settings'

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage =
          'Cannot connect to server. Make sure the backend is running on http://localhost:3000'
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      error.value = errorMessage
      console.error('Error updating settings:', err)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const testConfig = async (config: AIProviderConfig) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${API_BASE}/settings/ai-provider/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`
        )
      }

      const data = await response.json()
      return data
    } catch (err) {
      let errorMessage = 'Failed to test configuration'

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage =
          'Cannot connect to server. Make sure the backend is running on http://localhost:3000'
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      error.value = errorMessage
      console.error('Error testing configuration:', err)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  const isConfigured = () => {
    return settings.value?.configured || false
  }

  const getDefaultConfig = (
    provider: AIProviderConfig['provider']
  ): AIProviderConfig | null => {
    return defaults.value?.[provider] || null
  }

  return {
    settings,
    defaults,
    loading,
    error,
    fetchSettings,
    fetchDefaults,
    updateSettings,
    testConfig,
    isConfigured,
    getDefaultConfig,
  }
})
