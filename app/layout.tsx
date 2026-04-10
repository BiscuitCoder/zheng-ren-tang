import type { Metadata } from 'next'
import { Noto_Serif_SC } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

/** 全站宋体风格：思源宋体 + 系统宋体回退，偏纸面阅读 */
const notoSerif = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-impl',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '蒸人堂 — AI 名人人格对话',
  description: '与各路名人、虚构角色直接对话，或让他们围坐圆桌展开讨论',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSerif.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
