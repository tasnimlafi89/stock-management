"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import RequireAuth from '../components/RequireAuth'
import { useUser } from '@clerk/nextjs'
import { OrderView } from '@/type'
import { readIncomingOrders, respondToOrder } from '../action'
import ProductImage from '../components/ProductImage'
import EmptyState from '../components/EmptyState'
import { toast } from 'react-toastify'

const page = () => {
    const { isLoaded, user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [orders, setOrders] = useState<OrderView[]>([])
    const [initialLoading, setInitialLoading] = useState(true)

    const loadOrders = async () => {
        try {
            if (email) {
                const data = await readIncomingOrders(email)
                if (data) setOrders(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (isLoaded) {
            loadOrders().finally(() => setInitialLoading(false))
        }
    }, [email, isLoaded])

    const handleRespond = async (order: OrderView, status: "confirmed" | "denied") => {
        try {
            await respondToOrder(order.id, status, email)
            setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status } : o))
            toast.success(status === "confirmed" ? "Commande confirmée." : "Commande refusée.")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors du traitement de la commande.")
        }
    }

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <span className="loading loading-ring" style={{ width: '4rem', height: '4rem' }}></span>
            </div>
        )
    }

    const pendingOrders = orders.filter(o => o.status === "pending")
    const handledOrders = orders.filter(o => o.status !== "pending")

    return (
        <RequireAuth>
            <Wrapper>
                <h1 className="text-2xl font-bold mb-4">Demandes reçues</h1>

                {orders.length === 0 ? (
                    <EmptyState
                        message="Aucune demande reçue pour le moment"
                        IconComponent="Inbox"
                    />
                ) : (
                    <>
                        {pendingOrders.length > 0 && (
                            <div className="space-y-3 mb-8">
                                {pendingOrders.map((order) => (
                                    <div key={order.id} className="flex items-center gap-4 p-4 border-2 border-base-200 rounded-3xl">
                                        <ProductImage
                                            src={order.imageUrl}
                                            alt={order.productName}
                                            heightClass="h-16"
                                            widthClass="w-16"
                                        />
                                        <div className="flex-1">
                                            <div className="font-bold">{order.productName}</div>
                                            <div className="text-sm text-base-content/70">Demandeur : {order.buyerName}</div>
                                            <div className="text-sm">{order.quantity} unité(s) — {order.totalPrice.toFixed(2)} TND</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleRespond(order, "confirmed")}
                                            >
                                                Confirmer
                                            </button>
                                            <button
                                                className="btn btn-sm btn-error"
                                                onClick={() => handleRespond(order, "denied")}
                                            >
                                                Refuser
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {handledOrders.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Historique</h2>
                                <div className="space-y-3">
                                    {handledOrders.map((order) => (
                                        <div key={order.id} className="flex items-center gap-4 p-4 border-2 border-base-200 rounded-3xl opacity-70">
                                            <ProductImage
                                                src={order.imageUrl}
                                                alt={order.productName}
                                                heightClass="h-12"
                                                widthClass="w-12"
                                            />
                                            <div className="flex-1">
                                                <div className="font-bold">{order.productName}</div>
                                                <div className="text-sm text-base-content/70">Demandeur : {order.buyerName}</div>
                                            </div>
                                            <div className={`badge ${order.status === "confirmed" ? "badge-success" : "badge-error"}`}>
                                                {order.status === "confirmed" ? "Confirmée" : "Refusée"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Wrapper>
        </RequireAuth>
    )
}

export default page