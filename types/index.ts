export interface PersonageConfig {
  slug: string
  dir: string
  name: string
  description: string
  avatar: string
  tags: string[]
  /** 出生年月，建议格式 YYYY-MM，如 1955-02（展示/纪念逻辑用） */
  born?: string
  /** 去世年月；若填写则视为已故，头像黑白并显示献花交互 */
  died?: string
}

/** 根据配置判断是否已故（配置了去世年月） */
export function isDeceasedPersonage(p: Pick<PersonageConfig, 'died'>): boolean {
  return Boolean(p.died?.trim())
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface RoundtableEntry {
  speaker: string
  content: string
}

export interface ApiSettings {
  apiKey: string
  baseURL: string
  model: string
}
