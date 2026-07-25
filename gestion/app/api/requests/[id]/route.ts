import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { respondToOrder } from '@/app/action'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result
    const { id } = await params

    try {
        const { status } = await request.json()
        await respondToOrder(id, status, email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}