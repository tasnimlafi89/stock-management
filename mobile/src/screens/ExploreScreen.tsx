import { useEffect, useState } from 'react'
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useApi } from '../lib/api'
import { Heart } from 'lucide-react-native'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { PackageSearch } from 'lucide-react-native'
import { RefreshControl } from 'react-native'
import ScreenTransition from '../components/ScreenTransition'

export default function ExploreScreen({ navigation }: any) {
    const { call } = useApi()
    const [products, setProducts] = useState<any[]>([])
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const load = async () => {
        try {
            const [productsRes, favRes] = await Promise.all([
                call('/api/products'),
                call('/api/favorites'),
            ])
            setProducts(productsRes.products)
            setFavoriteIds(new Set(favRes.ids))
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const toggleFavorite = async (productId: string) => {
        try {
            const result = await call('/api/favorites', {
                method: 'POST',
                body: JSON.stringify({ productId }),
            })
            setFavoriteIds((prev) => {
                const next = new Set(prev)
                result.favorited ? next.add(productId) : next.delete(productId)
                return next
            })
        } catch (e) {
            console.error(e)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await load()
        setRefreshing(false)
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('tabPress', () => {
            if (navigation.isFocused()) {
                handleRefresh()
            }
        })
        return unsubscribe
    }, [navigation])


    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.associationName || '').toLowerCase().includes(search.toLowerCase())
    )

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
                <TextInput
                    placeholder="Rechercher un produit..."
                    value={search}
                    onChangeText={setSearch}
                    className="bg-white border border-base300 rounded-xl px-4 py-3 mb-4"
                />
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 12 }}
                    contentContainerStyle={{ gap: 12, paddingBottom: 20, flexGrow: 1 }}
                    ListEmptyComponent={<EmptyState message="Aucun produit trouvé" IconComponent={PackageSearch} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={['#5E81AC']}
                            tintColor="#5E81AC"
                        />}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            className="flex-1 bg-white rounded-2xl border border-base300 overflow-hidden"
                            onPress={() => navigation.navigate('ProductDetail', { product: item })}
                        >
                            <View className="w-full h-32 bg-base200">
                                {item.imageUrl ? (
                                    <Image
                                        source={{ uri: item.imageUrl }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : null}
                                <TouchableOpacity
                                    onPress={() => toggleFavorite(item.id)}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1.5"
                                >
                                    <Heart
                                        size={16}
                                        color={favoriteIds.has(item.id) ? "#BF616A" : "#4C566A"}
                                        fill={favoriteIds.has(item.id) ? "#BF616A" : "none"}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View className="p-3">
                                <Text className="font-bold text-baseContent" numberOfLines={1}>{item.name}</Text>
                                <Text className="text-primary font-semibold">{item.price} TND</Text>
                                <Text className="text-xs text-neutral" numberOfLines={1}>
                                    {item.associationName || "Association inconnue"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </ScreenTransition>
    )
}