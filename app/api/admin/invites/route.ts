import { NextRequest } from 'next/server'
import { verifyAdminPwd } from '@/lib/admin-auth'
import { listInviteCodes, createInviteCode } from '@/lib/invite-server'

export async function GET(req: NextRequest) {
  const pwd = req.nextUrl.searchParams.get('pwd') ?? ''
  if (!verifyAdminPwd(pwd)) {
    return new Response(JSON.stringify({ error: '密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 仅校验密码时不查 Redis 列表，避免登录/会话恢复被 listInviteCodes 拖慢
  const verifyOnly = req.nextUrl.searchParams.get('verifyOnly')
  if (verifyOnly === '1' || verifyOnly === 'true') {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const codes = await listInviteCodes()
  return new Response(JSON.stringify({ codes }), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: NextRequest) {
  let body: { pwd?: string; label?: string }
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

  const code = await createInviteCode(body.label ?? '')
  const origin = req.headers.get('origin') ?? req.nextUrl.origin
  return new Response(
    JSON.stringify({ code, url: `${origin}/invite/${code}` }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
