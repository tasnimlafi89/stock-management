import { useCallback, useState } from 'react'
import { View, Text, ScrollView, Image } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LineChart, BarChart } from 'react-native-gifted-charts'
import { useApi } from '../lib/api'
import Loader from '../components/Loader'
import { AlertTriangle, Package, ShoppingBag, TrendingDown, Wallet } from 'lucide-react-native'

export default function DashboardScreen() {
    const { call } = useApi()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const load = async () => {
        try {
            const res = await call('/api/dashboard')
            setStats(res.stats)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(() => { load() }, []))

    if (loading) {
        return (
            <View className="flex-1 bg-base100 items-center justify-center">
                <Loader />
            </View>
        )
    }

    if (!stats) {
        return (
            <View className="flex-1 bg-base100 items-center justify-center px-4">
                <Text className="text-neutral">Aucune donnée disponible</Text>
            </View>
        )
    }

    const lineData = stats.salesByDay.map((d: any) => ({ value: d.total, label: d.date.slice(5) }))
    const barData = stats.topSellers.map((p: any) => ({ value: p.totalSold, label: p.name.slice(0, 8) }))

    return (
        <ScrollView className="flex-1 bg-base100 pt-14 px-4">
            <Text className="text-xl font-bold text-baseContent mb-4">Tableau de bord</Text>

            <View className="flex-row flex-wrap gap-3 mb-6">
                <View className="flex-1 min-w-[45%] bg-white border border-base300 rounded-2xl p-4">
                    <Package size={20} color="#5E81AC" />
                    <Text className="text-2xl font-bold text-baseContent mt-1">{stats.totalProducts}</Text>
                    <Text className="text-xs text-neutral">Produits</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white border border-base300 rounded-2xl p-4">
                    <AlertTriangle size={20} color="#EBCB8B" />
                    <Text className="text-2xl font-bold text-baseContent mt-1">{stats.lowStockCount}</Text>
                    <Text className="text-xs text-neutral">Stock faible</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white border border-base300 rounded-2xl p-4">
                    <Wallet size={20} color="#A3BE8C" />
                    <Text className="text-2xl font-bold text-baseContent mt-1">{stats.stockValue.toFixed(0)} TND</Text>
                    <Text className="text-xs text-neutral">Valeur du stock</Text>
                </View>
                <View className="flex-1 min-w-[45%] bg-white border border-base300 rounded-2xl p-4">
                    <ShoppingBag size={20} color="#8FBCBB" />
                    <Text className="text-2xl font-bold text-baseContent mt-1">{stats.pendingRequestsCount}</Text>
                    <Text className="text-xs text-neutral">Demandes en attente</Text>
                </View>
            </View>

            <View className="bg-white border border-base300 rounded-2xl p-4 mb-6">
                <Text className="font-bold text-baseContent mb-3">Ventes des 14 derniers jours</Text>
                <LineChart
                    data={lineData}
                    color="#5E81AC"
                    thickness={2}
                    height={160}
                    hideDataPoints
                    yAxisTextStyle={{ fontSize: 9 }}
                    xAxisLabelTextStyle={{ fontSize: 8 }}
                    noOfSections={4}
                    curved
                />
            </View>

            <View className="bg-white border border-base300 rounded-2xl p-4 mb-6">
                <Text className="font-bold text-baseContent mb-3">Meilleures ventes</Text>
                {barData.length === 0 ? (
                    <Text className="text-sm text-neutral">Aucune vente confirmée pour le moment.</Text>
                ) : (
                    <BarChart
                        data={barData}
                        frontColor="#A3BE8C"
                        height={160}
                        yAxisTextStyle={{ fontSize: 9 }}
                        xAxisLabelTextStyle={{ fontSize: 8 }}
                        noOfSections={4}
                    />
                )}
            </View>

            <View className="bg-white border border-base300 rounded-2xl p-4 mb-6">
                <Text className="font-bold text-baseContent mb-3">Stock faible (moins de 10)</Text>
                {stats.lowStockProducts.length === 0 ? (
                    <Text className="text-sm text-neutral">Aucun produit en stock faible.</Text>
                ) : (
                    stats.lowStockProducts.map((p: any) => (
                        <View key={p.id} className="flex-row items-center gap-3 mb-2">
                            {p.imageUrl ? (
                                <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${p.imageUrl}` }} className="w-8 h-8 rounded-lg" />
                            ) : null}
                            <Text className="flex-1 text-sm text-baseContent">{p.name}</Text>
                            <Text className="text-xs text-warning font-semibold">{p.quantity} restant(s)</Text>
                        </View>
                    ))
                )}
            </View>

            <View className="bg-white border border-base300 rounded-2xl p-4 mb-10">
                <Text className="font-bold text-baseContent mb-3">Produits qui ne se vendent pas</Text>
                {stats.slowMovers.length === 0 ? (
                    <Text className="text-sm text-neutral">Tous vos produits ont été vendus au moins une fois.</Text>
                ) : (
                    stats.slowMovers.map((p: any) => (
                        <View key={p.productId} className="flex-row items-center gap-3 mb-2">
                            {p.imageUrl ? (
                                <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_URL}${p.imageUrl}` }} className="w-8 h-8 rounded-lg" />
                            ) : null}
                            <Text className="flex-1 text-sm text-baseContent">{p.name}</Text>
                            <Text className="text-xs text-neutral">{p.quantity} en stock</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
}