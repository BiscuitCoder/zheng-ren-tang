'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TagFilterProps {
  allTags: string[]
  selected: string[]
  onChange: (tags: string[]) => void
}

export function TagFilter({ allTags, selected, onChange }: TagFilterProps) {
  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selected.length === 0 ? 'default' : 'outline'}
        className="cursor-pointer select-none"
        onClick={() => onChange([])}
      >
        全部
      </Badge>
      {allTags.map((tag) => (
        <Badge
          key={tag}
          variant={selected.includes(tag) ? 'default' : 'outline'}
          className={cn('cursor-pointer select-none')}
          onClick={() => toggle(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}
