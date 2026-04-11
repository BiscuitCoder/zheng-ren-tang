'use client'

import { useState, useEffect, useCallback } from 'react'
import md5 from 'md5'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import type { InviteRecord } from '@/lib/invite-server'

const PWD_STORAGE_KEY = 'zhenrentang-admin-pwd'

export function AdminPanel() {
  const [pwd, setPwd] = useState('')
  const [md5Pwd, setMd5Pwd] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [codes, setCodes] = useState<InviteRecord[]>([])
  const [label, setLabel] = useState('')
  const [generating, setGenerating] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchCodes = useCallback(async (hash: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/invites?pwd=${encodeURIComponent(hash)}`)
      if (!res.ok) return null
      const data = (await res.json()) as { codes: InviteRecord[] }
      setCodes(data.codes)
      return true
    } catch {
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /** 只校验密码哈希，不拉 Redis 邀请列表（用于快速登录） */
  const verifyPasswordOnly = useCallback(async (hash: string) => {
    const res = await fetch(
      `/api/admin/invites?pwd=${encodeURIComponent(hash)}&verifyOnly=1`
    )
    return res.ok
  }, [])

  // 尝试从 localStorage 自动恢复登录状态
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
      void fetchCodes(stored)
    })()
  }, [fetchCodes, verifyPasswordOnly])

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
      void fetchCodes(hash)
    } else {
      setPwdError('密码错误')
      toast({ title: '密码错误', description: '请检查后重试', variant: 'destructive' })
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setNewUrl('')
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pwd: md5Pwd, label: label.trim() }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { url: string }
      setNewUrl(data.url)
      setLabel('')
      await fetchCodes(md5Pwd)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: '已复制到剪贴板' }))
      .catch(() => toast({ title: '复制失败', description: '请手动选择复制', variant: 'destructive' }))
  }

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
          <Button onClick={() => void handleGenerate()} disabled={generating} className="shrink-0">
            {generating ? '生成中…' : '生成'}
          </Button>
        </div>
        {newUrl && (
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
            <span className="flex-1 truncate text-sm font-mono">{newUrl}</span>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => copyToClipboard(newUrl)}
            >
              复制
            </Button>
          </div>
        )}
      </div>

      {/* 邀请码列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            邀请码列表（共 {codes.length} 条）
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={loading}
            onClick={() => void fetchCodes(md5Pwd)}
          >
            {loading ? '刷新中…' : '刷新'}
          </Button>
        </div>

        {codes.length === 0 && !loading && (
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
