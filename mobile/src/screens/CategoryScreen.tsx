import { useCallback, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, Modal } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useApi } from '../lib/api'
import { Pencil, Plus, Trash } from 'lucide-react-native'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { ListTree } from 'lucide-react-native'
import ScreenTransition from '../components/ScreenTransition'

export default function CategoryScreen() {
    const { call } = useApi()
    const [categories, setCategories] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const load = async () => {
        try {
            const res = await call('/api/categories')
            setCategories(res.categories)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { load() }, []))

    const openCreate = () => {
        setEditingId(null)
        setName('')
        setDescription('')
        setModalVisible(true)
    }

    const openEdit = (cat: any) => {
        setEditingId(cat.id)
        setName(cat.name)
        setDescription(cat.description || '')
        setModalVisible(true)
    }

    const handleSubmit = async () => {
        if (!name.trim()) {
        Alert.alert('Champ manquant', 'Le nom de la catégorie est requis.')
        return
    }
        try {
            if (editingId) {
                await call(`/api/categories/${editingId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ name, description }),
                })
            } else {
                await call('/api/categories', {
                    method: 'POST',
                    body: JSON.stringify({ name, description }),
                })
            }
            setModalVisible(false)
            load()
        } catch (e: any) {
            Alert.alert('Erreur', e.message)
        }
    }

    const handleDelete = (id: string) => {
        Alert.alert('Confirmer', 'Supprimer cette catégorie ? Tous les produits associés seront également supprimés.', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await call(`/api/categories/${id}`, { method: 'DELETE' })
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
                <Text className="text-xl font-bold text-baseContent">Catégories</Text>
                <TouchableOpacity onPress={openCreate} className="bg-primary rounded-full p-2">
                    <Plus size={18} color="#ECEFF4" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 10, flexGrow: 1 }}
                ListEmptyComponent={<EmptyState message="Aucune catégorie disponible actuellement" IconComponent={ListTree} />}
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-white border border-base300 rounded-2xl p-4">
                        <View className="flex-1">
                            <Text className="font-bold text-baseContent">{item.name}</Text>
                            {item.description ? <Text className="text-sm text-neutral">{item.description}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => openEdit(item)} className="mr-3">
                            <Pencil size={18} color="#4C566A" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item.id)}>
                            <Trash size={18} color="#BF616A" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-base100 rounded-t-3xl p-6">
                        <Text className="text-lg font-bold text-baseContent mb-4">
                            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                        </Text>
                        <TextInput
                            placeholder="Nom"
                            value={name}
                            onChangeText={setName}
                            className="bg-white border border-base300 rounded-xl px-4 py-3 mb-3"
                        />
                        <TextInput
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            className="bg-white border border-base300 rounded-xl px-4 py-3 mb-4"
                        />
                        <TouchableOpacity onPress={handleSubmit} className="bg-primary rounded-xl py-3 items-center mb-2">
                            <Text className="text-primaryContent font-semibold">Enregistrer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="items-center py-2">
                            <Text className="text-neutral">Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
        </ScreenTransition>
    )
}