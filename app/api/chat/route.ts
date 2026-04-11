import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { readSkillContent } from '@/lib/read-skill'
import { resolveOpenAIConfig } from '@/lib/openai-config'
import { checkAndIncrementInvite } from '@/lib/invite-server'
import type { Message } from '@/types'

export async function POST(req: NextRequest) {
  let body: {
    slug?: string
    messages?: Message[]
    apiKey?: string
    baseURL?: string
    model?: string
    inviteCode?: string
  }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: '无效的请求体' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { slug, messages, inviteCode } = body
  const { apiKey, baseURL, model } = resolveOpenAIConfig(body)

  // 无自己的 key 时，校验邀请码额度
  const isUserKey = Boolean(body.apiKey?.trim())
  let trialRemaining = 0
  if (!isUserKey) {
    if (!inviteCode) {
      return new Response(JSON.stringify({ error: '请先在设置中配置 API Key，或通过邀请链接获取体验资格' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const trial = await checkAndIncrementInvite(inviteCode)
    if (!trial.allowed) {
      return new Response(JSON.stringify({ error: 'trial_exhausted' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'X-Trial-Remaining': '0' },
      })
    }
    trialRemaining = trial.remaining
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: '请先在设置中配置 API Key，或在服务端设置 OPENAI_API_KEY' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!slug || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: '缺少 slug 或 messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let skillContent: string
  try {
    skillContent = await readSkillContent(slug)
  } catch (e) {
    const msg = e instanceof Error ? e.message : '读取人格失败'
    return new Response(JSON.stringify({ error: msg }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const client = new OpenAI({ apiKey, baseURL })

  let stream
  try {
    stream = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: skillContent }, ...messages],
      stream: true,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : '模型请求失败'
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        const message = err instanceof Error ? err.message : '流式输出失败'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
        )
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } finally {
        controller.close()
      }
    },
  })

  const headers: Record<string, string> = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  }
  if (!isUserKey) headers['X-Trial-Remaining'] = String(trialRemaining)

  return new Response(readable, { headers })
}
