import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { updateCategory, deleteCategory } from '@/app/action'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result
    const { id } = await params

    try {
        const { name, description } = await request.json()
        await updateCategory(id, name, email, description)
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
        await deleteCategory(id, email)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}