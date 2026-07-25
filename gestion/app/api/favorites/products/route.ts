import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { readFavoriteProducts } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const products = await readFavoriteProducts(email)
    return NextResponse.json({ products: products ?? [] })
}