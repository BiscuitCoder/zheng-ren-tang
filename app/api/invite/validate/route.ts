import { NextRequest } from 'next/server'
import { validateInviteCode } from '@/lib/invite-server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') ?? ''
  const result = await validateInviteCode(code)
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}
