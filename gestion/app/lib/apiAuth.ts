import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function getAuthEmail(): Promise<string | null> {
    const { userId } = await auth()
    if (!userId) return null
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return user.primaryEmailAddress?.emailAddress ?? null
}

export async function requireAuthEmail(): Promise<{ email: string } | { error: NextResponse }> {
    const { userId } = await auth()
    if (!userId) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    const email = await getAuthEmail()
    if (!email) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }
    return { email }
}