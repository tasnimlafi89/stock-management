import { useCallback, useState } from 'react'
import Loader from '../components/Loader'
import { View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useApi } from '../lib/api'
import EmptyState from '../components/EmptyState'
import { Package, Inbox, Bell } from 'lucide-react-native'
import ScreenTransition from '../components/ScreenTransition'

type Section = 'orders' | 'requests' | 'notifications'

const statusLabel = (status: string) => {
    if (status === 'confirmed') return { text: 'Confirmée', color: '#A3BE8C' }
    if (status === 'denied') return { text: 'Refusée', color: '#BF616A' }
    return { text: 'En cours de traitement', color: '#EBCB8B' }
}

export default function ActivityScreen() {
    const { call } = useApi()
    const [section, setSection] = useState<Section>('orders')
    const [orders, setOrders] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const load = async () => {
        try {
            const [ordersRes, requestsRes, notifsRes] = await Promise.all([
                call('/api/orders'),
                call('/api/requests'),
                call('/api/notifications'),
            ])
            setOrders(ordersRes.orders)
            setRequests(requestsRes.orders)
            setNotifications(notifsRes.notifications)
            if (notifsRes.notifications.some((n: any) => !n.read)) {
                call('/api/notifications', { method: 'POST' }).catch(() => { })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { load() }, []))

    const handleRespond = async (orderId: string, status: 'confirmed' | 'denied') => {
        try {
            await call(`/api/requests/${orderId}`, { method: 'POST', body: JSON.stringify({ status }) })
            setRequests((prev) => prev.map((r) => r.id === orderId ? { ...r, status } : r))
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        }
    }

    if (loading) {
        return (
            <View className="flex-1 bg-base100 items-center justify-center">
                <Loader />
            </View>
        )
    }

    return (
        <ScreenTransition>
            <View className="flex-1 bg-base100 pt-14 px-4">
                <View className="flex-row bg-base200 rounded-full p-1 mb-4">
                    {(['orders', 'requests', 'notifications'] as Section[]).map((s) => (
                        <TouchableOpacity
                            key={s}
                            onPress={() => setSection(s)}
                            className={`flex-1 py-2 rounded-full items-center ${section === s ? 'bg-primary' : ''}`}
                        >
                            <Text className={section === s ? 'text-primaryContent font-semibold' : 'text-baseContent'}>
                                {s === 'orders' ? 'Commandes' : s === 'requests' ? 'Demandes' : 'Notifications'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {section === 'orders' && (
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ gap: 10 }}
                        ListEmptyComponent={<EmptyState message="Aucune commande pour le moment" IconComponent={Package} />}
                        renderItem={({ item }) => {
                            const s = statusLabel(item.status)
                            return (
                                <View className="flex-row items-center gap-3 bg-white border border-base300 rounded-2xl p-3">
                                    {item.imageUrl ? (
                                        <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${item.imageUrl}` }} className="w-14 h-14 rounded-xl" />
                                    ) : null}
                                    <View className="flex-1">
                                        <Text className="font-bold text-baseContent">{item.productName}</Text>
                                        <Text className="text-sm text-neutral">Vendeur : {item.sellerName}</Text>
                                        <Text className="text-sm text-baseContent">{item.quantity} x — {item.totalPrice.toFixed(2)} TND</Text>
                                    </View>
                                    <View style={{ backgroundColor: s.color }} className="px-2 py-1 rounded-full">
                                        <Text className="text-xs text-white">{s.text}</Text>
                                    </View>
                                </View>
                            )
                        }}
                    />
                )}

                {section === 'requests' && (
                    <FlatList
                        data={requests}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ gap: 10 }}
                        ListEmptyComponent={<EmptyState message="Aucune demande pour le moment" IconComponent={Inbox} />}
                        renderItem={({ item }) => (
                            <View className="bg-white border border-base300 rounded-2xl p-3">
                                <View className="flex-row items-center gap-3 mb-2">
                                    {item.imageUrl ? (
                                        <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${item.imageUrl}` }} className="w-14 h-14 rounded-xl" />
                                    ) : null}
                                    <View className="flex-1">
                                        <Text className="font-bold text-baseContent">{item.productName}</Text>
                                        <Text className="text-sm text-neutral">Demandeur : {item.buyerName}</Text>
                                        <Text className="text-sm text-baseContent">{item.quantity} x — {item.totalPrice.toFixed(2)} TND</Text>
                                    </View>
                                </View>
                                {item.status === 'pending' ? (
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity onPress={() => handleRespond(item.id, 'confirmed')} className="flex-1 bg-success rounded-xl py-2 items-center">
                                            <Text className="text-white font-semibold">Confirmer</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleRespond(item.id, 'denied')} className="flex-1 bg-error rounded-xl py-2 items-center">
                                            <Text className="text-white font-semibold">Refuser</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={{ backgroundColor: statusLabel(item.status).color }} className="self-start px-2 py-1 rounded-full">
                                        <Text className="text-xs text-white">{statusLabel(item.status).text}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    />
                )}

                {section === 'notifications' && (
                    <FlatList
                        data={notifications}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ gap: 10 }}
                        ListEmptyComponent={<EmptyState message="Aucune notification pour le moment" IconComponent={Bell} />}
                        renderItem={({ item }) => (
                            <View className="bg-white border border-base300 rounded-2xl p-3">
                                <Text className="text-baseContent">{item.message}</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </ScreenTransition>
    )
}