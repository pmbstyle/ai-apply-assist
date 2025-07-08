<template>
  <div class="min-h-screen bg-base-100 p-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <img
          src="/logo.png"
          alt="AI Apply Assistant Logo"
          class="w-64 mx-auto mb-4"
        />
        <p class="text-base-content/70">
          Configure your AI provider to get started
        </p>
      </div>

      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <button
            @click="router.push('/')"
            class="btn btn-sm btn-ghost"
            v-if="settingsStore.settings != null"
          >
            Back to Home
          </button>
          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text text-lg font-semibold">AI Provider</span>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label
                v-for="provider in providers"
                :key="provider.id"
                class="label cursor-pointer border rounded-lg p-4 hover:bg-base-300 transition-colors"
                :class="{
                  'border-primary bg-primary/10': form.provider === provider.id,
                }"
              >
                <div class="text-center w-full">
                  <input
                    v-model="form.provider"
                    type="radio"
                    :value="provider.id"
                    class="radio radio-primary mb-2"
                    @change="onProviderChange"
                  />
                  <div class="font-semibold">{{ provider.name }}</div>
                  <div class="text-sm text-base-content/70">
                    {{ provider.description }}
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="form.provider" class="space-y-4">
            <div v-if="requiresApiKey" class="form-control">
              <label class="label">
                <span class="label-text">API Key *</span>
              </label>
              <input
                v-model="form.apiKey"
                type="password"
                placeholder="Enter your API key"
                class="input input-bordered"
                required
              />
            </div>

            <div v-if="form.provider !== 'openai'" class="form-control">
              <label class="label">
                <span class="label-text">Base URL *</span>
              </label>
              <input
                v-model="form.baseUrl"
                type="url"
                placeholder="http://localhost:11434"
                class="input input-bordered"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Skills Extraction Model</span>
                </label>
                <input
                  v-model="form.extractModel"
                  type="text"
                  placeholder="Model for extracting skills"
                  class="input input-bordered"
                />
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text">Resume Optimization Model</span>
                </label>
                <input
                  v-model="form.optimizeModel"
                  type="text"
                  placeholder="Model for optimizing resumes"
                  class="input input-bordered"
                />
              </div>
            </div>

            <div class="alert alert-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h3 class="font-bold">
                  {{ getProviderInfo(form.provider)?.name }} Configuration
                </h3>
                <div class="text-sm">
                  <p>{{ getProviderInfo(form.provider)?.details }}</p>
                  <div
                    v-if="getProviderInfo(form.provider)?.examples"
                    class="mt-2"
                  >
                    <p class="font-semibold">Example models:</p>
                    <ul class="list-disc list-inside">
                      <li
                        v-for="example in getProviderInfo(form.provider)
                          ?.examples"
                        :key="example"
                      >
                        {{ example }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card-actions justify-end mt-6">
            <button
              @click="testConfiguration"
              :disabled="!canTest || testing"
              class="btn btn-outline"
            >
              <span v-if="testing" class="loading loading-spinner"></span>
              {{ testing ? 'Testing...' : 'Test Configuration' }}
            </button>

            <button
              @click="saveConfiguration"
              :disabled="!canSave || saving"
              class="btn btn-primary"
            >
              <span v-if="saving" class="loading loading-spinner"></span>
              {{ saving ? 'Saving...' : 'Save & Continue' }}
            </button>
          </div>

          <div v-if="testResult" class="mt-4">
            <div
              class="alert"
              :class="testResult.success ? 'alert-success' : 'alert-error'"
            >
              <svg
                v-if="testResult.success"
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ testResult.message }}</span>
            </div>
          </div>

          <div v-if="error" class="alert alert-error mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="provider in providers"
          :key="provider.id"
          class="card bg-base-200 shadow"
        >
          <div class="card-body">
            <h3 class="card-title text-lg">{{ provider.name }}</h3>
            <p class="text-sm text-base-content/70">
              {{ provider.setupInstructions }}
            </p>
            <div v-if="provider.links" class="card-actions justify-start">
              <a
                v-for="link in provider.links"
                :key="link.text"
                :href="link.url"
                target="_blank"
                class="btn btn-xs btn-outline"
              >
                {{ link.text }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore, type AIProviderConfig } from '@/stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const form = ref<AIProviderConfig>({
  provider: 'openai',
  apiKey: '',
  baseUrl: '',
  extractModel: '',
  optimizeModel: '',
})

