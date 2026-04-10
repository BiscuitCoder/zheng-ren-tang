'use client'

import type { ReactNode } from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatMessageBubbleProps {
  /** 发言者显示名 */
  name: string
  /** 是否为用户侧（右侧、主色气泡） */
  isUser: boolean
  /** 头像节点；不传则用户侧用默认图标，非用户侧用占位 */
  avatar?: ReactNode
  children: ReactNode
  className?: string
}

function DefaultUserAvatar() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-primary/12 text-primary">
      <User className="h-4 w-4" aria-hidden />
    </div>
  )
}

function DefaultOtherAvatar({ label }: { label: string }) {
  const initial = label.trim().slice(0, 1) || '?'
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium text-muted-foreground">
      {initial}
    </div>
  )
}

/**
 * 聊天气泡：左侧/右侧对齐，统一展示头像 + 名称 + 内容区（直接对话、圆桌等复用）。
 */
export function ChatMessageBubble({
  name,
  isUser,
  avatar,
  children,
  className,
}: ChatMessageBubbleProps) {
  const avatarInner =
    avatar ??
    (isUser ? (
      <DefaultUserAvatar />
    ) : (
      <DefaultOtherAvatar label={name} />
    ))

  return (
    <div
      className={cn(
        'flex w-full gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/50">
        {avatarInner}
      </div>
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-1.5',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <span
          className={cn(
            'text-xs font-medium',
            isUser ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {name}
        </span>
        <div
          className={cn(
            'w-fit max-w-[min(100%,42rem)] rounded-lg px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(201,100,66,0.35)]'
              : 'border border-border bg-card text-foreground shadow-[var(--shadow-whisper)]'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
