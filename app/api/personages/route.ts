import { NextResponse } from 'next/server'
import { personagesConfig } from '@/personages.config'

export async function GET() {
  return NextResponse.json(personagesConfig)
}