const testing = ref(false)
const saving = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-3.5 & GPT-4 models',
    setupInstructions:
      'Get your API key from OpenAI platform and enter it above.',
    links: [
      { text: 'Get API Key', url: 'https://platform.openai.com/api-keys' },
      { text: 'Documentation', url: 'https://platform.openai.com/docs' },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Local AI models',
    setupInstructions:
      'Install Ollama locally and pull your preferred model (e.g., llama3.1).',
    links: [
      { text: 'Download Ollama', url: 'https://ollama.ai' },
      { text: 'Model Library', url: 'https://ollama.ai/library' },
    ],
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    description: 'Local model interface',
    setupInstructions:
      'Install LM Studio and start the local server with your preferred model.',
    links: [{ text: 'Download LM Studio', url: 'https://lmstudio.ai' }],
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'OpenAI-compatible API',
    setupInstructions:
      'Use any OpenAI-compatible API endpoint. Configure the base URL and API key.',
    links: [],
  },
]

const providerDetails = {
  openai: {
    name: 'OpenAI',
    details:
      'Requires an API key from OpenAI. Uses GPT models for high-quality results.',
    examples: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o'],
  },
  ollama: {
    name: 'Ollama',
    details:
      'Runs AI models locally. Requires Ollama to be installed and running.',
    examples: ['llama3.1', 'mistral', 'codellama', 'phi3'],
  },
  lmstudio: {
    name: 'LM Studio',
    details:
      'Local AI model interface. Requires LM Studio with a loaded model.',
    examples: [
      'Meta-Llama-3.1-8B-Instruct-GGUF',
      'Mistral-7B-Instruct-v0.3-GGUF',
    ],
  },
  custom: {
    name: 'Custom API',
    details:
      'Any OpenAI-compatible API. Configure the base URL and optionally an API key.',
    examples: ['custom-model-1', 'your-model-name'],
  },
}

const requiresApiKey = computed(() => {
  return form.value.provider === 'openai' || form.value.provider === 'custom'
})

const canTest = computed(() => {
  if (!form.value.provider) return false

  if (requiresApiKey.value && !form.value.apiKey?.trim()) return false

  if (form.value.provider !== 'openai' && !form.value.baseUrl?.trim())
    return false

  return true
})

const canSave = computed(() => {
  return canTest.value && testResult.value?.success
})

const error = computed(() => settingsStore.error)

const getProviderInfo = (providerId: string) => {
  return providerDetails[providerId as keyof typeof providerDetails]
}

const onProviderChange = () => {
  const defaultConfig = settingsStore.getDefaultConfig(form.value.provider)
  if (defaultConfig) {
    form.value = { ...defaultConfig, apiKey: form.value.apiKey }
  }

  testResult.value = null
}

const testConfiguration = async () => {
  if (!canTest.value) return

  testing.value = true
  testResult.value = null

  try {
    const result = await settingsStore.testConfig(form.value)
    testResult.value = result
  } catch (err) {
    testResult.value = {
      success: false,
      message: err instanceof Error ? err.message : 'Configuration test failed',
    }
  } finally {
    testing.value = false
  }
}

const saveConfiguration = async () => {
  if (!canSave.value) return

  saving.value = true

  try {
    await settingsStore.updateSettings(form.value)

    router.push('/')
  } catch (err) {
    console.error('Failed to save configuration:', err)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    settingsStore.fetchDefaults(),
    settingsStore.fetchSettings(),
  ])

  if (settingsStore.settings?.configured) {
    form.value = {
      provider: settingsStore.settings.provider,
      baseUrl: settingsStore.settings.baseUrl,
      model: settingsStore.settings.model,
      extractModel: settingsStore.settings.extractModel,
      optimizeModel: settingsStore.settings.optimizeModel,
      apiKey: '',
    }
  } else {
    const defaultConfig = settingsStore.getDefaultConfig('openai')
    if (defaultConfig) {
      form.value = { ...defaultConfig }
    }
  }
})
</script>
