"use client"
import { readProductById, updateProduct } from '@/app/action';
import ProductImage from '@/app/components/ProductImage';
import Wrapper from '@/app/components/Wrapper';
import RequireAuth from '@/app/components/RequireAuth';
import { FormDataType, Product } from '@/type';
import { useUser } from '@clerk/nextjs';
import { FileImage } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const page = ({ params }: { params: Promise<{ productId: string }> }) => {
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [product, setProduct] = useState<Product | null>(null)
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormDataType>({
        id: "",
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        storageLocation: "",
        owner: "",
        categoryId: "",
        imageUrl: "",
        categoryName: ""
    });

    const router = useRouter()

    const fetchProduct = async () => {
        try {
            const { productId } = await params
            if (email) {
                const fetchedProduct = await readProductById(productId, email)
                if (fetchedProduct) {
                    setProduct(fetchedProduct)
                    setFormData({
                        id: fetchedProduct.id,
                        name: fetchedProduct.name,
                        description: fetchedProduct.description,
                        price: fetchedProduct.price,
                        quantity: fetchedProduct.quantity,
                        storageLocation: fetchedProduct.storageLocation || "",
                        owner: fetchedProduct.owner || "",
                        categoryId: fetchedProduct.categoryId,
                        imageUrl: fetchedProduct.imageUrl,
                        categoryName: fetchedProduct.categoryName
                    })
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchProduct()
    }, [email])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value });
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile)
        if (selectedFile)
            setPreviewUrl(URL.createObjectURL(selectedFile));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let imageUrl = formData.imageUrl

            if (file) {
                const resDelete = await fetch("/api/upload", {
                    method: "DELETE",
                    body: JSON.stringify({ path: formData.imageUrl }),
                    headers: { 'Content-Type': 'application/json' }
                })
                const dataDelete = await resDelete.json()
                if (!dataDelete.success) {
                    throw new Error("Erreur lors de la suppression de l'image.")
                }

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

            const updatedFormData = { ...formData, imageUrl }
            await updateProduct(updatedFormData, email)
            toast.success("Produit mis à jour avec succès !")
            router.push("/products")
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la mise à jour du produit.")
        }
    }

    return (
        <RequireAuth>
            <div>
                {product ? (
                    <Wrapper>
                        <div>
                            <h1 className="text-2xl font-bold mb-4">
                                Mise à jour du produit
                            </h1>
                        </div>
                        <div className="flex md:flex-row flex-col md:items-center">
                            <form className="space-y-2" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    name="name"
                                    placeholder="Nom"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />

                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    className="textarea textarea-bordered w-full h-[100px]"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />

                                <input
                                    type="text"
                                    name="categoryName"
                                    placeholder={formData.categoryName}
                                    className="input input-bordered w-full"
                                    value={formData.categoryName}
                                    onChange={handleInputChange}
                                    disabled
                                />

                                <div className="text-sm font-semibold mb-2">Prix (TND)</div>
                                <input
                                        type="number"
                                        name="price"
                                        placeholder="prix"
                                        className="input input-bordered w-full"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                    />
                                <div className="flex">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="file-input file-input-bordered w-full"
                                        onChange={handleFileChange}
                                    />
                                    
                                </div>
                                <div className="text-sm font-semibold mb-2">Quantité en stock</div>
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantité en stock"
                                    className="input input-bordered w-full"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    disabled
                                />

                                <input
                                    type="text"
                                    name="storageLocation"
                                    placeholder="Lieu de stockage"
                                    className="input input-bordered w-full"
                                    value={formData.storageLocation}
                                    onChange={handleInputChange}
                                />

                                <input
                                    type="text"
                                    name="owner"
                                    placeholder="Propriétaire"
                                    className="input input-bordered w-full"
                                    value={formData.owner}
                                    onChange={handleInputChange}
                                />

                                <button type="submit" className="btn btn-primary mt-4" >
                                    Mettre à jour
                                </button>
                            </form>
                            <div className="flex md:flex-col md:ml-4 md:ml-0">
                                <div className="md:ml-4 md:w-[200px] mt-4 md:mt-0 border-2 border-primary md:h-[200px] p-5 justify-center items-center rounded-3xl hidden md:flex">
                                    {formData.imageUrl && formData.imageUrl !== "" ? (
                                        <div>
                                            <ProductImage
                                                src={formData.imageUrl}
                                                alt={product.name}
                                                heightClass="h-40"
                                                widthClass="w-40"
                                            />
                                        </div>
                                    ) : (
                                        <div className="wiggle-animation">
                                            <FileImage strokeWidth={1} className='h-10 w-10 text-primary' />
                                        </div>
                                    )}
                                </div>
                                <div className="md:ml-4 w-full md:w-[200px] mt-4 border-2 border-primary md:h-[200px] p-5 flex justify-center items-center rounded-3xl md:mt-4">
                                    {previewUrl && previewUrl !== "" ? (
                                        <div>
                                            <ProductImage
                                                src={previewUrl}
                                                alt="preview"
                                                heightClass="h-40"
                                                widthClass="w-40"
                                            />
                                        </div>
                                    ) : (
                                        <div className="wiggle-animation">
                                            <FileImage strokeWidth={1} className='h-10 w-10 text-primary' />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Wrapper>
                ) : (
                    <div className="flex justify-center items-center min-h-screen w-full">
                        <span className="loading loading-ring" style={{ width: '3rem', height: '3rem' }}></span>
                    </div>
                )}
            </div>
        </RequireAuth>
    )
}

export default page