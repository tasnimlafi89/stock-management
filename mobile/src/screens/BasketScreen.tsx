import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useApi } from '../lib/api'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { ShoppingCart } from 'lucide-react-native'
import ScreenTransition from '../components/ScreenTransition'

export default function BasketScreen() {
    const { call } = useApi()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [placing, setPlacing] = useState(false)

    const load = async () => {
        try {
            const res = await call('/api/basket')
            setItems(res.items)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { load() }, []))

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const handleRemove = async (item: any) => {
        try {
            await call(`/api/basket/${item.id}`, { method: 'DELETE' })
            setItems((prev) => prev.filter((i) => i.id !== item.id))
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        }
    }

    const handlePlaceOrder = async () => {
        setPlacing(true)
        try {
            await call('/api/orders', { method: 'POST' })
            Alert.alert('Succès', 'Commande envoyée.')
            setItems([])
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        } finally {
            setPlacing(false)
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
            <Text className="text-xl font-bold text-baseContent mb-4">Mon panier</Text>

            {items.length === 0 ? (
                <EmptyState message="Votre panier est vide" IconComponent={ShoppingCart} />
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ gap: 10 }}
                        renderItem={({ item }) => (
                            <View className="flex-row items-center gap-3 bg-white border border-base300 rounded-2xl p-3">
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        className="w-14 h-14 rounded-xl"
                                    />
                                ) : null}
                                <View className="flex-1">
                                    <Text className="font-bold text-baseContent">{item.productName}</Text>
                                    <Text className="text-xs text-neutral">{item.associationName}</Text>
                                    <Text className="text-sm text-baseContent">{item.quantity} x {item.price} TND</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemove(item)}>
                                    <Text className="text-error">Retirer</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    <View className="flex-row justify-between items-center py-4 border-t border-base300 mt-2">
                        <Text className="text-lg font-bold text-baseContent">Total : {total.toFixed(2)} TND</Text>
                        <TouchableOpacity
                            onPress={handlePlaceOrder}
                            disabled={placing}
                            className="bg-primary rounded-xl px-4 py-2"
                        >
                            <Text className="text-primaryContent font-semibold">
                                {placing ? "Envoi..." : "Commander"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
        </ScreenTransition>
    )
}