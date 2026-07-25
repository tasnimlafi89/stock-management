"use client"
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CategoryModal from "../components/CategoryModal";
import { useUser } from "@clerk/nextjs";
import { createCategory, deleteCategory, readCategory, updateCategory } from "../action";
import { toast } from "react-toastify";
import { Category } from "@/src/generated/prisma/client";
import EmptyState from "../components/EmptyState";
import { Pencil, Trash } from "lucide-react";
import RequireAuth from "../components/RequireAuth";

const page = () => {
    const { isLoaded, user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress as string;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [initialLoading, setInitialLoading] = useState(true)

    const loadCategories = async () => {
        if (email) {
            const data = await readCategory(email);
            if (data)
                setCategories(data)
        }
    }

    useEffect(() => {
        if (isLoaded) {
            loadCategories().finally(() => setInitialLoading(false));
        }
    }, [email, isLoaded]);

    const openCreateModal = () => {
        setName("");
        setDescription("");
        setEditMode(false);
        (document.getElementById("Category_modal") as HTMLDialogElement)?.showModal();
    }
    const CloseModal = () => {
        setName("");
        setDescription("");
        setEditMode(false);
        (document.getElementById("Category_modal") as HTMLDialogElement)?.close();
    }

    const handleCreateCategory = async () => {
        setLoading(true);
        if (email) {
            await createCategory(name, email, description);
        }
        await loadCategories();
        CloseModal()
        setLoading(false);
        toast.success("Catégorie ajoutée avec succès.");

    }
    const handleUpdateCategory = async () => {
        if (!editingCategoryId) return
        setLoading(true);
        if (email) {
            await updateCategory(editingCategoryId, name, email, description);
        }
        await loadCategories();
        CloseModal()
        setLoading(false);
        toast.success("Catégorie modifiée avec succès.");

    }

    const openEditModal = (category: Category) => {
        setName(category.name);
        setDescription(category.description || "");
        setEditMode(true);
        setEditingCategoryId(category.id);
        (document.getElementById("Category_modal") as HTMLDialogElement)?.showModal();
    }

    const handleDeleteCategory = async (categoryId: string) => {
        const confirmDelete = confirm("Voulez-vous vraiment supprimer cette catégorie ? Tous les produits associés seront également supprimés");
        if (!confirmDelete) return;

        await deleteCategory(categoryId, email);
        await loadCategories();
        toast.success("Catégorie supprimée avec succès.");
    }

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <span className="loading loading-ring" style={{ width: '3rem', height: '3rem' }}></span>
            </div>
        )
    }

    return (
        <RequireAuth>
            <Wrapper>
                <div>
                    <div className="mb-4">
                        <button className="btn btn-primary"
                            onClick={openCreateModal}
                        >
                            Ajouter une catégorie
                        </button>
                    </div>
                    {categories.length > 0 ? (
                        <div>
                            {categories.map((category) => (
                                <div key={category.id} className="mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center">
                                    <div>
                                        <strong className="text-lg">{category.name}</strong>
                                        <div className="text-sm">{category.description}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm"
                                            onClick={() => openEditModal(category)} >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button className="btn btn-sm btn-error"
                                            onClick={() => handleDeleteCategory(category.id)}>
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            message={"Aucune catégorie disponible actuellement"}
                            IconComponent="Group" />
                    )}
                </div>
                <CategoryModal
                    name={name}
                    description={description}
                    loading={loading}
                    onClose={CloseModal}
                    onChangeName={setName}
                    onChangeDescription={setDescription}
                    onSubmit={editMode ? handleUpdateCategory : handleCreateCategory}
                />
            </Wrapper>
        </RequireAuth>
    );
};

export default page;