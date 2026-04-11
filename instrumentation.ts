export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const { preloadInviteCache } = await import('@/lib/invite-server')
  await preloadInviteCache().catch((err) => {
    console.error('[invite-cache] 启动时从 Redis 预加载失败:', err)
  })
}
