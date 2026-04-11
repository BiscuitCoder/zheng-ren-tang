'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSettings } from '@/hooks/use-settings'

const INVITE_KEY = 'zhenrentang-invite'
const REMAINING_KEY = 'zhenrentang-trial-remaining'
const DEFAULT_LIMIT = 6

export function useTrial() {
  const { settings, loaded } = useSettings()
  const hasOwnKey = loaded && Boolean(settings.apiKey?.trim())

  const [inviteCode, setInviteCode] = useState('')
  const [remaining, setRemaining] = useState(DEFAULT_LIMIT)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!loaded) return
    const code = localStorage.getItem(INVITE_KEY) ?? ''
    const stored = localStorage.getItem(REMAINING_KEY)
    const r = stored !== null ? Math.max(0, parseInt(stored, 10) || 0) : DEFAULT_LIMIT
    setInviteCode(code)
    setRemaining(r)
    setInitialized(true)
  }, [loaded])

  const syncFromResponse = useCallback(
    (res: Response) => {
      if (hasOwnKey) return
      const header = res.headers.get('X-Trial-Remaining')
      if (header !== null) {
        const n = Math.max(0, parseInt(header, 10) || 0)
        setRemaining(n)
        localStorage.setItem(REMAINING_KEY, String(n))
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
    hasOwnKey,
    initialized,
    isExhausted,
    syncFromResponse,
    optimisticDecrement,
  }
}
