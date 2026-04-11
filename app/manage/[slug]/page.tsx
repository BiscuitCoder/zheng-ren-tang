import { notFound } from 'next/navigation'
import { AdminPanel } from '@/components/admin-panel'

export default async function ManagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!process.env.ADMIN_SLUG || slug !== process.env.ADMIN_SLUG) {
    notFound()
  }

  return <AdminPanel />
}
