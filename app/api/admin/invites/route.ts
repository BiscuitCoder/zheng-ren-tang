import { NextRequest } from 'next/server'
import { verifyAdminPwd } from '@/lib/admin-auth'
import {
  listInviteCodes,
  createInviteCode,
  reloadInviteCacheFromRedis,
} from '@/lib/invite-server'

export async function GET(req: NextRequest) {
  const pwd = req.nextUrl.searchParams.get('pwd') ?? ''
  if (!verifyAdminPwd(pwd)) {
    return new Response(JSON.stringify({ error: '密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const verifyOnly = req.nextUrl.searchParams.get('verifyOnly')
  if (verifyOnly === '1' || verifyOnly === 'true') {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const reload = req.nextUrl.searchParams.get('reload')
  if (reload === '1' || reload === 'true') {
    await reloadInviteCacheFromRedis()
  }

  const codes = await listInviteCodes()
  return new Response(JSON.stringify({ codes }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  let body: { pwd?: string; label?: string; count?: number; limit?: number }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: '无效请求体' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!verifyAdminPwd(body.pwd ?? '')) {
    return new Response(JSON.stringify({ error: '密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const count = Math.min(20, Math.max(1, Math.round(body.count ?? 1)))
  const limit = Math.min(100, Math.max(1, Math.round(body.limit ?? 6)))
  const origin = req.headers.get('origin') ?? req.nextUrl.origin

  const codes = await Promise.all(
    Array.from({ length: count }, () => createInviteCode(body.label ?? '', limit))
  )

  await reloadInviteCacheFromRedis()

  const results = codes.map((code) => ({ code, url: `${origin}/invite/${code}` }))

  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
