import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { join } from 'path'
import { URL } from 'url'

const prisma = new PrismaClient()

const generateDatabaseURL = (schema: string) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('please provide a database url')
  }
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)
  return url.toString()
}

export const setupTestDatabase = () => {
  const schema = `test_${Date.now()}`
  const databaseURL = generateDatabaseURL(schema)
  process.env.DATABASE_URL = databaseURL

  execSync(`prisma db push`, {
    env: {
      ...process.env,
      DATABASE_URL: databaseURL,
    },
  })

  return {
    databaseURL,
    schema,
  }
}

export const teardownTestDatabase = async (schema: string) => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`)
  await prisma.$disconnect()
}
