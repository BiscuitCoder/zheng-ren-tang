import { NextResponse } from 'next/server'
import { readSkillContent } from '@/lib/read-skill'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const skill = await readSkillContent(slug)
    return NextResponse.json({ skill })
  } catch {
    return NextResponse.json({ error: 'Persona not found' }, { status: 404 })
  }
}
