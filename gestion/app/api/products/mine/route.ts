import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { readProducts, createProduct } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const products = await readProducts(email)
    return NextResponse.json({ products: products ?? [] })
}

export async function POST(request: Request) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    try {
        const formData = await request.json()
        await createProduct(formData, email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}