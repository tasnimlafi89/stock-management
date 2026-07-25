"use client"
import React from 'react'
import Image from 'next/image'
import { Product } from '@/type'
import { Heart } from 'lucide-react'

interface ProductCardProps {
    product: Product
    isFavorite: boolean
    onToggleFavorite: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorite, onToggleFavorite }) => {
    return (
        <div className="card bg-base-100 border-2 border-base-200 rounded-3xl overflow-hidden">
            <div className="relative w-full h-40 bg-base-200">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : null}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleFavorite(product)
                    }}
                    className="btn btn-circle btn-sm absolute top-2 right-2 bg-base-100"
                >
                    <Heart
                        className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-base-content"}`}
                    />
                </button>
            </div>
            <div className="p-4 space-y-1">
                <h3 className="font-bold text-lg truncate">{product.name}</h3>
                <div className="text-primary font-semibold">{product.price} TND</div>
                <div className="text-sm text-base-content/70">
                    Publié par {product.associationName || "Association inconnue"}
                </div>
            </div>
        </div>
    )
}

export default ProductCard