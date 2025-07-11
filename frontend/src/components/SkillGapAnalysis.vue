<template>
  <div class="card bg-base-200 shadow-lg">
    <div class="card-body">
      <h3 class="card-title mb-4">Skill Gap Analysis</h3>

      <div
        v-if="!extractedSkills || !resumeText"
        class="text-center py-8 text-base-content/60"
      >
        <svg
          class="w-12 h-12 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          ></path>
        </svg>
        <p>No skills to analyze</p>
        <p class="text-sm">
          Extract skills from job description and add resume content
        </p>
      </div>

      <div v-else class="space-y-6">
        <div class="text-center">
          <div
            class="radial-progress text-primary border-4 border-primary/20"
            :style="`--value:${overallMatchPercentage}; --size:8rem; --thickness: 8px;`"
          >
            <span class="text-2xl font-bold"
              >{{ overallMatchPercentage }}%</span
            >
          </div>
          <p class="mt-2 text-lg font-semibold">Overall Match Score</p>
          <p class="text-sm text-base-content/70">
            {{ matchScoreDescription }}
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold">Hard Skills</h4>
            <span class="text-sm text-base-content/70">
              {{ matchedHardSkills.length }}/{{
                extractedSkills.hardSkills.length
              }}
              matched
            </span>
          </div>

          <div class="grid gap-2">
            <SkillMatchIndicator
              v-for="skill in extractedSkills.hardSkills"
              :key="skill"
              :skill="skill"
              :matched="isSkillMatched(skill)"
              type="hard"
            />
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <h4 class="font-semibold">Soft Skills</h4>
            <span class="text-sm text-base-content/70">
              {{ matchedSoftSkills.length }}/{{
                extractedSkills.softSkills.length
              }}
              matched
            </span>
          </div>

          <div class="grid gap-2">
            <SkillMatchIndicator
              v-for="skill in extractedSkills.softSkills"
              :key="skill"
              :skill="skill"
              :matched="isSkillMatched(skill)"
              type="soft"
            />
          </div>
        </div>

        <div v-if="missingSkills.length > 0" class="space-y-3">
          <h4 class="font-semibold text-warning">Skills to Highlight</h4>
          <div class="bg-warning/10 border border-warning/20 rounded-lg p-3">
            <p class="text-sm text-warning-content/80 mb-2">
              Consider emphasizing these skills in your resume:
            </p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="skill in missingSkills"
                :key="skill"
                class="badge badge-warning badge-sm"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="recommendations.length > 0" class="space-y-3">
          <h4 class="font-semibold text-info">Recommendations</h4>
          <div class="bg-info/10 border border-info/20 rounded-lg p-3">
            <ul class="list-disc list-inside space-y-1 text-sm">
              <li
                v-for="recommendation in recommendations"
                :key="recommendation"
              >
                {{ recommendation }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExtractedSkills } from '@/types'
import SkillMatchIndicator from '@/components/SkillMatchIndicator.vue'

interface Props {
  extractedSkills: ExtractedSkills | null
  resumeText: string
}

const props = defineProps<Props>()

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const isSkillMatched = (skill: string): boolean => {
  if (!props.resumeText) return false

  const normalizedResume = normalizeText(props.resumeText)
  const normalizedSkill = normalizeText(skill)

  if (normalizedResume.includes(normalizedSkill)) return true

  const skillWords = normalizedSkill.split(' ')
  const skillVariations = generateSkillVariations(skill)

  return (
    skillVariations.some(variation =>
      normalizedResume.includes(normalizeText(variation))
    ) || skillWords.every(word => normalizedResume.includes(word))
  )
}

const generateSkillVariations = (skill: string): string[] => {
  const variations = [skill]
  const lower = skill.toLowerCase()

  const variationMap: Record<string, string[]> = {
    // need to re-think this with db and search
    javascript: ['js', 'ecmascript', 'node.js', 'nodejs'],
    typescript: ['ts'],
    react: ['reactjs', 'react.js'],
    vue: ['vuejs', 'vue.js'],
    angular: ['angularjs'],
    python: ['py'],
    'c#': ['csharp', 'c sharp'],
    sql: ['mysql', 'postgresql', 'sqlite'],
    aws: ['amazon web services'],
    api: ['rest api', 'restful', 'api development'],
    ui: ['user interface'],
    ux: ['user experience'],
    css: ['cascading style sheets', 'styling'],
    html: ['markup', 'hypertext'],
    git: ['version control', 'source control'],
    docker: ['containerization'],
    kubernetes: ['k8s', 'container orchestration'],
    mongodb: ['mongo', 'nosql'],
    postgresql: ['postgres', 'psql'],
    'machine learning': ['ml', 'artificial intelligence', 'ai'],
    'data analysis': ['data analytics', 'data science'],
  }

  Object.entries(variationMap).forEach(([key, values]) => {
    if (lower.includes(key)) {
      variations.push(...values)
    }
    values.forEach(value => {
      if (lower.includes(value)) {
        variations.push(key, ...values.filter(v => v !== value))
      }
    })
  })

  return [...new Set(variations)]
}

const matchedHardSkills = computed(() => {
  if (!props.extractedSkills) return []
  return props.extractedSkills.hardSkills.filter(skill => isSkillMatched(skill))
})

const matchedSoftSkills = computed(() => {
  if (!props.extractedSkills) return []
  return props.extractedSkills.softSkills.filter(skill => isSkillMatched(skill))
})

const missingSkills = computed(() => {
  if (!props.extractedSkills) return []
  return [
    ...props.extractedSkills.hardSkills.filter(skill => !isSkillMatched(skill)),
    ...props.extractedSkills.softSkills.filter(skill => !isSkillMatched(skill)),
  ]
})

const overallMatchPercentage = computed(() => {
  if (!props.extractedSkills) return 0

  const totalSkills =
    props.extractedSkills.hardSkills.length +
    props.extractedSkills.softSkills.length
  const matchedSkills =
    matchedHardSkills.value.length + matchedSoftSkills.value.length

  if (totalSkills === 0) return 0

  return Math.round((matchedSkills / totalSkills) * 100)
})

const matchScoreDescription = computed(() => {
  const score = overallMatchPercentage.value
  if (score >= 80) return 'Excellent match!'
  if (score >= 60) return 'Good match'
  if (score >= 40) return 'Fair match'
  if (score >= 20) return 'Needs improvement'
  return 'Poor match'
})

const recommendations = computed(() => {
  const recs = []
  const score = overallMatchPercentage.value

  if (score < 50) {
    recs.push(
      'Consider adding more relevant skills and experience to your resume'
    )
  }

  if (missingSkills.value.length > 0) {
    const criticalMissing = missingSkills.value.slice(0, 3)
    recs.push(`Focus on highlighting: ${criticalMissing.join(', ')}`)
  }

  if (matchedHardSkills.value.length > 0) {
    recs.push('Emphasize your technical skills more prominently in your resume')
  }

  if (
    props.extractedSkills &&
    props.extractedSkills.softSkills.length > 0 &&
    matchedSoftSkills.value.length === 0
  ) {
    recs.push(
      'Include examples that demonstrate your soft skills and leadership abilities'
    )
  }

  return recs
})
</script>
