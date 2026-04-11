'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface InviteLandingProps {
  code: string
  remaining: number
}

export function InviteLanding({ code, remaining }: InviteLandingProps) {
  const router = useRouter()

  const handleStart = () => {
    localStorage.setItem('zhenrentang-invite', code)
    localStorage.setItem('zhenrentang-trial-remaining', String(remaining))
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">你收到了蒸人堂的体验邀请</h1>
          <p className="text-muted-foreground text-sm">
            与历史和当代名人进行 AI 对话，共 {remaining} 次免费体验。
          </p>
        </div>
        <Button className="w-full" size="lg" onClick={handleStart}>
          开始体验
        </Button>
        <p className="text-xs text-muted-foreground">
          体验完毕后，可在设置中配置自己的 API Key 无限使用。
        </p>
      </div>
    </div>
  )
}
