import { NextResponse } from 'next/server'
import { requireAuthEmail } from '@/app/lib/apiAuth'
import prisma from '@/src/lib/prisma'

export async function POST(request: Request) {
    const result = await requireAuthEmail()
    if ('error' in result) return result.error
    const { email } = result

    try {
        const { pushToken } = await request.json()
        await prisma.association.updateMany({
            where: { email },
            data: { pushToken },
        })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}