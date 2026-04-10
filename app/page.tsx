'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PersonaCard } from '@/components/persona-card'
import { TagFilter } from '@/components/tag-filter'
import { SettingsModal } from '@/components/settings-modal'
import { Button } from '@/components/ui/button'
import { personagesConfig } from '@/personages.config'

export default function Home() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(
    () => Array.from(new Set(personagesConfig.flatMap((p) => p.tags))).sort(),
    []
  )

  const filtered = useMemo(
    () =>
      selectedTags.length === 0
        ? personagesConfig
        : personagesConfig.filter((p) => selectedTags.some((t) => p.tags.includes(t))),
    [selectedTags]
  )

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg">蒸人堂</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/roundtable">圆桌讨论</Link>
            </Button>
            <SettingsModal />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <TagFilter allTags={allTags} selected={selectedTags} onChange={setSelectedTags} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((persona) => (
            <PersonaCard key={persona.slug} persona={persona} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-20">
            没有匹配的人物，换个标签试试
          </p>
        )}
      </main>
    </div>
  )
}
