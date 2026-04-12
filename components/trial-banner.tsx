'use client'

import { requestOpenSettings } from '@/lib/open-settings'

interface TrialBannerProps {
  inviteCode: string
  remaining: number
  total: number
  hasOwnKey: boolean
  initialized: boolean
}

export function TrialBanner({ inviteCode, remaining, total, hasOwnKey, initialized }: TrialBannerProps) {
  if (hasOwnKey || !initialized) return null

  // 无邀请码也无 key
  if (!inviteCode) {
    return (
      <div className="shrink-0 border-b border-border bg-muted/60 px-4 py-2 text-center text-sm">
        <span className="text-muted-foreground">请配置 API Key 或获取邀请链接使用 </span>
        <button
          type="button"
          className="underline underline-offset-2 hover:text-foreground text-muted-foreground"
          onClick={requestOpenSettings}
        >
          配置 Key
        </button>
      </div>
    )
  }

  // 额度耗尽
  if (remaining === 0) {
    return (
      <div
        role="alert"
        className="shrink-0 cursor-pointer border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-center text-sm"
        onClick={requestOpenSettings}
      >
        <span className="font-medium text-destructive">
          体验次数已用完，点击配置 API Key 继续使用 →
        </span>
      </div>
    )
  }

  // 有余量
  const pct = Math.round((remaining / Math.max(1, total)) * 100)
  return (
    <div className="shrink-0 border-b border-border bg-muted/40 px-4 py-1.5">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <span className="shrink-0 text-xs text-muted-foreground">
          体验资格：剩余 {remaining} 条
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          type="button"
          className="shrink-0 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onClick={requestOpenSettings}
        >
          配置 Key
        </button>
      </div>
    </div>
  )
}
