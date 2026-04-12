'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSettings } from '@/hooks/use-settings'

const INVITE_KEY = 'zhenrentang-invite'
const REMAINING_KEY = 'zhenrentang-trial-remaining'
const TOTAL_KEY = 'zhenrentang-trial-total'
const DEFAULT_LIMIT = 6

export function useTrial() {
  const { settings, loaded } = useSettings()
  const hasOwnKey = loaded && Boolean(settings.apiKey?.trim())

  const [inviteCode, setInviteCode] = useState('')
  const [remaining, setRemaining] = useState(DEFAULT_LIMIT)
  const [total, setTotal] = useState(DEFAULT_LIMIT)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!loaded) return
    const code = localStorage.getItem(INVITE_KEY) ?? ''
    const storedRemaining = localStorage.getItem(REMAINING_KEY)
    const storedTotal = localStorage.getItem(TOTAL_KEY)
    const r = storedRemaining !== null ? Math.max(0, parseInt(storedRemaining, 10) || 0) : DEFAULT_LIMIT
    const t = storedTotal !== null ? Math.max(1, parseInt(storedTotal, 10) || DEFAULT_LIMIT) : DEFAULT_LIMIT

    setInviteCode(code)
    setRemaining(r)
    setTotal(t)
    setInitialized(true)

    if (code) {
      // 每次初始化都向服务端查询最新 total（不依赖缓存，避免 limit 变更后不更新）
      fetch(`/api/invite/validate?code=${encodeURIComponent(code)}`)
        .then((res) => res.json())
        .then((data: { valid?: boolean; remaining?: number; limit?: number }) => {
          if (data.limit) {
            setTotal(data.limit)
            localStorage.setItem(TOTAL_KEY, String(data.limit))
          }
          if (data.remaining !== undefined) {
            setRemaining(Math.max(0, data.remaining))
            localStorage.setItem(REMAINING_KEY, String(Math.max(0, data.remaining)))
          }
        })
        .catch(() => {/* 失败静默处理，继续用缓存值 */})
    }
  }, [loaded])

  const syncFromResponse = useCallback(
    (res: Response) => {
      if (hasOwnKey) return
      const headerRemaining = res.headers.get('X-Trial-Remaining')
      if (headerRemaining !== null) {
        const n = Math.max(0, parseInt(headerRemaining, 10) || 0)
        setRemaining(n)
        localStorage.setItem(REMAINING_KEY, String(n))
      }
      const headerTotal = res.headers.get('X-Trial-Total')
      if (headerTotal !== null) {
        const t = Math.max(1, parseInt(headerTotal, 10) || DEFAULT_LIMIT)
        setTotal(t)
        localStorage.setItem(TOTAL_KEY, String(t))
      }
    },
    [hasOwnKey]
  )

  const optimisticDecrement = useCallback(() => {
    if (hasOwnKey) return
    setRemaining((prev) => {
      const next = Math.max(0, prev - 1)
      localStorage.setItem(REMAINING_KEY, String(next))
      return next
    })
  }, [hasOwnKey])

  const isExhausted =
    !hasOwnKey && initialized && (!inviteCode || remaining === 0)

  return {
    inviteCode,
    remaining,
    total,
    hasOwnKey,
    initialized,
    isExhausted,
    syncFromResponse,
    optimisticDecrement,
  }
}
