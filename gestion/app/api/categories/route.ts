import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import { readCategory, createCategory } from '@/app/action'

export async function GET() {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    const categories = await readCategory(email)
    return NextResponse.json({ categories: categories ?? [] })
}

export async function POST(request: Request) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    try {
        const { name, description } = await request.json()
        await createCategory(name, email, description)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}