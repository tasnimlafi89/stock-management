"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Wrapper from '../components/Wrapper'
import RequireAuth from '../components/RequireAuth'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { BasketItemView } from '@/type'
import { placeOrder, readBasket, removeFromBasket, updateBasketItemQuantity } from '../action'
import ProductImage from '../components/ProductImage'
import EmptyState from '../components/EmptyState'
import { Trash } from 'lucide-react'
import { toast } from 'react-toastify'

const page = () => {
    const { isLoaded, user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const router = useRouter()

    const [items, setItems] = useState<BasketItemView[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [placing, setPlacing] = useState(false)

    const loadBasket = async () => {
        try {
            if (email) {
                const data = await readBasket(email)
                if (data) setItems(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (isLoaded) {
            loadBasket().finally(() => setInitialLoading(false))
        }
    }, [email, isLoaded])

    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }, [items])

    const handleQuantityChange = async (item: BasketItemView, quantity: number) => {
        if (quantity < 1 || quantity > item.availableQuantity) return
        try {
            await updateBasketItemQuantity(item.id, quantity, email)
            setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity } : i))
        } catch (error) {
            console.error(error)
        }
    }

    const handleRemove = async (item: BasketItemView) => {
        try {
            await removeFromBasket(item.id, email)
            setItems((prev) => prev.filter((i) => i.id !== item.id))
            toast.success("Produit retiré du panier.")
        } catch (error) {
            console.error(error)
        }
    }

    const handlePlaceOrder = async () => {
        setPlacing(true)
        try {
            await placeOrder(email)
            toast.success("Commande envoyée avec succès.")
            router.push("/orders")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la commande.")
        } finally {
            setPlacing(false)
        }
    }

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
                <h1 className="text-2xl font-bold mb-4">Mon panier</h1>

                {items.length === 0 ? (
                    <EmptyState
                        message="Votre panier est vide"
                        IconComponent="ShoppingCart"
                    />
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 border-2 border-base-200 rounded-3xl">
                                <ProductImage
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    heightClass="h-16"
                                    widthClass="w-16"
                                />
                                <div className="flex-1">
                                    <div className="font-bold">{item.productName}</div>
                                    <div className="text-sm text-base-content/70">Vendu par {item.associationName}</div>
                                    <div className="text-sm">{item.price} TND / unité</div>
                                </div>
                                <input
                                    type="number"
                                    min={1}
                                    max={item.availableQuantity}
                                    className="input input-bordered input-sm w-20"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                                />
                                <div className="font-bold w-24 text-right">
                                    {(item.price * item.quantity).toFixed(2)} TND
                                </div>
                                <button
                                    className="btn btn-sm btn-error"
                                    onClick={() => handleRemove(item)}
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        <div className="flex justify-between items-center pt-4 border-t-2 border-base-200">
                            <div className="text-xl font-bold">Total : {total.toFixed(2)} TND</div>
                            <button
                                className="btn btn-primary"
                                disabled={placing}
                                onClick={handlePlaceOrder}
                            >
                                {placing ? "Envoi..." : "Passer la commande"}
                            </button>
                        </div>
                    </div>
                )}
            </Wrapper>
        </RequireAuth>
    )
}

export default page