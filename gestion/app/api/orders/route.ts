import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { placeOrder, readMyOrders } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const orders = await readMyOrders(email)
    return NextResponse.json({ orders: orders ?? [] })
}

export async function POST() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    try {
        await placeOrder(email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}