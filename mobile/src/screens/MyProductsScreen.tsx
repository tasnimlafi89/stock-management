import { useCallback, useState } from 'react'
import { View, Text, Image, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useApi } from '../lib/api'
import { Plus, Tag, Trash } from 'lucide-react-native'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { PackageSearch } from 'lucide-react-native'
import ScreenTransition from '../components/ScreenTransition'
import { LayoutDashboard } from 'lucide-react-native'

export default function MyProductsScreen({ navigation }: any) {
    const { call } = useApi()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const load = async () => {
        try {
            const res = await call('/api/products/mine')
            setProducts(res.products)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { load() }, []))

    const handleDelete = (product: any) => {
        Alert.alert('Confirmer', 'Supprimer ce produit ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        if (product.imageUrl) {
                            await call('/api/upload', {
                                method: 'DELETE',
                                body: JSON.stringify({ path: product.imageUrl }),
                            })
                        }
                        await call(`/api/products/${product.id}`, { method: 'DELETE' })
                        load()
                    } catch (e: any) {
                        Alert.alert('Erreur', e.message)
                    }
                }
            },
        ])
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
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-baseContent">Mes produits</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => navigation.navigate('Categories')} className="bg-base200 rounded-full p-2">
                            <Tag size={18} color="#2E3440" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('NewProduct')} className="bg-primary rounded-full p-2">
                            <Plus size={18} color="#ECEFF4" />
                        </TouchableOpacity>
                    </View>
                </View>

                {products.length === 0 ? (
                    <EmptyState message="Aucun produit disponible" IconComponent={PackageSearch} />
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ gap: 10 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className="flex-row items-center gap-3 bg-white border border-base300 rounded-2xl p-3"
                                onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
                            >
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${item.imageUrl}` }}
                                        className="w-14 h-14 rounded-xl"
                                    />
                                ) : null}
                                <View className="flex-1">
                                    <Text className="font-bold text-baseContent">{item.name}</Text>
                                    <Text className="text-sm text-neutral">{item.categoryName} — {item.quantity} en stock</Text>
                                    <Text className="text-primary font-semibold">{item.price} TND</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(item)}>
                                    <Trash size={18} color="#BF616A" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </ScreenTransition>
    )
}