'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings } from '@/hooks/use-settings'

const PROVIDERS = [
  { label: 'OpenAI', baseURL: 'https://api.openai.com/v1' },
  { label: 'DeepSeek', baseURL: 'https://api.deepseek.com/v1' },
  { label: '火山引擎', baseURL: 'https://ark.cn-beijing.volces.com/api/v3' },
]

export function SettingsModal() {
  const { settings, updateSettings } = useSettings()
  const [draft, setDraft] = useState(settings)
  const [open, setOpen] = useState(false)

  const handleOpen = (v: boolean) => {
    if (v) setDraft(settings)
    setOpen(v)
  }

  const handleSave = () => {
    updateSettings(draft)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="设置">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API 配置</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              API Key 仅保存在你的浏览器本地，不会上传至任何服务器。
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="baseURL">Base URL</Label>
            <Input
              id="baseURL"
              placeholder="https://api.openai.com/v1"
              value={draft.baseURL}
              onChange={(e) => setDraft({ ...draft, baseURL: e.target.value })}
            />
            <div className="flex gap-2 flex-wrap">
              {PROVIDERS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDraft({ ...draft, baseURL: p.baseURL })}
                  className="text-xs px-2 py-0.5 rounded border hover:bg-accent transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="gpt-4o"
              value={draft.model}
              onChange={(e) => setDraft({ ...draft, model: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">
          保存
        </Button>
      </DialogContent>
    </Dialog>
  )
}
