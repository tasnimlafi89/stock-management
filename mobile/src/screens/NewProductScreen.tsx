import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native'
import { useApi } from '../lib/api'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { useAuth } from '@clerk/expo'
import ScreenTransition from '../components/ScreenTransition'


export default function NewProductScreen({ navigation }: any) {
    const { call } = useApi()
    const [categories, setCategories] = useState<any[]>([])
    const [categoryId, setCategoryId] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [quantity, setQuantity] = useState('')
    const [storageLocation, setStorageLocation] = useState('')
    const [owner, setOwner] = useState('')
    const { getToken } = useAuth()

    useEffect(() => {
        call('/api/categories').then((res) => setCategories(res.categories)).catch(console.error)
    }, [])

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        })
        if (!result.canceled) {
            setImageUri(result.assets[0].uri)
        }
    }

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (!permission.granted) {
            Alert.alert('Permission refusée', "L'accès à l'appareil photo est nécessaire pour prendre une photo.")
            return
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
        })
        if (!result.canceled) {
            setImageUri(result.assets[0].uri)
        }
    }

    const handleSubmit = async () => {
        if (!name || !price || !categoryId) {
            Alert.alert('Champs manquants', 'Nom, prix et catégorie sont requis.')
            return
        }
        if (!imageUri) {
            Alert.alert('Image manquante', 'Veuillez ajouter une image du produit.')
            return
        }
        setLoading(true)
        try {
            let imageUrl = ''

            if (imageUri) {
                const token = await getToken()
                const uploadRes = await FileSystem.uploadAsync(
                    `${process.env.EXPO_PUBLIC_API_URL}/api/upload`,
                    imageUri,
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

            await call('/api/products/mine', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    description,
                    price: Number(price),
                    quantity: quantity ? Number(quantity) : 0,
                    storageLocation,
                    owner,
                    categoryId,
                    imageUrl
                }),
            })

            Alert.alert('Succès', 'Produit ajouté.')
            navigation.goBack()
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        } finally {
            setLoading(false)
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

    return (
        <ScreenTransition>
            <ScrollView className="flex-1 bg-base100 pt-14 px-4">
                <Text className="text-xl font-bold text-baseContent mb-4">Nouveau produit</Text>

                <TouchableOpacity onPress={pickImage} className="w-full h-40 bg-base200 rounded-2xl items-center justify-center mb-2 overflow-hidden">
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Text className="text-neutral">Aucune image sélectionnée *</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row gap-2 mb-4">
                    <TouchableOpacity onPress={pickImage} className="flex-1 bg-base200 rounded-xl py-2.5 items-center">
                        <Text className="text-baseContent font-medium">Galerie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={takePhoto} className="flex-1 bg-base200 rounded-xl py-2.5 items-center">
                        <Text className="text-baseContent font-medium">Appareil photo</Text>
                    </TouchableOpacity>
                </View>

                <TextInput placeholder="Nom" value={name} onChangeText={setName} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />
                <TextInput placeholder="Description" value={description} onChangeText={setDescription} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />
                <TextInput placeholder="Prix" keyboardType="decimal-pad" value={price} onChangeText={handlePriceChange} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />

                <TextInput placeholder="Quantité en stock" keyboardType="number-pad" value={quantity} onChangeText={handleQuantityChange} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />

                <TextInput placeholder="Lieu de stockage" value={storageLocation} onChangeText={setStorageLocation} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3" />

                <TextInput placeholder="Propriétaire" value={owner} onChangeText={setOwner} className="bg-white border border-base300 rounded-xl px-4 py-3 mb-6" />
                <Text className="font-semibold text-baseContent mb-2">Catégorie</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => setCategoryId(cat.id)}
                            className={`px-4 py-2 rounded-full border ${categoryId === cat.id ? 'bg-primary border-primary' : 'bg-white border-base300'}`}
                        >
                            <Text className={categoryId === cat.id ? 'text-primaryContent' : 'text-baseContent'}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-primary rounded-xl py-3 items-center mb-10">
                    <Text className="text-primaryContent font-semibold">{loading ? 'Ajout...' : 'Ajouter'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </ScreenTransition>
    )
}