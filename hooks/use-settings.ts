'use client'

import { useState, useEffect } from 'react'
import type { ApiSettings } from '@/types'

const STORAGE_KEY = 'zhenrentang-settings'

const DEFAULT_SETTINGS: ApiSettings = {
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o',
}

export function useSettings() {
  const [settings, setSettings] = useState<ApiSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        // ignore malformed storage
      }
    }
    setLoaded(true)
  }, [])

  const updateSettings = (next: ApiSettings) => {
    setSettings(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return { settings, updateSettings, loaded }
}
