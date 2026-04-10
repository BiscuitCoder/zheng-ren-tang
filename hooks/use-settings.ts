'use client'

import { useState, useEffect } from 'react'
import type { ApiSettings } from '@/types'

const STORAGE_KEY = 'zhenrentang-settings'

/** 留空表示不在浏览器里覆盖，由服务端 OPENAI_* 或下方占位决定 */
const DEFAULT_SETTINGS: ApiSettings = {
  apiKey: '',
  baseURL: '',
  model: '',
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
