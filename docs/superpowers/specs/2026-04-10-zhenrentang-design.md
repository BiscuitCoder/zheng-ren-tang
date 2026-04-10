# 蒸人堂 设计文档

## Context

用户想构建一个名为"蒸人堂"的 AI 名人/角色人格对话平台。通过 nuwa-skill 方法论预先蒸馏好各类人物（历史名人、虚构角色、各类宇宙人物等）的人格数据，以 Markdown 文件形式存储，前端提供人物浏览、单人对话、多人圆桌讨论三种交互模式。用户自带 API Key，支持所有兼容 OpenAI 格式的模型服务商。

---

## 数据组织

### 目录结构

```
zhenrentang/               ← Next.js 根目录，直接 Vercel 部署
  personage/               ← 人物数据目录（实际目录名）
    paul-graham-skill/
      SKILL.md             ← 核心人格 prompt（作为 system prompt）
      references/          ← 蒸馏原始素材
      examples/
      README.md
      ...
    steve-jobs-skill/
    trump-skill/
  personages.config.ts     ← 中央配置文件，管理所有人物的元数据
  app/
  components/
  public/
    avatars/               ← 人物头像
  ...
```

### personages.config.ts 格式

```ts
export const personagesConfig = [
  {
    slug: "paul-graham",
    dir: "paul-graham-skill",      // 对应 personage/ 下的实际文件夹名
    name: "Paul Graham",
    description: "YC 创始人，创业与写作思想家",
    avatar: "/avatars/paul-graham.jpg",
    tags: ["创业", "写作", "投资人", "美国", "科技"],
  },
  {
    slug: "steve-jobs",
    dir: "steve-jobs-skill",
    name: "Steve Jobs",
    description: "苹果创始人，产品与设计哲学家",
    avatar: "/avatars/steve-jobs.jpg",
    tags: ["产品", "设计", "科技", "美国"],
  },
]

export type PersonageConfig = typeof personagesConfig[number]
```

- 新增人物 = 放文件夹到 `personage/` + 在 config 里加一条记录
- 标签、封面、名字全在这里集中管理，类型安全，IDE 有补全
- `avatar` 放在 `public/avatars/` 下，或使用外链
- 标签完全自由定义，前端自动聚合所有人物标签用于筛选

---

## 页面与路由

| 路由 | 功能 |
|------|------|
| `/` | 人物大厅：卡片网格 + 标签筛选 |
| `/chat/[slug]` | 单人对话：与单个人物一对一聊天 |
| `/roundtable` | 圆桌讨论：选多个人物 + 输入话题，链式辩论 |

Settings 浮层（任意页面可打开）：配置 API 参数。

---

## API Routes

| 路由 | 方法 | 功能 |
|------|------|------|
| `/api/personages` | GET | 读取 `personages.config.ts`，返回人物列表 |
| `/api/personages/[slug]` | GET | 读取指定人物的 `SKILL.md` + `references/` |
| `/api/chat` | POST | 单人对话，SSE 流式输出 |
| `/api/roundtable` | POST | 圆桌单人发言，SSE 流式输出 |

---

## 圆桌讨论机制

### 前端流程

1. 用户选 2~N 个人物，输入话题，点「开始讨论」
2. 前端按顺序逐个请求每个人物发言（**一个流完成后再请求下一个**）
3. 每个人物气泡实时流式打字出现，标注发言人名称
4. 一轮结束后，用户可以追加自己的观点，或点「继续下一轮」触发新一轮
5. 超过 5 轮时，界面提示："讨论已较长，建议开启新话题以获得更好效果"

### 每次 `/api/roundtable` 请求体

```json
{
  "persona": "...SKILL.md 内容...",
  "personaName": "爱因斯坦",
  "topic": "九阴真经的练习方法",
  "history": [
    { "speaker": "海绵宝宝", "content": "我觉得要先练气泡功..." }
  ]
}
```

### 服务端 system prompt 拼接逻辑

**第一个发言（history 为空）：**
```
{SKILL.md 内容}

现在有人提出了一个话题：{topic}
请用你的风格和思维方式发表看法。
```

**后续发言（history 有内容）：**
```
{SKILL.md 内容}

话题是：{topic}

前面的讨论：
{海绵宝宝}说：{...}
{另一人物}说：{...}

请对他们的观点做出回应，并表达你自己的看法。
```

### Token 策略

当前版本：全量历史（简单、效果好）。  
后续可选升级：超过阈值时对早期发言做懒压缩摘要。

---

## API Key 配置

### 两种配置方式（优先级从高到低）

1. **Settings 浮层**：用户在前端填写，存 `localStorage`
2. **环境变量**（`.env.local`）：`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`，适合自部署预设

### Settings 界面说明

- 配置项：API Key、Base URL、Model Name
- 在输入框下方显示提示文案：**"API Key 仅保存在你的浏览器本地，不会上传至任何服务器。"**
- 前端请求 API Routes 时将 key/baseURL/model 附在请求头或请求体中，服务端用来初始化 OpenAI SDK

### 支持的 Provider（均为 OpenAI 兼容格式）

| Provider | Base URL |
|----------|----------|
| OpenAI | `https://api.openai.com/v1` |
| DeepSeek | `https://api.deepseek.com/v1` |
| 火山引擎 | `https://ark.cn-beijing.volces.com/api/v3` |
| 其他兼容接口 | 用户自填 |

服务端统一使用 `openai` npm 包，传入用户的 `baseURL` + `apiKey` 即可切换 provider，零额外适配代码。

---

## 核心组件

| 组件 | 说明 |
|------|------|
| `PersonaCard` | 人物卡片：头像、名称、简介、标签 |
| `TagFilter` | 标签筛选器：所有标签聚合展示，多选 |
| `ChatWindow` | 对话窗口：消息列表 + 输入框 |
| `RoundtableSetup` | 圆桌配置：人物多选 + 话题输入 |
| `RoundtableView` | 圆桌展示：链式气泡 + 流式打字 |
| `SettingsModal` | 设置浮层：API 配置 + 本地存储提示 |

---

## 验证方式

1. 在 `personages.config.ts` 配置已有的 paul-graham、steve-jobs 两个人物
2. 访问 `/`，确认卡片展示、标签筛选正常
3. 进入 `/chat/[slug]`，配置 API key，发送一条消息，确认流式输出
4. 进入 `/roundtable`，选 2 个人物，输入话题，确认链式发言顺序正确、后者能引用前者内容
5. 测试 Settings 浮层：填 key → 刷新 → 确认 localStorage 持久化
6. 测试环境变量优先级：`.env.local` 配置时，Settings 未填也能正常调用
