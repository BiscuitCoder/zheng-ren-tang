'use client'

import useSWRImmutable from 'swr/immutable'
import type { PersonageConfig } from '@/types'

async function fetchPersonages(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(res.statusText || '加载失败')
  return res.json() as Promise<PersonageConfig[]>
}

export function usePersonages() {
  const { data, error, isLoading } = useSWRImmutable<PersonageConfig[]>(
    '/api/personages',
    fetchPersonages,
    {
      dedupingInterval: Infinity,
    }
  )

  return {
    list: data ?? null,
    error: error ? (error instanceof Error ? error.message : '加载失败') : null,
    loading: isLoading,
  }
}
