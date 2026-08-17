import { useCallback, useMemo, useState } from 'react'
import { View, Text, Image, TouchableOpacity, FlatList, Alert, TextInput, ScrollView } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useApi } from '../lib/api'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { MapPin, MapPinHouse, PackageSearch, Plus, ScanBox, Search, Tag, Trash, User } from 'lucide-react-native'

export default function MyProductsScreen({ navigation }: any) {
    const { call } = useApi()
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [storageSearch, setStorageSearch] = useState('')
    const [ownerSearch, setOwnerSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('')

    const load = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                call('/api/products/mine'),
                call('/api/categories'),
            ])
            setProducts(productsRes.products)
            setCategories(categoriesRes.categories)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { load() }, []))

    const filteredProducts = useMemo(() => {
        let result = [...products]

        if (categoryFilter) {
            result = result.filter((p) => p.categoryId === categoryFilter)
        }

        if (search.trim()) {
            const term = search.trim().toLowerCase()
            result = result.filter((p) => p.name.toLowerCase().includes(term))
        }

        if (storageSearch.trim()) {
            const term = storageSearch.trim().toLowerCase()
            result = result.filter((p) => (p.storageLocation || '').toLowerCase().includes(term))
        }

        if (ownerSearch.trim()) {
            const term = ownerSearch.trim().toLowerCase()
            result = result.filter((p) => (p.owner || '').toLowerCase().includes(term))
        }

        return result
    }, [products, categoryFilter, search, storageSearch, ownerSearch])

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

            <View className="flex-row items-center bg-white border border-base300 rounded-xl px-3 mb-2">
                <Search size={16} color="#4C566A" />
                <TextInput
                    placeholder="Rechercher par nom..."
                    value={search}
                    onChangeText={setSearch}
                    className="flex-1 px-2 py-3 text-baseContent"
                />
            </View>

            <View className="flex-row gap-2 mb-3">
                <View className="flex-1 flex-row items-center bg-white border border-base300 rounded-xl px-3">
                    <ScanBox size={16} color="#4C566A" />
                    <TextInput
                        placeholder="Lieu de stockage..."
                        value={storageSearch}
                        onChangeText={setStorageSearch}
                        className="flex-1 px-2 py-3 text-baseContent"
                    />
                </View>
                <View className="flex-1 flex-row items-center bg-white border border-base300 rounded-xl px-3">
                    <User size={16} color="#4C566A" />
                    <TextInput
                        placeholder="Propriétaire..."
                        value={ownerSearch}
                        onChangeText={setOwnerSearch}
                        className="flex-1 px-2 py-3 text-baseContent"
                    />
                </View>
            </View>

            {categories.length > 0 && (
                <View style={{ height: 44, marginBottom: 16 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, alignItems: 'center' }}
                    >
                        <TouchableOpacity
                            onPress={() => setCategoryFilter('')}
                            className={`px-4 py-2 rounded-full border ${categoryFilter === '' ? 'bg-primary border-primary' : 'bg-white border-base300'}`}
                            style={{ alignSelf: 'flex-start' }}
                        >
                            <Text className={categoryFilter === '' ? 'text-primaryContent' : 'text-baseContent'}>Toutes</Text>
                        </TouchableOpacity>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setCategoryFilter(cat.id === categoryFilter ? '' : cat.id)}
                                className={`px-4 py-2 rounded-full border ${categoryFilter === cat.id ? 'bg-primary border-primary' : 'bg-white border-base300'}`}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                <Text className={categoryFilter === cat.id ? 'text-primaryContent' : 'text-baseContent'}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 10, flexGrow: 1 }}
                ListEmptyComponent={<EmptyState message="Aucun produit trouvé" IconComponent={PackageSearch} />}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-row items-center gap-3 bg-white border border-base300 rounded-2xl p-3"
                        onPress={() => navigation.navigate('EditProduct', { productId: item.id })}
                    >
                        {item.imageUrl ? (
                            <Image
                                source={{ uri: item.imageUrl }}
                                className="w-14 h-14 rounded-xl"
                            />
                        ) : null}
                        <View className="flex-1">
                            <Text className="font-bold text-baseContent">{item.name}</Text>
                            <Text className="text-sm text-neutral">{item.categoryName} — {item.quantity} en stock</Text>
                            {item.storageLocation ? (
                                <Text className="text-xs text-neutral">Lieu : {item.storageLocation}</Text>
                            ) : null}
                            {item.owner ? (
                                <Text className="text-xs text-neutral">Propriétaire : {item.owner}</Text>
                            ) : null}
                            <Text className="text-primary font-semibold">{item.price} TND</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item)}>
                            <Trash size={18} color="#BF616A" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />
        </View>
    )
}