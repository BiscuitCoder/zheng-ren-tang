import { createHash } from 'crypto'

export function verifyAdminPwd(md5pwd: string): boolean {
  if (!md5pwd || !process.env.ADMIN_PASSWORD) return false
  const expected = createHash('md5')
    .update(process.env.ADMIN_PASSWORD)
    .digest('hex')
  return md5pwd === expected
}
