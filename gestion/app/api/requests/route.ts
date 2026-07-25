import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { readIncomingOrders } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const orders = await readIncomingOrders(email)
    return NextResponse.json({ orders: orders ?? [] })
}