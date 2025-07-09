import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const resumes = sqliteTable('resumes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  originalText: text('original_text').notNull(),
  originalMarkdown: text('original_markdown'),
  uploadedAt: text('uploaded_at').notNull(),
})

export const opportunities = sqliteTable('opportunities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company: text('company').notNull(),
  position: text('position').notNull(),
  jobDescription: text('job_description').notNull(),
  url: text('url'),
  salaryFrom: integer('salary_from'),
  salaryTo: integer('salary_to'),
  salaryNA: integer('salary_na', { mode: 'boolean' }).default(false),
  notes: text('notes'),
  status: text('status', {
    enum: ['applied', 'interview', 'accepted', 'rejected'],
  })
    .notNull()
    .default('applied'),
  resumeId: integer('resume_id').references(() => resumes.id),
  extractedSkills: text('extracted_skills'),
  optimizedResume: text('optimized_resume'),
  resumeMarkdown: text('resume_markdown'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const interviews = sqliteTable('interviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
  title: text('title').notNull(),
  date: text('date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
})

export const resumesRelations = relations(resumes, ({ many }) => ({
  opportunities: many(opportunities),
}))

export const opportunitiesRelations = relations(
  opportunities,
  ({ one, many }) => ({
    resume: one(resumes, {
      fields: [opportunities.resumeId],
      references: [resumes.id],
    }),
    interviews: many(interviews),
  })
)

export const interviewsRelations = relations(interviews, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [interviews.opportunityId],
    references: [opportunities.id],
  }),
}))

export type Resume = typeof resumes.$inferSelect
export type NewResume = typeof resumes.$inferInsert
export type Opportunity = typeof opportunities.$inferSelect
export type NewOpportunity = typeof opportunities.$inferInsert
export type Interview = typeof interviews.$inferSelect
export type NewInterview = typeof interviews.$inferInsert
