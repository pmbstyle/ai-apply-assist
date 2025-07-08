import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { db } from './models/database'

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: 'drizzle' })
  console.log('Migrations completed!')
  process.exit(0)
}

main().catch(error => {
  console.error('Migration failed:', error)
  process.exit(1)
})
