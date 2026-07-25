import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { readFavoriteProductIds, toggleFavorite } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const ids = await readFavoriteProductIds(email)
    return NextResponse.json({ ids: ids ?? [] })
}

export async function POST(request: Request) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    try {
        const { productId } = await request.json()
        const favResult = await toggleFavorite(productId, email)
        return NextResponse.json(favResult)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}