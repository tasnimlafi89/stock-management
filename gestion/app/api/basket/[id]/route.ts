import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { removeFromBasket, updateBasketItemQuantity } from '@/app/action'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result
    const { id } = await params

    try {
        const { quantity } = await request.json()
        await updateBasketItemQuantity(id, quantity, email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result
    const { id } = await params

    try {
        await removeFromBasket(id, email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}