import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { useApi } from '../lib/api'
import Loader from '../components/Loader'
import * as FileSystem from 'expo-file-system/legacy'
import { useAuth } from '@clerk/expo'
import ScreenTransition from '../components/ScreenTransition'


export default function EditProductScreen({ route, navigation }: any) {
    const { productId } = route.params
    const { call } = useApi()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [existingImageUrl, setExistingImageUrl] = useState('')
    const [newImageUri, setNewImageUri] = useState<string | null>(null)
    const [quantity, setQuantity] = useState('')
    const [storageLocation, setStorageLocation] = useState('')
    const [owner, setOwner] = useState('')
    const { getToken } = useAuth()

    useEffect(() => {
        call(`/api/products/${productId}`).then((res) => {
            const p = res.product
            setName(p.name)
            setDescription(p.description)
            setPrice(String(p.price))
            setQuantity(String(p.quantity ?? 0))
            setStorageLocation(p.storageLocation || '')
            setOwner(p.owner || '')
            setExistingImageUrl(p.imageUrl)
        }).catch(console.error).finally(() => setLoading(false))
    }, [])

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
        if (!result.canceled) setNewImageUri(result.assets[0].uri)
    }

    const handleSubmit = async () => {
        if (!name.trim() || !price) {
            Alert.alert('Champs manquants', 'Nom et prix sont requis.')
            return
        }
        setSaving(true)
        try {
            let imageUrl = existingImageUrl

            if (newImageUri) {
                if (existingImageUrl) {
                    await call('/api/upload', { method: 'DELETE', body: JSON.stringify({ path: existingImageUrl }) })
                }

                const token = await getToken()
                const uploadRes = await FileSystem.uploadAsync(
                    `${process.env.EXPO_PUBLIC_API_URL}/api/upload`,
                    newImageUri,
                    {
                        fieldName: 'file',
                        httpMethod: 'POST',
                        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                const data = JSON.parse(uploadRes.body)
                if (!data.success) {
                    throw new Error("Erreur lors de l'upload de l'image.")
                }
                imageUrl = data.path
            }

            await call(`/api/products/${productId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    name,
                    description,
                    price: Number(price),
                    quantity: quantity ? Number(quantity) : 0,
                    storageLocation,
                    owner,
                    imageUrl
                }),
            })

            Alert.alert('Succès', 'Produit mis à jour.')
            navigation.goBack()
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        } finally {
            setSaving(false)
        }
    }
    const handlePriceChange = (text: string) => {
        const filtered = text.replace(/[^0-9.]/g, '')
        setPrice(filtered)
    }

    const handleQuantityChange = (text: string) => {
        const filtered = text.replace(/[^0-9]/g, '')
        setQuantity(filtered)
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
            <ScrollView className="flex-1 bg-base100 pt-14 px-4">
                <Text className="text-xl font-bold text-baseContent mb-4">Modifier le produit</Text>

                <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-base200 rounded-2xl items-center justify-center mb-4 overflow-hidden">
                    {(newImageUri || existingImageUrl) ? (
                        <Image
                            source={{ uri: newImageUri || existingImageUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Text className="text-neutral">Choisir une image</Text>
                    )}
                </TouchableOpacity>

                <TextInput placeholder="Nom" value={name} onChangeText={setName} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />
                <TextInput placeholder="Description" value={description} onChangeText={setDescription} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />
                <TextInput placeholder="Prix" keyboardType="decimal-pad" value={price} onChangeText={handlePriceChange} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-6" />

                <TextInput placeholder="Quantité en stock" keyboardType="number-pad" value={quantity} onChangeText={handleQuantityChange} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />

                <TextInput placeholder="Lieu de stockage" value={storageLocation} onChangeText={setStorageLocation} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />

                <TextInput placeholder="Propriétaire" value={owner} onChangeText={setOwner} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-6" />
                <TouchableOpacity onPress={handleSubmit} disabled={saving} className="bg-primary rounded-xl py-3 items-center mb-10">
                    <Text className="text-primaryContent font-semibold">{saving ? 'Enregistrement...' : 'Mettre à jour'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenTransition>
    )
}