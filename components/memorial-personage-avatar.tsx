'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { isDeceasedPersonage } from '@/types'

const OFFERING_EMOJIS = ['🌸', '🌺', '🌼', '💐', '🌹', '✿'] as const

type Particle = {
  id: number
  emoji: string
  leftPct: number
  drift: number
  delay: number
}

export interface MemorialPersonageAvatarProps {
  src: string
  alt: string
  /** 出生年月（可选，预留展示） */
  born?: string
  /** 去世年月；有值则启用悼念样式与献花 */
  died?: string
  className?: string
  imageClassName?: string
  sizes?: string
  priority?: boolean
}

/**
 * 人物头像：若配置了去世年月，则黑白显示，右上角 💐 可点击触发献花动画。
 */
export function MemorialPersonageAvatar({
  src,
  alt,
  died,
  className,
  imageClassName,
  sizes,
  priority,
}: MemorialPersonageAvatarProps) {
  const deceased = isDeceasedPersonage({ died })
  const [particles, setParticles] = useState<Particle[]>([])

  const offerFlowers = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const idBase = Date.now()
      const batch: Particle[] = Array.from({ length: 8 }, (_, i) => ({
        id: idBase + i,
        emoji: OFFERING_EMOJIS[Math.floor(Math.random() * OFFERING_EMOJIS.length)]!,
        leftPct: 8 + Math.random() * 84,
        drift: (Math.random() - 0.5) * 56,
        delay: i * 45,
      }))
      setParticles((prev) => [...prev, ...batch])
    },
    []
  )

  const removeParticle = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          'object-cover',
          deceased && 'grayscale contrast-[0.97]',
          imageClassName
        )}
      />
      <div
        className="memorial-offering-root pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit]"
        aria-hidden
      >
        {particles.map((p) => (
          <span
            key={p.id}
            className="memorial-offering-particle absolute bottom-0 text-lg leading-none select-none"
            style={{
              left: `${p.leftPct}%`,
              animationDelay: `${p.delay}ms`,
              ['--memorial-drift' as string]: `${p.drift}px`,
            }}
            onAnimationEnd={() => removeParticle(p.id)}
          >
            {p.emoji}
          </span>
        ))}
      </div>
      {deceased && (
        <button
          type="button"
          onClick={offerFlowers}
          className="absolute top-0.5 right-0.5 z-[2] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-background/90 text-base shadow-sm ring-1 ring-border/50 transition hover:scale-110 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="献花致敬"
          title="献花致敬"
        >
          💐
        </button>
      )}
    </div>
  )
}
