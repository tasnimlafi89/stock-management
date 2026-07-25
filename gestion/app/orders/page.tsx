"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import RequireAuth from '../components/RequireAuth'
import { useUser } from '@clerk/nextjs'
import { OrderView } from '@/type'
import { readMyOrders } from '../action'
import ProductImage from '../components/ProductImage'
import EmptyState from '../components/EmptyState'

const statusBadge = (status: string) => {
    switch (status) {
        case "confirmed":
            return <div className="badge badge-success">Confirmée</div>
        case "denied":
            return <div className="badge badge-error">Refusée</div>
        default:
            return <div className="badge badge-warning">En cours de traitement</div>
    }
}

const page = () => {
    const { isLoaded, user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [orders, setOrders] = useState<OrderView[]>([])
    const [initialLoading, setInitialLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                if (email) {
                    const data = await readMyOrders(email)
                    if (data) setOrders(data)
                }
            } catch (error) {
                console.error(error)
            }
        }
        if (isLoaded) {
            load().finally(() => setInitialLoading(false))
        }
    }, [email, isLoaded])

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <span className="loading loading-ring" style={{ width: '4rem', height: '4rem' }}></span>
            </div>
        )
    }

    return (
        <RequireAuth>
            <Wrapper>
                <h1 className="text-2xl font-bold mb-4">Mes commandes</h1>

                {orders.length === 0 ? (
                    <EmptyState
                        message="Aucune commande pour le moment"
                        IconComponent="Package"
                    />
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div key={order.id} className="flex items-center gap-4 p-4 border-2 border-base-200 rounded-3xl">
                                <ProductImage
                                    src={order.imageUrl}
                                    alt={order.productName}
                                    heightClass="h-16"
                                    widthClass="w-16"
                                />
                                <div className="flex-1">
                                    <div className="font-bold">{order.productName}</div>
                                    <div className="text-sm text-base-content/70">Vendeur : {order.sellerName}</div>
                                    <div className="text-sm">{order.quantity} unité(s) — {order.totalPrice.toFixed(2)} TND</div>
                                </div>
                                {statusBadge(order.status)}
                            </div>
                        ))}
                    </div>
                )}
            </Wrapper>
        </RequireAuth>
    )
}

export default page