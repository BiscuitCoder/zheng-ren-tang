/**
 * 合并请求体与 .env。
 *
 * - apiKey：请求体非空优先，否则 OPENAI_API_KEY。
 * - baseURL / model：显式配置优先；若请求体仍是应用旧版默认占位（与未配置 env 时前端写死的 OpenAI 默认一致），
 *   则让 OPENAI_* 环境变量生效，避免「只在 .env 配了 DeepSeek，但浏览器里仍是默认 OpenAI 地址」导致 Key 被发到 OpenAI。
 */
const LEGACY_CLIENT_DEFAULT_BASE_URL = 'https://api.openai.com/v1'
const LEGACY_CLIENT_DEFAULT_MODEL = 'gpt-4o'

function normalizeBase(u: string) {
  return u.replace(/\/$/, '')
}

function resolveBaseURL(input: string | undefined, apiKeyFromClient: string) {
  const raw = input?.trim() || ''
  const fromEnv = process.env.OPENAI_BASE_URL?.trim()
  const fallback = LEGACY_CLIENT_DEFAULT_BASE_URL

  if (!raw) return normalizeBase(fromEnv || fallback)
  const isLegacyPlaceholder =
    normalizeBase(raw) === normalizeBase(fallback) && fromEnv && !apiKeyFromClient.trim()
  if (isLegacyPlaceholder) return normalizeBase(fromEnv)
  return normalizeBase(raw)
}

function resolveModel(input: string | undefined, apiKeyFromClient: string) {
  const raw = input?.trim() || ''
  const fromEnv = process.env.OPENAI_MODEL?.trim()
  const fallback = LEGACY_CLIENT_DEFAULT_MODEL

  if (!raw) return fromEnv || fallback
  if (raw === fallback && fromEnv && !apiKeyFromClient.trim()) return fromEnv
  return raw
}

export function resolveOpenAIConfig(input: {
  apiKey?: string
  baseURL?: string
  model?: string
}) {
  const apiKeyFromClient = input.apiKey?.trim() || ''
  const apiKey = (apiKeyFromClient || process.env.OPENAI_API_KEY || '').trim()
  const baseURL = resolveBaseURL(input.baseURL, apiKeyFromClient)
  const model = resolveModel(input.model, apiKeyFromClient)
  return { apiKey, baseURL, model }
}
