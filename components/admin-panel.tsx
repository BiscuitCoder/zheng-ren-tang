'use client'

import { useState, useEffect, useCallback } from 'react'
import md5 from 'md5'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import type { InviteRecord } from '@/lib/invite-server'

const PWD_STORAGE_KEY = 'zhenrentang-admin-pwd'

const INVITES_SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60_000,
} as const

async function fetchInviteCodes(
  hash: string,
  reloadFromRedis = false
): Promise<InviteRecord[]> {
  const q = reloadFromRedis ? '&reload=1' : ''
  const res = await fetch(
    `/api/admin/invites?pwd=${encodeURIComponent(hash)}${q}`
  )
  if (res.status === 401) {
    const err = new Error('Unauthorized') as Error & { status: number }
    err.status = 401
    throw err
  }
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`) as Error & { status: number }
    err.status = res.status
    throw err
  }
  const data = (await res.json()) as { codes: InviteRecord[] }
  return data.codes
}

export function AdminPanel() {
  const [pwd, setPwd] = useState('')
  const [md5Pwd, setMd5Pwd] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [label, setLabel] = useState('')
  const [count, setCount] = useState(1)
  const [limit, setLimit] = useState(6)
  const [generating, setGenerating] = useState(false)
  const [redisRefreshing, setRedisRefreshing] = useState(false)
  const [newItems, setNewItems] = useState<{ code: string; url: string }[]>([])
  const { toast } = useToast()

  const invitesKey =
    authed && md5Pwd ? (['admin-invites', md5Pwd] as const) : null

  const {
    data: codes = [],
    error: invitesError,
    isLoading: invitesLoading,
    isValidating: invitesValidating,
    mutate: mutateInvites,
  } = useSWR(
    invitesKey,
    ([, hash]) => fetchInviteCodes(hash, false),
    {
      ...INVITES_SWR_OPTIONS,
      onError(err) {
        const status = (err as Error & { status?: number }).status
        if (status === 401) {
          localStorage.removeItem(PWD_STORAGE_KEY)
          setAuthed(false)
          setMd5Pwd('')
        }
      },
    }
  )

  const verifyPasswordOnly = useCallback(async (hash: string) => {
    const res = await fetch(
      `/api/admin/invites?pwd=${encodeURIComponent(hash)}&verifyOnly=1`
    )
    return res.ok
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem(PWD_STORAGE_KEY)
    if (!stored) return
    setMd5Pwd(stored)
    ;(async () => {
      const ok = await verifyPasswordOnly(stored)
      if (!ok) {
        localStorage.removeItem(PWD_STORAGE_KEY)
        return
      }
      setAuthed(true)
    })()
  }, [verifyPasswordOnly])

  const handleLogin = async () => {
    if (!pwd.trim()) return
    const hash = md5(pwd)
    const ok = await verifyPasswordOnly(hash)
    if (ok) {
      setMd5Pwd(hash)
      setAuthed(true)
      setPwdError('')
      localStorage.setItem(PWD_STORAGE_KEY, hash)
      toast({ title: '登录成功' })
    } else {
      setPwdError('密码错误')
      toast({ title: '密码错误', description: '请检查后重试', variant: 'destructive' })
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setNewItems([])
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pwd: md5Pwd, label: label.trim(), count, limit }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { results: { code: string; url: string }[] }
      setNewItems(data.results)
      setLabel('')
      await mutateInvites()
      toast({ title: '生成成功' })
    } finally {
      setGenerating(false)
    }
  }

  const handleRefreshRedis = async () => {
    if (!md5Pwd) return
    setRedisRefreshing(true)
    try {
      const next = await fetchInviteCodes(md5Pwd, true)
      await mutateInvites(next, { revalidate: false })
      toast({ title: '已从 Redis 刷新缓存' })
    } catch {
      toast({
        title: '刷新失败',
        description: '请检查网络或 Redis 配置',
        variant: 'destructive',
      })
    } finally {
      setRedisRefreshing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: '已复制到剪贴板' }))
      .catch(() => toast({ title: '复制失败', description: '请手动选择复制', variant: 'destructive' }))
  }

  const copyAllUrls = () => {
    const text = newItems.map((item) => item.url).join('\n')
    copyToClipboard(text)
  }

  const listLoading = invitesLoading || invitesValidating || redisRefreshing
  const showListError = invitesError && (invitesError as Error & { status?: number }).status !== 401

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-xs space-y-4">
          <h1 className="text-xl font-semibold text-center">管理后台</h1>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="输入管理密码"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleLogin() }}
            />
            {pwdError && <p className="text-sm text-destructive">{pwdError}</p>}
          </div>
          <Button className="w-full" onClick={() => void handleLogin()}>
            确认
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-8">
      <h1 className="text-xl font-semibold">邀请链接管理</h1>

      {/* 生成新邀请链接 */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">生成新邀请链接</h2>
        <div className="flex gap-2">
          <Input
            placeholder="备注（可选）"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleGenerate() }}
            className="flex-1"
          />
          <Input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 shrink-0"
            title="生成数量"
          />
          <Input
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(e) => setLimit(Math.min(100, Math.max(1, parseInt(e.target.value) || 6)))}
            className="w-20 shrink-0"
            title="可用次数"
          />
          <Button onClick={() => void handleGenerate()} disabled={generating} className="shrink-0">
            {generating ? '生成中…' : '生成'}
          </Button>
        </div>

        {/* 数量/次数说明 */}
        <p className="text-xs text-muted-foreground">
          数量 {count} 条 · 每条可用 {limit} 次
        </p>

        {/* 生成结果 */}
        {newItems.length > 0 && (
          <div className="space-y-1.5">
            {newItems.length > 1 && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={copyAllUrls}>
                  复制全部
                </Button>
              </div>
            )}
            {newItems.map((item) => (
              <div key={item.code} className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                <span className="flex-1 truncate text-sm font-mono">{item.url}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => copyToClipboard(item.url)}
                >
                  复制
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 邀请码列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-medium text-muted-foreground">
            邀请码列表（共 {codes.length} 条）
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={listLoading}
              onClick={() => void handleRefreshRedis()}
            >
              {redisRefreshing ? '同步中…' : '刷新 Redis'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              disabled={listLoading}
              onClick={() => void mutateInvites()}
            >
              {invitesLoading || invitesValidating ? '刷新中…' : '刷新列表'}
            </Button>
          </div>
        </div>

        {showListError && (
          <p className="text-center text-sm text-destructive py-2">
            加载失败，请稍后点击刷新重试
          </p>
        )}

        {codes.length === 0 && !listLoading && !showListError && (
          <p className="text-center text-sm text-muted-foreground py-8">暂无邀请码</p>
        )}

        <div className="space-y-2">
          {codes.map((record) => {
            const url = `${window.location.origin}/invite/${record.code}`
            return (
              <div
                key={record.code}
                className="rounded-lg border border-border p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm">{record.code}</span>
                      {record.label && (
                        <span className="text-xs text-muted-foreground">{record.label}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{url}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-sm font-medium tabular-nums ${
                        record.remaining === 0 ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {record.used}/{record.limit}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => copyToClipboard(url)}
                    >
                      复制链接
                    </Button>
                  </div>
                </div>
                {/* 进度条 */}
                <div className="h-1 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      record.remaining === 0 ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.round((record.used / record.limit) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
