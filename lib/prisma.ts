// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function buildDatasourceUrl() {
  const base = process.env.DATABASE_URL
  if (!base) return undefined

  try {
    const parsed = new URL(base)

    // Supabase pooler: switch from session mode (5432) to transaction mode (6543)
    // to avoid MaxClientsInSessionMode errors in serverless workloads.
    const isSupabasePooler = parsed.hostname.includes('pooler.supabase.com')
    if (isSupabasePooler && parsed.port === '5432') {
      parsed.port = '6543'
    }

    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1')
    }
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '20')
    }
    if (isSupabasePooler && !parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true')
    }

    return parsed.toString()
  } catch {
    const hasQuery = base.includes('?')
    const hasConnectionLimit = base.includes('connection_limit=')
    const hasPoolTimeout = base.includes('pool_timeout=')

    let url = base
    if (!hasConnectionLimit) {
      url += `${hasQuery ? '&' : '?'}connection_limit=1`
    }
    if (!hasPoolTimeout) {
      url += `${url.includes('?') ? '&' : '?'}pool_timeout=20`
    }

    return url
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: buildDatasourceUrl(),
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma