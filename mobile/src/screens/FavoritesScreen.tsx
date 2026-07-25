import { useCallback, useState } from 'react'
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useApi } from '../lib/api'
import { Heart } from 'lucide-react-native'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import ScreenTransition from '../components/ScreenTransition'


export default function FavoritesScreen({ navigation }: any) {
    const { call } = useApi()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const load = async () => {
        try {
            const res = await call('/api/favorites/products')
            setProducts(res.products)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { load() }, []))

    const handleRemove = async (productId: string) => {
        try {
            await call('/api/favorites', { method: 'POST', body: JSON.stringify({ productId }) })
            setProducts((prev) => prev.filter((p) => p.id !== productId))
        } catch (e) {
            console.error(e)
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
                <Text className="text-xl font-bold text-baseContent mb-4">Mes favoris</Text>
                {products.length === 0 ? (
                    <EmptyState message="Aucun produit favori pour le moment" IconComponent={Heart} />
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        columnWrapperStyle={{ gap: 12 }}
                        contentContainerStyle={{ gap: 12 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="flex-1 bg-white rounded-2xl border border-base300 overflow-hidden"
                                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                            >
                                <View className="w-full h-32 bg-base200">
                                    {item.imageUrl ? (
                                        <Image
                                            source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${item.imageUrl}` }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    ) : null}
                                    <TouchableOpacity
                                        onPress={() => handleRemove(item.id)}
                                        className="absolute top-2 right-2 bg-white rounded-full p-1.5"
                                    >
                                        <Heart size={16} color="#BF616A" fill="#BF616A" />
                                    </TouchableOpacity>
                                </View>
                                <View className="p-3">
                                    <Text className="font-bold text-baseContent" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-primary font-semibold">{item.price} TND</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </ScreenTransition>
    )
}