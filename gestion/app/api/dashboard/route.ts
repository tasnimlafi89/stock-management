import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { getDashboardStats } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const stats = await getDashboardStats(email)
    return NextResponse.json({ stats: stats ?? null })
}
