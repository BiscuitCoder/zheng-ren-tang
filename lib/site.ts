/**
 * 顶栏 GitHub 图标跳转地址。
 * 部署或本地可在 .env 中设置 NEXT_PUBLIC_GITHUB_REPO_URL 指向本应用仓库。
 */
const DEFAULT_GITHUB_REPO = 'https://github.com/BiscuitCoder/distilled-persona-hall.git'

export const githubRepoUrl =
  process.env.NEXT_PUBLIC_GITHUB_REPO_URL?.trim() || DEFAULT_GITHUB_REPO
