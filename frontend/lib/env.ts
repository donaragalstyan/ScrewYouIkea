'use server'

export function assertServerEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${key} is not configured`) 
  }
  return value
}

export const GEMINI_API_KEY = assertServerEnv('GEMINI_API_KEY', process.env.GEMINI_API_KEY)

export function requireMongoConfig(): { uri: string; db: string } {
  const uri = assertServerEnv('MONGODB_URI', process.env.MONGODB_URI)
  const db = assertServerEnv('MONGODB_DB', process.env.MONGODB_DB)
  return { uri, db }
}
