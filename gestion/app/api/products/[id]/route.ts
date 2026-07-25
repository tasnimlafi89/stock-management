import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { readProductById, updateProduct, deleteProduct } from '@/app/action'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result
    const { id } = await params

    const product = await readProductById(id, email)
    return NextResponse.json({ product: product ?? null })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result
    const { id } = await params

    try {
        const formData = await request.json()
        await updateProduct({ ...formData, id }, email)
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
        await deleteProduct(id, email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}