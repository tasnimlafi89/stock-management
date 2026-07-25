import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { addToBasket, readBasket } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const items = await readBasket(email)
    return NextResponse.json({ items: items ?? [] })
}

export async function POST(request: Request) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    try {
        const { productId, quantity } = await request.json()
        await addToBasket(productId, quantity, email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}