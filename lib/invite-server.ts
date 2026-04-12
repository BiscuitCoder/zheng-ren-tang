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

// ── 内存缓存 ──────────────────────────────────────────────────────────────────
// 进程启动后首次请求时从 Redis 一次性加载全量数据，后续所有校验/累减均在内存完成，
// 只有写操作（hincrby）才异步回写 Redis，避免每次请求都读 Redis。

interface CacheEntry {
  used: number
  limit: number
  label: string
  createdAt: string
}

const _cache = new Map<string, CacheEntry>()
/** 保持与 Redis invite:list（lpush，头部最新）相同的顺序 */
const _codeList: string[] = []
let _loaded = false

async function ensureLoaded(): Promise<void> {
  if (_loaded) return
  const redis = getRedis()
  const codes = await redis.lrange<string>('invite:list', 0, -1)
  if (codes.length > 0) {
    const pipeline = redis.pipeline()
    for (const code of codes) pipeline.hgetall(`invite:${code}`)
    const results = await pipeline.exec()
    codes.forEach((code, i) => {
      const data = results[i] as Record<string, string> | null
      if (data) {
        _cache.set(code, {
          used: parseInt(data.used ?? '0', 10),
          limit: parseInt(data.limit ?? '6', 10),
          label: data.label ?? '',
          createdAt: data.createdAt ?? '',
        })
        _codeList.push(code)
      }
    })
  }
  _loaded = true
}

/** 丢弃内存缓存并从 Redis 全量重建（启动预加载、管理端手动同步、批量创建后同步均走此路径） */
export async function reloadInviteCacheFromRedis(): Promise<void> {
  _cache.clear()
  _codeList.length = 0
  _loaded = false
  await ensureLoaded()
}

/** 进程启动时预加载；失败仅打日志，首次业务请求会再次尝试 ensureLoaded */
export async function preloadInviteCache(): Promise<void> {
  await reloadInviteCacheFromRedis()
}

// ── 公开 API ──────────────────────────────────────────────────────────────────

export async function createInviteCode(label: string, limit = 6): Promise<string> {
  const code = randomBytes(5).toString('hex')
  const redis = getRedis()
  const createdAt = new Date().toISOString()
  await redis.hset(`invite:${code}`, { used: 0, limit, createdAt, label: label || '' })
  await redis.lpush('invite:list', code)
  return code
}

export async function listInviteCodes(): Promise<InviteRecord[]> {
  await ensureLoaded()
  return _codeList.map((code) => {
    const entry = _cache.get(code)!
    return {
      code,
      used: entry.used,
      limit: entry.limit,
      remaining: Math.max(0, entry.limit - entry.used),
      createdAt: entry.createdAt,
      label: entry.label,
    }
  })
}

export async function validateInviteCode(code: string): Promise<{ valid: boolean; remaining: number; limit: number }> {
  if (!code) return { valid: false, remaining: 0, limit: 0 }
  await ensureLoaded()
  const entry = _cache.get(code)
  if (!entry) return { valid: false, remaining: 0, limit: 0 }
  const remaining = Math.max(0, entry.limit - entry.used)
  return { valid: remaining > 0, remaining, limit: entry.limit }
}

export async function checkAndIncrementInvite(
  code: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  if (!code) return { allowed: false, remaining: 0, limit: 0 }
  await ensureLoaded()

  const entry = _cache.get(code)
  if (!entry) return { allowed: false, remaining: 0, limit: 0 }
  if (entry.used >= entry.limit) return { allowed: false, remaining: 0, limit: entry.limit }

  // 内存中先累减，立即返回；异步写回 Redis 不阻塞响应
  entry.used++
  const remaining = Math.max(0, entry.limit - entry.used)
  void getRedis().hincrby(`invite:${code}`, 'used', 1).catch(console.error)

  return { allowed: true, remaining, limit: entry.limit }
}
