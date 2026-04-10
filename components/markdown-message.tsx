'use client'

import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export type MarkdownBubbleVariant = 'user' | 'assistant'

interface MarkdownMessageProps {
  content: string
  variant: MarkdownBubbleVariant
  className?: string
}

const baseProse =
  'text-[0.94rem] leading-[1.72] break-words [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_blockquote]:my-2.5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground'

const variantClass: Record<MarkdownBubbleVariant, string> = {
  user: [
    baseProse,
    '[&_a]:underline [&_a]:text-primary-foreground/95 [&_a]:break-all',
    '[&_strong]:font-semibold',
    '[&_code]:rounded [&_code]:bg-primary-foreground/15 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]',
    '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-primary-foreground/12 [&_pre]:p-3 [&_pre]:text-left',
    '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.8125rem]',
    '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5',
    '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5',
    '[&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:first:mt-0',
    '[&_h2]:text-[0.95rem] [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:first:mt-0',
    '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:first:mt-0',
    '[&_hr]:my-3 [&_hr]:border-primary-foreground/25',
    '[&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.8125rem]',
    '[&_th]:border [&_th]:border-primary-foreground/25 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium',
    '[&_td]:border [&_td]:border-primary-foreground/20 [&_td]:px-2 [&_td]:py-1',
  ].join(' '),
  assistant: [
    baseProse,
    '[&_a]:underline [&_a]:text-primary [&_a]:break-all',
    '[&_strong]:font-semibold',
    '[&_code]:rounded [&_code]:bg-foreground/8 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]',
    '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted/80 [&_pre]:p-3 [&_pre]:text-left [&_pre]:border [&_pre]:border-border/60',
    '[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.8125rem]',
    '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5',
    '[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5',
    '[&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1 [&_h1]:first:mt-0',
    '[&_h2]:text-[0.95rem] [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h2]:first:mt-0',
    '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:first:mt-0',
    '[&_hr]:my-3 [&_hr]:border-border',
    '[&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.8125rem]',
    '[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium',
    '[&_td]:border [&_td]:border-border/80 [&_td]:px-2 [&_td]:py-1',
  ].join(' '),
}

const markdownComponents: Components = {
  table: ({ children }) => (
    <div className="my-2 -mx-0.5 overflow-x-auto">
      <table className="min-w-full">{children}</table>
    </div>
  ),
}

export function MarkdownMessage({ content, variant, className }: MarkdownMessageProps) {
  return (
    <div className={`${variantClass[variant]} ${className ?? ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
