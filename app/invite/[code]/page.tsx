import { validateInviteCode } from '@/lib/invite-server'
import { InviteLanding } from '@/components/invite-landing'

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const { valid, remaining } = await validateInviteCode(code)

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">链接无效或已用完</h1>
          <p className="text-muted-foreground text-sm">
            该邀请链接已失效，请联系发送者获取新链接。
          </p>
        </div>
      </div>
    )
  }

  return <InviteLanding code={code} remaining={remaining} />
}
