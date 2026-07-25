"use client"
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { Bell, Clipboard, Heart, HelpingHand, ListTree, Menu, Package, PackagePlus, Search, ShoppingBasket, ShoppingCart, Tags, Warehouse, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { checkAndAddAssociation, readBasket, readNotifications, markAllNotificationsRead } from '../action'
import { NotificationView } from '@/type'
import Stock from './stock'

const NavBar = () => {
    const { user } = useUser()

    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [basketCount, setBasketCount] = useState(0)
    const [notifications, setNotifications] = useState<NotificationView[]>([])
    const [showNotifications, setShowNotifications] = useState(false)

    const navLinks = [
        { href: "/explore", label: "Recherche", icon: Search },
        { href: "/category", label: "Catégories", icon: Tags },
        { href: "/products", label: "Produits", icon: Package },
        { href: "/orders", label: "Commandes", icon: ListTree },
        { href: "/requests", label: "Demandes reçues", icon: Clipboard },
        { href: "/favorites", label: "Favoris", icon: Heart },
    ]

    useEffect(() => {
        if (!user?.primaryEmailAddress?.emailAddress || !user.fullName) return;
        checkAndAddAssociation(user.primaryEmailAddress.emailAddress, user.fullName);
    }, [user]);

    useEffect(() => {
        const loadHeaderData = async () => {
            const email = user?.primaryEmailAddress?.emailAddress
            if (!email) return

            const basket = await readBasket(email)
            if (basket) setBasketCount(basket.reduce((sum, item) => sum + item.quantity, 0))

            const notifs = await readNotifications(email)
            if (notifs) setNotifications(notifs)
        }
        loadHeaderData()
    }, [user])

    const unreadCount = notifications.filter(n => !n.read).length

    const handleOpenNotifications = async () => {
        setShowNotifications((prev) => !prev)
        const email = user?.primaryEmailAddress?.emailAddress
        if (email && unreadCount > 0) {
            await markAllNotificationsRead(email)
            setNotifications((prev) => prev.map(n => ({ ...n, read: true })))
        }
    }

    const handleOpenStock = () => {
        const modal = document.getElementById("my_modal_stock") as HTMLDialogElement
        modal?.showModal()
    }

    // Fluid sizing: shrinks continuously with viewport width instead of jumping at one breakpoint
    const fluidIconStyle: React.CSSProperties = {
        width: 'clamp(14px, 1.3vw, 18px)',
        height: 'clamp(14px, 1.3vw, 18px)',
    }
    const fluidTextClass = "text-[clamp(0.65rem,0.85vw,0.875rem)]"
    const fluidPaddingClass = "px-[clamp(6px,0.8vw,12px)] py-[clamp(3px,0.5vw,8px)]"
    const fluidGapStyle: React.CSSProperties = { gap: 'clamp(2px, 0.6vw, 8px)' }

    const renderLinks = () => (
        <>
            {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href
                const activeClass = isActive ? 'btn-primary' : 'btn-ghost'
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`btn ${activeClass} ${fluidPaddingClass} flex items-center whitespace-nowrap`}
                        style={fluidGapStyle}
                    >
                        <Icon style={fluidIconStyle} />
                        <span className={fluidTextClass}>{label}</span>
                    </Link>
                )
            })}
        </>
    )

    return (
        <div className='border-b border-base-300 px-5 md:px-[5%] py-4 relative'>
            <div className='flex justify-between items-center'>
                <div className='flex items-center shrink-0 whitespace-nowrap'>
                    <div className="p-2">
                        <PackagePlus className="w-6 h-6 text-primary" />
                    </div>
                    <span className='font-bold text-xl whitespace-nowrap'>
                        gestion stock carte
                    </span>
                </div>

                <button className='btn w-fit md:hidden btn-sm'
                    onClick={() => setMenuOpen(!menuOpen)}>
                    <Menu className='w-4 h-4' />
                </button>

                <div className='hidden md:flex items-center min-w-0' style={fluidGapStyle}>
                    {renderLinks()}
                    
                    <button
                        onClick={handleOpenStock}
                        title="Alimenter le stock"
                        className={`btn btn-ghost ${fluidPaddingClass} flex items-center`}
                    >
                        
                        <Warehouse style={fluidIconStyle} />
                    </button>

                    <Link
                        href="/basket"
                        className={`btn btn-ghost ${fluidPaddingClass} relative flex items-center`}
                    >
                        <ShoppingCart style={fluidIconStyle} />
                        {basketCount > 0 && (
                            <span className="badge badge-primary badge-xs absolute -top-1 -right-1">{basketCount}</span>
                        )}
                    </Link>

                    <div className="relative">
                        <button
                            className={`btn btn-ghost ${fluidPaddingClass}`}
                            onClick={handleOpenNotifications}
                        >
                            <Bell style={fluidIconStyle} />
                            {unreadCount > 0 && (
                                <span className="badge badge-error badge-xs absolute -top-1 -right-1">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-base-100 border-2 border-base-200 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-sm text-base-content/70">Aucune notification</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="p-3 border-b border-base-200 text-sm">
                                            {n.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center shrink-0">
                        <Show when="signed-out">
                            <SignUpButton mode="modal">
                                <button className="btn btn-primary btn-sm ml-2 whitespace-nowrap">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </Show>
                        <Show when="signed-in">
                            <UserButton />
                        </Show>
                    </div>
                </div>
            </div>

            <div className={`absolute top-0 w-full bg-base-100 h-screen flex flex-col gap-2 p-4
        transition-all duration-300 md:hidden z-50 ${menuOpen ? "left-0" : "-left-full"} `}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Show when="signed-out">
                            <SignInButton mode="modal">
                                <button className="btn btn-primary btn-sm">Sign In</button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="btn btn-primary btn-sm ml-2">Sign Up</button>
                            </SignUpButton>
                        </Show>
                        <Show when="signed-in">
                            <UserButton />
                        </Show>
                    </div>
                    <button className='btn w-fit md:hidden btn-sm'
                        onClick={() => setMenuOpen(!menuOpen)}>
                        <X className='w-4 h-4' />
                    </button>
                </div>

                {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    const activeClass = isActive ? 'btn-primary' : 'btn-ghost'
                    return (
                        <Link key={href} href={href} className={`btn ${activeClass} btn-sm flex gap-2 items-center`}>
                            <Icon className='w-4 h-4' />
                            {label}
                        </Link>
                    )
                })}

                <button onClick={handleOpenStock} className="btn btn-ghost btn-sm flex gap-2 items-center">
                    <Warehouse className="w-4 h-4" />
                    Alimenter le stock
                </button>

                <Link href="/basket" className="btn btn-ghost btn-sm flex gap-2 items-center">
                    <ShoppingCart className="w-4 h-4" />
                    Panier {basketCount > 0 && `(${basketCount})`}
                </Link>

                <button className="btn btn-ghost btn-sm flex gap-2 items-center" onClick={handleOpenNotifications}>
                    <Bell className="w-4 h-4" />
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                </button>
            </div>

            <Stock />
        </div>
    )
}

export default NavBar