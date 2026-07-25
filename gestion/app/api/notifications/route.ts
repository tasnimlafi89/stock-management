import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { readNotifications, markAllNotificationsRead } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const notifications = await readNotifications(email)
    return NextResponse.json({ notifications: notifications ?? [] })
}

export async function POST() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    await markAllNotificationsRead(email)
    return NextResponse.json({ success: true })
}