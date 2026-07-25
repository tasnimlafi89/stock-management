import { useAuth } from '@clerk/expo'

const API_URL = process.env.EXPO_PUBLIC_API_URL

export function useApi() {
    const { getToken } = useAuth()

    const call = async (path: string, options: RequestInit = {}) => {
        const token = await getToken()
        console.log('[API] token present:', !!token)

        const isFormData = options.body instanceof FormData

        const res = await fetch(`${API_URL}${path}`, {
    ...options,
    redirect: 'manual',
    headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
    },
})

console.log('[API] response type:', res.type, 'status:', res.status)

        console.log('[API]', path, 'status:', res.status)

        const text = await res.text()
        console.log('[API] raw response (first 200 chars):', text.slice(0, 200))

        let data
        try {
            data = JSON.parse(text)
        } catch {
            throw new Error(`Réponse non-JSON du serveur (status ${res.status})`)
        }

        if (!res.ok) throw new Error(data.error || 'Erreur réseau')
        return data
    }

    return { call }
}