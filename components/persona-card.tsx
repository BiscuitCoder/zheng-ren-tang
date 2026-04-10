import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MemorialPersonageAvatar } from '@/components/memorial-personage-avatar'
import type { PersonageConfig } from '@/types'

interface PersonaCardProps {
  persona: PersonageConfig
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <Link href={`/chat/${persona.slug}`}>
      <Card className="p-4 group h-full cursor-pointer transition-shadow hover:shadow-[var(--shadow-whisper)]">
        <CardContent className="flex flex-col gap-3 p-0">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            <MemorialPersonageAvatar
              src={persona.avatar}
              alt={persona.name}
              born={persona.born}
              died={persona.died}
              className="h-full w-full rounded-lg"
              imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, 25vw"
            />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight tracking-normal">
              {persona.name}
            </h3>
            <p className="mt-1 line-clamp-2 text-[0.94rem] leading-[1.5] text-muted-foreground">
              {persona.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1 mt-auto">
            {persona.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
