import { Redis } from '@upstash/redis'
import { randomBytes } from 'crypto'

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  return _redis
}

export interface InviteRecord {
  code: string
  used: number
  limit: number
  remaining: number
  createdAt: string
  label: string
}

export async function createInviteCode(label: string): Promise<string> {
  const code = randomBytes(5).toString('hex') // 10 位 hex 字符串
  const redis = getRedis()
  await redis.hset(`invite:${code}`, {
    used: 0,
    limit: 6,
    createdAt: new Date().toISOString(),
    label: label || '',
  })
  await redis.lpush('invite:list', code)
  return code
}

export async function listInviteCodes(): Promise<InviteRecord[]> {
  const redis = getRedis()
  const codes = await redis.lrange<string>('invite:list', 0, -1)
  if (codes.length === 0) return []

  const pipeline = redis.pipeline()
  for (const code of codes) {
    pipeline.hgetall(`invite:${code}`)
  }
  const results = await pipeline.exec()

  return codes.map((code, i) => {
    const data = results[i] as Record<string, string> | null
    const used = parseInt(data?.used ?? '0', 10)
    const limit = parseInt(data?.limit ?? '6', 10)
    return {
      code,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      createdAt: data?.createdAt ?? '',
      label: data?.label ?? '',
    }
  })
}

export async function validateInviteCode(code: string): Promise<{ valid: boolean; remaining: number }> {
  if (!code) return { valid: false, remaining: 0 }
  const redis = getRedis()
  const data = await redis.hgetall<Record<string, string>>(`invite:${code}`)
  if (!data) return { valid: false, remaining: 0 }

  const used = parseInt(data.used ?? '0', 10)
  const limit = parseInt(data.limit ?? '6', 10)
  const remaining = Math.max(0, limit - used)
  return { valid: remaining > 0, remaining }
}

export async function checkAndIncrementInvite(
  code: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!code) return { allowed: false, remaining: 0 }

  const redis = getRedis()
  const data = await redis.hgetall<Record<string, string>>(`invite:${code}`)
  if (!data) return { allowed: false, remaining: 0 }

  const used = parseInt(data.used ?? '0', 10)
  const limit = parseInt(data.limit ?? '6', 10)
  if (used >= limit) return { allowed: false, remaining: 0 }

  await redis.hincrby(`invite:${code}`, 'used', 1)
  return { allowed: true, remaining: Math.max(0, limit - used - 1) }
}
