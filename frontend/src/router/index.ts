import { createRouter, createWebHistory } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/setup',
      name: 'Setup',
      component: () => import('@/views/SetupView.vue'),
      meta: { requiresSetup: false },
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresSetup: true },
    },
    {
      path: '/opportunity/:id',
      name: 'OpportunityDetails',
      component: () => import('@/views/OpportunityDetailsView.vue'),
      meta: { requiresSetup: true },
    },
    {
      path: '/opportunity/:id/edit',
      name: 'OpportunityEdit',
      component: () => import('@/views/OpportunityEditView.vue'),
      meta: { requiresSetup: true },
    },
  ],
})

router.beforeEach(async to => {
  if (to.name === 'Setup') {
    return true
  }

  if (to.meta.requiresSetup) {
    const settingsStore = useSettingsStore()

    if (settingsStore.settings === null) {
      await settingsStore.fetchSettings()
    }

    if (!settingsStore.isConfigured()) {
      return { name: 'Setup' }
    }
  }

  return true
})

export default router
