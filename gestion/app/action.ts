"use server"

import { Category } from "@/src/generated/prisma/client";
import prisma from "@/src/lib/prisma";
import { BasketItemView, FormDataType, NotificationView, OrderView, Product } from "@/type";
import { promises } from "dns";
import { sendPushNotification } from './lib/sendPush'
import { DashboardStats } from "@/type"

export async function checkAndAddAssociation(email: string, name: string) {
    if (!email) return;
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email,
            }
        })
        if (!existingAssociation && name) {
            await prisma.association.create({
                data: {
                    email,
                    name,
                }
            })
        }
    } catch (error) {
        console.error(error)

    }
}

export async function getAssociation(email: string) {
    if (!email) return
    try {
        const existingAssociation = await prisma.association.findUnique({
            where: {
                email,
            }
        })
        return existingAssociation
    } catch (error) {
        console.error(error)
    }
}

export async function createCategory(
    name: string,
    email: string,
    description?: string,
) {
    if (!name) return
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }
        await prisma.category.create({
            data: {
                name,
                description: description || "",
                associationId: association.id,
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function updateCategory(
    id: string,
    name: string,
    email: string,
    description?: string,
) {
    if (!id || !name || !email) {
        throw new Error("L'id, le nom et l'email de l'association sont requis pour la mise à jour de la catégorie.")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }
        await prisma.category.update({
            where: {
                id: id,
                associationId: association.id,
            },
            data: {
                name,
                description: description || "",
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function deleteCategory(id: string, email: string) {
    if (!id || !email) {
        throw new Error("L'id et l'email de l'association sont requis pour la suppression de la catégorie.")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }
        await prisma.category.delete({
            where: {
                id: id,
                associationId: association.id,
            }
        })
    } catch (error) {
        console.error(error)
    }

}

export async function readCategory(email: string): Promise<Category[] | undefined> {
    if (!email) {
        throw new Error("L'email de l'association est requis pour la lecture de la catégorie.")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }
        const categories = await prisma.category.findMany({
            where: {
                associationId: association.id,
            }
        })
        return categories
    } catch (error) {
        console.error(error)
    }
}


export async function createProduct(formData: FormDataType, email: string) {
    try {
        const { name, description, price, imageUrl, categoryId, quantity, storageLocation, owner } = formData
        if (!email || !price || !categoryId) {
            throw new Error("L'email, le prix et l'id de catégorie sont requis pour la création du produit.")
        }

        const safeImageUrl = imageUrl || ""

        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }

        await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                quantity: quantity ? Number(quantity) : 0,
                storageLocation: storageLocation || null,
                owner: owner || null,
                imageUrl: safeImageUrl,
                categoryId: categoryId,
                associationId: association.id,
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function updateProduct(formData: FormDataType, email: string) {
    try {
        const { id, name, description, price, imageUrl, quantity, storageLocation, owner } = formData
        if (!id || !email) {
            throw new Error("L'id du produit et l'email sont requis pour la mise à jour.")
        }

        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }

        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: Number(price),
                quantity: quantity !== undefined ? Number(quantity) : undefined,
                storageLocation: storageLocation || null,
                owner: owner || null,
                imageUrl: imageUrl || undefined,
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function deleteProduct(id: string, email: string) {
    if (!id) {
        throw new Error("L'id est requis pour la suppression du produit.")
    }
    try {
        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }
        await prisma.product.delete({
            where: {
                id: id,
                associationId: association.id,
            }
        })
    } catch (error) {
        console.error(error)
    }
}

export async function readProducts(email: string): Promise<Product[] | undefined> {
    try {
        if (!email) {
            throw new Error("L'email de l'association est requis pour la lecture du produit.")
        }

        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }
        const products = await prisma.product.findMany({
            where: {
                associationId: association.id,
            },
            include: {
                category: true,
            }
        })
        return products.map(product => ({
            ...product,
            categoryName: product.category?.name || "",
        }))
    } catch (error) {
        console.error(error)
    }
}

export async function readProductById(productId: string, email: string): Promise<Product | undefined> {
    try {
        if (!email) {
            throw new Error("L'email de l'association est requis pour la lecture du produit.")
        }

        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvé avec cet email.")
        }
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
                associationId: association.id,
            },
            include: {
                category: true,
            }
        })
        if (!product) {
            return undefined
        }
        return ({
            ...product,
            categoryName: product.category?.name || "",
        })
    } catch (error) {
        console.error(error)
    }

}

export async function replenishStockWithTransaction(productId: string, quantity: number, email: string) {
    try {

        if (quantity <= 0) {
            throw new Error("La quantité à ajouter doit être supérieure à zéro.")
        }

        if (!email) {
            throw new Error("l'email est requis .")
        }

        const association = await getAssociation(email)
        if (!association) {
            throw new Error("Aucune association trouvée avec cet email.");
        }

        await prisma.product.update({
            where: {
                id: productId,
                associationId: association.id
            },
            data: {
                quantity: {
                    increment: quantity
                }
            }
        })

        await prisma.transaction.create({
            data: {
                type: "IN",
                quantity: quantity,
                productId: productId,
                associationId: association.id
            }
        })

    } catch (error) {
        console.error(error)
    }
}

export async function readAllProducts(email?: string): Promise<Product[] | undefined> {
    try {
        let excludeAssociationId: string | undefined

        if (email) {
            const association = await getAssociation(email)
            excludeAssociationId = association?.id
        }

        const products = await prisma.product.findMany({
            where: excludeAssociationId
                ? { associationId: { not: excludeAssociationId } }
                : undefined,
            include: {
                category: true,
                association: true,
            },
            orderBy: {
                createdAt: "desc",
            }
        })
        return products.map(product => ({
            ...product,
            categoryName: product.category?.name || "",
            associationName: product.association?.name || "",
        }))
    } catch (error) {
        console.error(error)
    }
}

export async function toggleFavorite(productId: string, email: string) {
    if (!productId || !email) {
        throw new Error("Le produit et l'email sont requis pour gérer les favoris.")
    }
    const association = await getAssociation(email)
    if (!association) {
        throw new Error("Aucune association trouvé avec cet email.")
    }

    const existing = await prisma.favorite.findUnique({
        where: {
            associationId_productId: {
                associationId: association.id,
                productId: productId,
            }
        }
    })

    if (existing) {
        await prisma.favorite.delete({
            where: { id: existing.id }
        })
        return { favorited: false }
    } else {
        await prisma.favorite.create({
            data: {
                associationId: association.id,
                productId: productId,
            }
        })
        return { favorited: true }
    }
}

export async function readFavoriteProductIds(email: string): Promise<string[] | undefined> {
    if (!email) return
    try {
        const association = await getAssociation(email)
        if (!association) return []
        const favorites = await prisma.favorite.findMany({
            where: { associationId: association.id },
            select: { productId: true }
        })
        return favorites.map(f => f.productId)
    } catch (error) {
        console.error(error)
    }
}

export async function readFavoriteProducts(email: string): Promise<Product[] | undefined> {
    if (!email) return
    try {
        const association = await getAssociation(email)
        if (!association) return []
        const favorites = await prisma.favorite.findMany({
            where: { associationId: association.id },
            include: {
                product: {
                    include: {
                        category: true,
                        association: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })
        return favorites.map(f => ({
            ...f.product,
            categoryName: f.product.category?.name || "",
            associationName: f.product.association?.name || "",
        }))
    } catch (error) {
        console.error(error)
    }
}

// ---------- Basket ----------

export async function addToBasket(productId: string, quantity: number, email: string) {
    if (!productId || !email || quantity < 1) {
        throw new Error("Données invalides pour l'ajout au panier.")
    }
    const association = await getAssociation(email)
    if (!association) {
        throw new Error("Aucune association trouvé avec cet email.")
    }

    const existing = await prisma.basketItem.findUnique({
        where: {
            associationId_productId: {
                associationId: association.id,
                productId: productId,
            }
        }
    })

    if (existing) {
        await prisma.basketItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + quantity }
        })
    } else {
        await prisma.basketItem.create({
            data: {
                associationId: association.id,
                productId: productId,
                quantity: quantity,
            }
        })
    }
}

export async function readBasket(email: string): Promise<BasketItemView[] | undefined> {
    if (!email) return
    const association = await getAssociation(email)
    if (!association) return []

    const items = await prisma.basketItem.findMany({
        where: { associationId: association.id },
        include: {
            product: {
                include: { association: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        productName: item.product.name,
        price: item.product.price,
        imageUrl: item.product.imageUrl,
        availableQuantity: item.product.quantity,
        associationName: item.product.association?.name || "Association inconnue",
    }))
}

export async function updateBasketItemQuantity(basketItemId: string, quantity: number, email: string) {
    if (!basketItemId || !email || quantity < 1) {
        throw new Error("Données invalides.")
    }
    const association = await getAssociation(email)
    if (!association) {
        throw new Error("Aucune association trouvé avec cet email.")
    }
    await prisma.basketItem.updateMany({
        where: { id: basketItemId, associationId: association.id },
        data: { quantity }
    })
}

export async function removeFromBasket(basketItemId: string, email: string) {
    if (!basketItemId || !email) {
        throw new Error("Données invalides.")
    }
    const association = await getAssociation(email)
    if (!association) {
        throw new Error("Aucune association trouvé avec cet email.")
    }
    await prisma.basketItem.deleteMany({
        where: { id: basketItemId, associationId: association.id }
    })
}

// ---------- Orders ----------

export async function placeOrder(email: string) {
    if (!email) {
        throw new Error("Email requis.")
    }
    const association = await getAssociation(email)
    if (!association) {
        throw new Error("Aucune association trouvé avec cet email.")
    }

    const basketItems = await prisma.basketItem.findMany({
        where: { associationId: association.id },
        include: { product: true }
    })

    if (basketItems.length === 0) {
        throw new Error("Votre panier est vide.")
    }

    for (const item of basketItems) {
        if (!item.product.associationId) continue

        await prisma.order.create({
            data: {
                buyerId: association.id,
                sellerId: item.product.associationId,
                productId: item.productId,
                quantity: item.quantity,
                totalPrice: item.product.price * item.quantity,
                status: "pending",
            }
        })

        await prisma.notification.create({
            data: {
                associationId: item.product.associationId,
                message: `${association.name} souhaite commander ${item.quantity} x "${item.product.name}".`,
            }
        })
        const seller = await prisma.association.findUnique({ where: { id: item.product.associationId } })
        await sendPushNotification(
            seller?.pushToken ?? null,
            'Nouvelle commande',
            `${association.name} souhaite commander ${item.quantity} x "${item.product.name}".`
        )
    }

    await prisma.basketItem.deleteMany({
        where: { associationId: association.id }
    })
}

export async function readMyOrders(email: string): Promise<OrderView[] | undefined> {
    if (!email) return
    const association = await getAssociation(email)
    if (!association) return []

    const orders = await prisma.order.findMany({
        where: { buyerId: association.id },
        include: {
            product: true,
            seller: true,
        },
        orderBy: { createdAt: "desc" }
    })

    return orders.map(order => ({
        id: order.id,
        productId: order.productId,
        productName: order.product.name,
        imageUrl: order.product.imageUrl,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status as "pending" | "confirmed" | "denied",
        createdAt: order.createdAt,
        sellerName: order.seller.name,
    }))
}

export async function readIncomingOrders(email: string): Promise<OrderView[] | undefined> {
    if (!email) return
    const association = await getAssociation(email)
    if (!association) return []

    const orders = await prisma.order.findMany({
        where: { sellerId: association.id },
        include: {
            product: true,
            buyer: true,
        },
        orderBy: { createdAt: "desc" }
    })

    return orders.map(order => ({
        id: order.id,
        productId: order.productId,
        productName: order.product.name,
        imageUrl: order.product.imageUrl,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        status: order.status as "pending" | "confirmed" | "denied",
        createdAt: order.createdAt,
        buyerName: order.buyer.name,
    }))
}

export async function respondToOrder(orderId: string, status: "confirmed" | "denied", email: string) {
    if (!orderId || !email) {
        throw new Error("Données invalides.")
    }
    const association = await getAssociation(email)
    if (!association) {
        throw new Error("Aucune association trouvé avec cet email.")
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: true, buyer: true }
    })

    if (!order || order.sellerId !== association.id) {
        throw new Error("Commande introuvable.")
    }

    if (order.status !== "pending") {
        throw new Error("Cette commande a déjà été traitée.")
    }

    if (status === "confirmed") {
        if (order.product.quantity < order.quantity) {
            throw new Error("Stock insuffisant pour confirmer cette commande.")
        }
        await prisma.product.update({
            where: { id: order.productId },
            data: { quantity: order.product.quantity - order.quantity }
        })
    }

    await prisma.order.update({
        where: { id: orderId },
        data: { status }
    })

    await prisma.notification.create({
        data: {
            associationId: order.buyerId,
            message: status === "confirmed"
                ? `Votre commande de "${order.product.name}" a été confirmée par ${association.name}.`
                : `Votre commande de "${order.product.name}" a été refusée par ${association.name}.`,
        }
    })
    const buyer = await prisma.association.findUnique({ where: { id: order.buyerId } })
    await sendPushNotification(
        buyer?.pushToken ?? null,
        status === 'confirmed' ? 'Commande confirmée' : 'Commande refusée',
        status === 'confirmed'
            ? `Votre commande de "${order.product.name}" a été confirmée par ${association.name}.`
            : `Votre commande de "${order.product.name}" a été refusée par ${association.name}.`
    )
}

// ---------- Notifications ----------

export async function readNotifications(email: string): Promise<NotificationView[] | undefined> {
    if (!email) return
    const association = await getAssociation(email)
    if (!association) return []

    const notifications = await prisma.notification.findMany({
        where: { associationId: association.id },
        orderBy: { createdAt: "desc" },
        take: 30,
    })

    return notifications
}

export async function markNotificationRead(notificationId: string, email: string) {
    if (!notificationId || !email) return
    const association = await getAssociation(email)
    if (!association) return

    await prisma.notification.updateMany({
        where: { id: notificationId, associationId: association.id },
        data: { read: true }
    })
}

export async function markAllNotificationsRead(email: string) {
    if (!email) return
    const association = await getAssociation(email)
    if (!association) return

    await prisma.notification.updateMany({
        where: { associationId: association.id, read: false },
        data: { read: true }
    })
}



export async function getDashboardStats(email: string): Promise<DashboardStats | undefined> {
    if (!email) return
    try {
        const association = await getAssociation(email)
        if (!association) return

        const products = await prisma.product.findMany({
            where: { associationId: association.id },
            include: { category: true }
        })

        const categories = await prisma.category.findMany({
            where: { associationId: association.id }
        })

        const lowStockProductsRaw = products
            .filter(p => p.quantity < 10)
            .sort((a, b) => a.quantity - b.quantity)

        const stockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)

        const pendingRequestsCount = await prisma.order.count({
            where: { sellerId: association.id, status: "pending" }
        })

        const confirmedOrders = await prisma.order.findMany({
            where: { sellerId: association.id, status: "confirmed" },
            include: { product: true }
        })

        const salesByProduct = new Map<string, { name: string; imageUrl: string; totalSold: number }>()
        for (const order of confirmedOrders) {
            const existing = salesByProduct.get(order.productId)
            if (existing) {
                existing.totalSold += order.quantity
            } else {
                salesByProduct.set(order.productId, {
                    name: order.product.name,
                    imageUrl: order.product.imageUrl,
                    totalSold: order.quantity
                })
            }
        }

        const topSellers = Array.from(salesByProduct.entries())
            .map(([productId, data]) => ({ productId, ...data }))
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 5)

        const soldProductIds = new Set(salesByProduct.keys())
        const slowMovers = products
            .filter(p => p.quantity > 0 && !soldProductIds.has(p.id))
            .slice(0, 5)
            .map(p => ({ productId: p.id, name: p.name, imageUrl: p.imageUrl, quantity: p.quantity }))

        const now = new Date()
        const salesByDayMap = new Map<string, number>()
        for (let i = 13; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            salesByDayMap.set(d.toISOString().slice(0, 10), 0)
        }
        for (const order of confirmedOrders) {
            const key = new Date(order.createdAt).toISOString().slice(0, 10)
            if (salesByDayMap.has(key)) {
                salesByDayMap.set(key, (salesByDayMap.get(key) || 0) + order.totalPrice)
            }
        }
        const salesByDay = Array.from(salesByDayMap.entries()).map(([date, total]) => ({ date, total }))

        return {
            totalProducts: products.length,
            totalCategories: categories.length,
            lowStockCount: lowStockProductsRaw.length,
            stockValue,
            pendingRequestsCount,
            lowStockProducts: lowStockProductsRaw.slice(0, 10).map(p => ({
                ...p,
                categoryName: p.category?.name || ""
            })),
            topSellers,
            slowMovers,
            salesByDay,
        }
    } catch (error) {
        console.error(error)
    }
}