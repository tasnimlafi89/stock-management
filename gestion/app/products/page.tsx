"use client";
import React, { useEffect, useMemo, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/type";
import { Category } from "@/src/generated/prisma/client";
import { deleteProduct, readCategory, readProducts } from "../action";
import EmptyState from "../components/EmptyState";
import ProductImage from "../components/ProductImage";
import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Trash } from "lucide-react";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";

type SortKey = "name" | "price" | "quantity" | "categoryName" | "createdAt";
type SortDirection = "asc" | "desc";

const page = () => {
    const { isLoaded, user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const [storageSearch, setStorageSearch] = useState<string>("");
    const [ownerSearch, setOwnerSearch] = useState<string>("");
    const [sortKey, setSortKey] = useState<SortKey | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [initialLoading, setInitialLoading] = useState(true)

    const fetchProducts = async () => {
        try {
            if (email) {
                const products = await readProducts(email);
                if (products) {
                    setProducts(products)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchCategories = async () => {
        try {
            if (email) {
                const data = await readCategory(email);
                if (data) {
                    setCategories(data)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (isLoaded) {
            Promise.all([fetchProducts(), fetchCategories()]).finally(() => setInitialLoading(false));
        }
    }, [email, isLoaded])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDirection("asc");
        }
    }

    const renderSortIcon = (key: SortKey) => {
        if (sortKey !== key) {
            return <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />;
        }
        return sortDirection === "asc"
            ? <ChevronUp className="w-3.5 h-3.5" />
            : <ChevronDown className="w-3.5 h-3.5" />;
    }

    const visibleProducts = useMemo(() => {
        let result = [...products];

        if (categoryFilter) {
            result = result.filter((p) => p.categoryId === categoryFilter);
        }

        if (search.trim()) {
            const term = search.trim().toLowerCase();
            result = result.filter((p) => p.name.toLowerCase().includes(term));
        }

        if (storageSearch.trim()) {
            const term = storageSearch.trim().toLowerCase();
            result = result.filter((p) => (p.storageLocation || "").toLowerCase().includes(term));
        }

        if (ownerSearch.trim()) {
            const term = ownerSearch.trim().toLowerCase();
            result = result.filter((p) => (p.owner || "").toLowerCase().includes(term));
        }

        if (sortKey) {
            result.sort((a, b) => {
                let comparison = 0;

                switch (sortKey) {
                    case "name":
                        comparison = a.name.localeCompare(b.name);
                        break;
                    case "price":
                        comparison = a.price - b.price;
                        break;
                    case "quantity":
                        comparison = a.quantity - b.quantity;
                        break;
                    case "categoryName":
                        comparison = a.categoryName.localeCompare(b.categoryName);
                        break;
                    case "createdAt":
                        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                        break;
                }

                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return result;
    }, [products, categoryFilter, search, storageSearch, ownerSearch, sortKey, sortDirection]);

    const handleDeleteProduct = async (product: Product) => {
        const confirmDelete = confirm("Voulez-vous vraiment supprimer ce produit ?");
        if (!confirmDelete) return;
        try {
            if (product.imageUrl) {
                const resDelete = await fetch("/api/upload", {
                    method: "DELETE",
                    body: JSON.stringify({ path: product.imageUrl }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                const dataDelete = await resDelete.json()
                if (!dataDelete.success) {
                    throw new Error("Erreur lors de la suppression de l'image")
                } else {
                    if (email) {
                        await deleteProduct(product.id, email)
                        await fetchProducts()
                        toast.success("Produit supprimé avec succès")
                    }
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    const sortableHeader = (label: string, key: SortKey) => (
        <th
            className="cursor-pointer select-none hover:bg-base-200"
            onClick={() => handleSort(key)}
        >
            <div className="flex items-center gap-1">
                {label}
                {renderSortIcon(key)}
            </div>
        </th>
    )

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <span className="loading loading-ring loading-xl" style={{ height: "3rem" , width: "3rem" }}></span>
            </div>
        )
    }

    return (
        <Wrapper>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Produits</h1>
                <Link href="/new-product" className="btn btn-primary">
                    <Plus className="w-4 h-4" />
                    Nouveau produit
                </Link>
            </div>
            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <div>
                    <label className="block text-sm font-semibold mb-1">Rechercher</label>
                    <label className="input input-bordered flex items-center gap-2">
                        <Search className="w-4 h-4 opacity-50" />
                        <input
                            type="text"
                            className="grow"
                            placeholder="Nom du produit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Lieu de stockage</label>
                    <label className="input input-bordered flex items-center gap-2">
                        <Search className="w-4 h-4 opacity-50" />
                        <input
                            type="text"
                            className="grow"
                            placeholder="Lieu de stockage..."
                            value={storageSearch}
                            onChange={(e) => setStorageSearch(e.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Propriétaire</label>
                    <label className="input input-bordered flex items-center gap-2">
                        <Search className="w-4 h-4 opacity-50" />
                        <input
                            type="text"
                            className="grow"
                            placeholder="Propriétaire..."
                            value={ownerSearch}
                            onChange={(e) => setOwnerSearch(e.target.value)}
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Catégorie</label>
                    <select
                        className="select select-bordered"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">Toutes les catégories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                {visibleProducts.length === 0 ? (
                    <div>
                        <EmptyState
                            message='Aucun produit disponible'
                            IconComponent='PackageSearch'
                        />
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Image</th>
                                {sortableHeader("Nom", "name")}
                                <th>Description</th>
                                {sortableHeader("Prix", "price")}
                                {sortableHeader("Quantité", "quantity")}
                                <th>Lieu de stockage</th>
                                <th>Propriétaire</th>
                                {sortableHeader("Catégorie", "categoryName")}
                                {sortableHeader("Date d'ajout", "createdAt")}
                                <th>Actions</th>
                            </tr>

                        </thead>
                        <tbody>
                            {visibleProducts.map((product, index) => (
                                <tr key={product.id}>
                                    <th>{index + 1}</th>
                                    <td>
                                        <ProductImage
                                            src={product.imageUrl}
                                            alt={product.imageUrl}
                                            heightClass='h-12'
                                            widthClass='w-12'
                                        />
                                    </td>
                                    <td>
                                        {product.name}
                                    </td>
                                    <td>
                                        {product.description}
                                    </td>
                                    <td>
                                        {product.price} TND
                                    </td>
                                    <td>
                                        {product.quantity}
                                    </td>
                                    <td>
                                        {product.storageLocation || "-"}
                                    </td>
                                    <td>
                                        {product.owner || "-"}
                                    </td>
                                    <td>
                                        {product.categoryName}
                                    </td>
                                    <td>
                                        {new Date(product.createdAt).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td>
                                        <div className="flex gap-2 flex-col">
                                            <Link className="btn btn-xs w-fit btn-primary" href={`/update-product/${product.id}`}>
                                                Modifier
                                            </Link>
                                            <button className="btn btn-xs w-fit btn-danger" onClick={() => handleDeleteProduct(product)}>
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </div>
        </Wrapper>
    );
};

export default page;