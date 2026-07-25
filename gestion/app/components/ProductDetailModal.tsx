"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/type'
import { addToBasket } from '../action'
import { toast } from 'react-toastify'

interface ProductDetailModalProps {
    product: Product | null
    email: string
    onClose: () => void
    onAdded?: () => void
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, email, onClose, onAdded }) => {
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setQuantity(1)
    }, [product])

    if (!product) return null

    const totalPrice = product.price * quantity

    const handleAddToBasket = async () => {
        if (!email) {
            toast.error("Vous devez être connecté pour ajouter au panier.")
            return
        }
        setLoading(true)
        try {
            await addToBasket(product.id, quantity, email)
            toast.success("Produit ajouté au panier.")
            onAdded?.()
            onClose()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de l'ajout au panier.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <dialog open className="modal modal-open">
            <div className="modal-box max-w-lg">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="relative w-full h-48 bg-base-200 rounded-2xl overflow-hidden mb-4">
                    {product.imageUrl ? (
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                    ) : null}
                </div>

                <h3 className="font-bold text-xl mb-1">{product.name}</h3>
                <p className="text-sm text-base-content/70 mb-3">
                    Publié par {product.associationName || "Association inconnue"}
                </p>

                <p className="mb-4">{product.description}</p>

                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="badge badge-outline">Catégorie : {product.categoryName}</div>
                    <div className="badge badge-outline">Disponible : {product.quantity}</div>
                    <div className="badge badge-outline">Prix unitaire : {product.price} TND</div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <label className="text-sm font-semibold">Quantité</label>
                    <input
                        type="number"
                        min={1}
                        max={product.quantity}
                        className="input input-bordered input-sm w-24"
                        value={quantity}
                        onChange={(e) => {
                            const val = Number(e.target.value)
                            if (val >= 1 && val <= product.quantity) setQuantity(val)
                        }}
                    />
                </div>

                <div className="text-lg font-bold mb-4">
                    Total : {totalPrice.toFixed(2)} TND
                </div>

                <button
                    className="btn btn-primary w-full"
                    disabled={loading || product.quantity === 0}
                    onClick={handleAddToBasket}
                >
                    {product.quantity === 0 ? "Rupture de stock" : loading ? "Ajout..." : "Ajouter au panier"}
                </button>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </dialog>
    )
}

export default ProductDetailModal