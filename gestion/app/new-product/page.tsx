"use client"
import React, { useEffect, useState } from 'react'
import Wrapper from '../components/Wrapper'
import RequireAuth from '../components/RequireAuth'
import { useUser } from '@clerk/nextjs';
import { Category } from '@/src/generated/prisma/client';
import { FormDataType } from '@/type';
import { createProduct, readCategory } from '../action';
import { FileImage } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const page = () => {
    const { isLoaded, user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;

    const router = useRouter()
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [initialLoading, setInitialLoading] = useState(true)
    const [formData, setFormData] = useState<FormDataType>({
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        storageLocation: "",
        owner: "",
        categoryId: "",
        imageUrl: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value });
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                if (email) {
                    const data = await readCategory(email);
                    if (data)
                        setCategories(data)
                }
            } catch (error) {
                console.error("Erreur lors du chargement des catégories", error)
            } finally {
                setInitialLoading(false)
            }
        }
        if (isLoaded) {
            fetchCategories();
        }
    }, [email, isLoaded])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile)
        if (selectedFile)
            setPreviewUrl(URL.createObjectURL(selectedFile));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let imageUrl = ""

            if (file) {
                const imageData = new FormData()
                imageData.append("file", file)
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: imageData
                })

                const data = await res.json()
                if (!data.success) {
                    throw new Error("Erreur lors de l'upload de l'image.")
                }
                imageUrl = data.path
            }

            if (email) {
                await createProduct({ ...formData, imageUrl }, email)
                toast.success("Produit ajouté avec succès.")
                router.push("/products")
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de l'ajout du produit.")
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
                <div>
                    <h1 className="text-2xl font-bold mb-4">Nouveau produit</h1>
                </div>
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                    <form className="w-full md:w-[420px] space-y-2 flex flex-col" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            name="name"
                            placeholder="Nom"
                            value={formData.name}
                            onChange={handleChange}
                        />

                        <textarea
                            name="description"
                            placeholder="Description"
                            className="textarea textarea-bordered w-full h-[100px]"
                            value={formData.description}
                            onChange={handleChange}
                        />

                        <select
                            name="categoryId"
                            className="select select-bordered w-full"
                            value={formData.categoryId}
                            onChange={handleChange}
                        >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((cat) => {
                                return <option
                                    key={cat.id}
                                    value={cat.id}
                                >
                                    {cat.name}
                                </option>
                            })}
                        </select>

                        <div className="text-sm font-semibold mb-2">Prix (TND)</div>
                        <input
                            type="number"
                            name="price"
                            placeholder="Prix"
                            className="input input-bordered w-full"
                            value={formData.price}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="storageLocation"
                            placeholder="Lieu de stockage"
                            className="input input-bordered w-full"
                            value={formData.storageLocation}
                            onChange={handleChange}
                        />

                        <input
                            type="text"
                            name="owner"
                            placeholder="Propriétaire"
                            className="input input-bordered w-full"
                            value={formData.owner}
                            onChange={handleChange}
                        />

                        <input
                            type="file"
                            accept="image/*"
                            className="file-input file-input-bordered w-full"
                            onChange={handleFileChange}
                        />

                        <button type="submit" className="btn btn-primary mt-4">
                            Ajouter
                        </button>
                    </form>

                    <div className="w-64 h-64 border-2 border-primary p-5 justify-center items-center rounded-3xl hidden md:flex shrink-0">
                        {previewUrl ? (
                            <ProductImage
                                src={previewUrl}
                                alt="preview"
                                heightClass="h-40"
                                widthClass="w-40"
                            />
                        ) : (
                            <div className="wiggle-animation">
                                <FileImage strokeWidth={1} className='h-10 w-10 text-primary' />
                            </div>
                        )}
                    </div>
                </div>
            </Wrapper>
        </RequireAuth>
    );
};

export default page;