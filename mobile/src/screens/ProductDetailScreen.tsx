import { useState } from 'react'
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useApi } from '../lib/api'
import ScreenTransition from '../components/ScreenTransition'


export default function ProductDetailScreen({ route, navigation }: any) {
    const { product } = route.params
    const { call } = useApi()
    const [quantity, setQuantity] = useState('1')
    const [loading, setLoading] = useState(false)

    const total = product.price * Number(quantity || 0)

    const handleAddToBasket = async () => {
        setLoading(true)
        try {
            await call('/api/basket', {
                method: 'POST',
                body: JSON.stringify({ productId: product.id, quantity: Number(quantity) }),
            })
            Alert.alert('Ajouté', 'Produit ajouté au panier.')
            navigation.goBack()
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScreenTransition>
            <ScrollView className="flex-1 bg-base100 pt-14 px-4">
                <View className="relative w-full h-56 bg-base200 rounded-2xl overflow-hidden mb-4">
                    {product.imageUrl ? (
                        <Image
                            source={{ uri: product.imageUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : null}
                    {product.quantity === 0 ? (
                        <View className="absolute top-2 left-2 bg-orange-500 rounded-full px-3 py-1">
                            <Text className="text-white text-xs font-semibold">Stock épuisé</Text>
                        </View>
                    ) : null}
                </View>

                <Text className="text-xl font-bold text-baseContent">{product.name}</Text>
                <Text className="text-sm text-neutral mb-3">
                    Publié par {product.associationName || "Association inconnue"}
                </Text>
                <Text className="text-baseContent mb-4">{product.description}</Text>

                <View className="flex-row gap-2 mb-4">
                    <View className="bg-base200 rounded-full px-3 py-1">
                        <Text className="text-xs text-baseContent">Catégorie : {product.categoryName}</Text>
                    </View>
                    <View className="bg-base200 rounded-full px-3 py-1">
                        <Text className="text-xs text-baseContent">Disponible : {product.quantity}</Text>
                    </View>
                </View>

                <View className="flex-row items-center gap-3 mb-4">
                    <Text className="font-semibold text-baseContent">Quantité</Text>
                    <TextInput
                        keyboardType="number-pad"
                        value={quantity}
                        onChangeText={setQuantity}
                        className="bg-white border border-base300 rounded-lg px-3 py-2 w-20 text-center"
                    />
                </View>

                <Text className="text-lg font-bold text-baseContent mb-4">
                    Total : {total.toFixed(2)} TND
                </Text>

                <TouchableOpacity
                    onPress={handleAddToBasket}
                    disabled={loading || product.quantity === 0}
                    className="bg-primary rounded-xl py-3 items-center mb-10"
                >
                    <Text className="text-primaryContent font-semibold">
                        {product.quantity === 0 ? "Rupture de stock" : loading ? "Ajout..." : "Ajouter au panier"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenTransition>
    )
}