"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'
import { readAllProducts, readFavoriteProductIds, toggleFavorite } from '../action'
import ProductCard from '../components/ProductCard'
import ProductDetailModal from '../components/ProductDetailModal'
import EmptyState from '../components/EmptyState'
import { Search } from 'lucide-react'
import { toast } from 'react-toastify'

const page = () => {
    const { isLoaded, user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string

    const [products, setProducts] = useState<Product[]>([])
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState("")
    const [initialLoading, setInitialLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const loadData = async () => {
        try {
            const allProducts = await readAllProducts(email)
            if (allProducts) setProducts(allProducts)

            if (email) {
                const favIds = await readFavoriteProductIds(email)
                if (favIds) setFavoriteIds(new Set(favIds))
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (isLoaded) {
            loadData().finally(() => setInitialLoading(false))
        }
    }, [email, isLoaded])

    const handleToggleFavorite = async (product: Product) => {
        if (!email) {
            toast.error("Vous devez être connecté pour ajouter un favori.")
            return
        }
        try {
            const result = await toggleFavorite(product.id, email)
            setFavoriteIds((prev) => {
                const next = new Set(prev)
                if (result?.favorited) {
                    next.add(product.id)
                } else {
                    next.delete(product.id)
                }
                return next
            })
            toast.success(result?.favorited ? "Ajouté aux favoris." : "Retiré des favoris.")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la gestion des favoris.")
        }
    }

    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products
        const term = search.trim().toLowerCase()
        return products.filter((p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            (p.associationName || "").toLowerCase().includes(term)
        )
    }, [products, search])

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <span className="loading loading-ring" style={{ width: '4rem', height: '4rem' }}></span>
            </div>
        )
    }

    return (
        <Wrapper>
            <div className="mb-6">
                <label className="input input-bordered flex items-center gap-2 w-full max-w-md">
                    <Search className="w-4 h-4 opacity-50" />
                    <input
                        type="text"
                        className="grow"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>
            </div>

            {filteredProducts.length === 0 ? (
                <EmptyState
                    message="Aucun produit trouvé"
                    IconComponent="PackageSearch"
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="cursor-pointer" onClick={() => setSelectedProduct(product)}>
                            <ProductCard
                                product={product}
                                isFavorite={favoriteIds.has(product.id)}
                                onToggleFavorite={(p) => {
                                    handleToggleFavorite(p)
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            <ProductDetailModal
                product={selectedProduct}
                email={email}
                onClose={() => setSelectedProduct(null)}
            />
        </Wrapper>
    )
}

export default page