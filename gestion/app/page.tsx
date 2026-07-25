"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from './components/Wrapper'
import RequireAuth from './components/RequireAuth'
import { useUser } from '@clerk/nextjs'
import { getDashboardStats } from './action'
import { DashboardStats } from '@/type'
import ProductImage from './components/ProductImage'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertTriangle, Package, ShoppingBag, TrendingDown, TrendingUp, Wallet } from 'lucide-react'

const page = () => {
    const { isLoaded, user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (email) {
                const data = await getDashboardStats(email)
                if (data) setStats(data)
            }
        }
        if (isLoaded) {
            load().finally(() => setInitialLoading(false))
        }
    }, [email, isLoaded])

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <span className="loading loading-ring loading-xl" style={{ height: "3rem" , width: "3rem" }}></span>
            </div>

        )
    }

    if (!stats) {
        return (
            <RequireAuth>
                <Wrapper>
                    <div>Aucune donnée disponible pour le moment.</div>
                </Wrapper>
            </RequireAuth>
        )
    }

    return (
        <RequireAuth>
            <Wrapper>
                <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="stat bg-base-100 border-2 border-base-200 rounded-3xl">
                        <div className="stat-figure text-primary"><Package /></div>
                        <div className="stat-title">Produits</div>
                        <div className="stat-value text-primary">{stats.totalProducts}</div>
                    </div>
                    <div className="stat bg-base-100 border-2 border-base-200 rounded-3xl">
                        <div className="stat-figure text-warning"><AlertTriangle /></div>
                        <div className="stat-title">Produits critiques</div>
                        <div className="stat-value text-warning">{stats.lowStockCount}</div>
                    </div>
                    <div className="stat bg-base-100 border-2 border-base-200 rounded-3xl">
                        <div className="stat-figure text-success"><Wallet /></div>
                        <div className="stat-title">Valeur du stock</div>
                        <div className="stat-value text-success text-2xl">{stats.stockValue.toFixed(0)} TND</div>
                    </div>
                    <div className="stat bg-base-100 border-2 border-base-200 rounded-3xl">
                        <div className="stat-figure text-info"><ShoppingBag /></div>
                        <div className="stat-title">Demandes en attente</div>
                        <div className="stat-value text-info">{stats.pendingRequestsCount}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="border-2 border-base-200 rounded-3xl p-4">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Ventes des 14 derniers jours (TND)
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={stats.salesByDay}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="total" stroke="#5E81AC" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border-2 border-base-200 rounded-3xl p-4">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Meilleures ventes
                        </h2>
                        {stats.topSellers.length === 0 ? (
                            <p className="text-sm text-base-content/70">Aucune vente confirmée pour le moment.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats.topSellers} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Bar dataKey="totalSold" fill="#A3BE8C" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="border-2 border-base-200 rounded-3xl p-4">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning" /> Produits critiques
                        </h2>
                        {stats.lowStockProducts.length === 0 ? (
                            <p className="text-sm text-base-content/70">Aucun produit critique.</p>
                        ) : (
                            <div className="space-y-2">
                                {stats.lowStockProducts.map((p) => (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <ProductImage src={p.imageUrl} alt={p.name} heightClass="h-8" widthClass="w-8" />
                                        <div className="flex-1 text-sm">{p.name}</div>
                                        <div className="badge badge-warning">{p.quantity} restant(s)</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-2 border-base-200 rounded-3xl p-4">
                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-error" /> Produits qui ne se vendent pas
                        </h2>
                        {stats.slowMovers.length === 0 ? (
                            <p className="text-sm text-base-content/70">Tous vos produits ont été vendus au moins une fois.</p>
                        ) : (
                            <div className="space-y-2">
                                {stats.slowMovers.map((p) => (
                                    <div key={p.productId} className="flex items-center gap-3">
                                        <ProductImage src={p.imageUrl} alt={p.name} heightClass="h-8" widthClass="w-8" />
                                        <div className="flex-1 text-sm">{p.name}</div>
                                        <div className="badge badge-ghost">{p.quantity} en stock</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        </RequireAuth>
    )
}

export default page