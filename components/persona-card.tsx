import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { PersonageConfig } from '@/types'

interface PersonaCardProps {
  persona: PersonageConfig
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <Link href={`/chat/${persona.slug}`}>
      <Card className="group cursor-pointer hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
            <Image
              src={persona.avatar}
              alt={persona.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => {}}
            />
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">{persona.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
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
