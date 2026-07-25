"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'
import { readFavoriteProducts, toggleFavorite } from '../action'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'
import { toast } from 'react-toastify'
import RequireAuth from '../components/RequireAuth'

const page = () => {
    const { isLoaded, user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [products, setProducts] = useState<Product[]>([])
    const [initialLoading, setInitialLoading] = useState(true)

    const loadFavorites = async () => {
        try {
            if (email) {
                const favProducts = await readFavoriteProducts(email)
                if (favProducts) setProducts(favProducts)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (isLoaded) {
            loadFavorites().finally(() => setInitialLoading(false))
        }
    }, [email, isLoaded])

    const handleRemoveFavorite = async (product: Product) => {
        try {
            await toggleFavorite(product.id, email)
            setProducts((prev) => prev.filter((p) => p.id !== product.id))
            toast.success("Retiré des favoris.")
        } catch (error) {
            console.error(error)
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
                <h1 className="text-2xl font-bold mb-4">Mes favoris</h1>
                {products.length === 0 ? (
                    <EmptyState
                        message="Aucun produit favori pour le moment"
                        IconComponent="Heart"
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFavorite={true}
                                onToggleFavorite={handleRemoveFavorite}
                            />
                        ))}
                    </div>
                )}
            </Wrapper>
        </RequireAuth>
    )
}

export default page