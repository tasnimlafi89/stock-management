"use client"
import { useAuth, RedirectToSignIn } from "@clerk/nextjs"
import React from "react"

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth()

    if (!isLoaded) {
        return (
            <div className="flex justify-center items-center min-h-screen w-full">
                <span className="loading loading-ring loading-xl " style={{ height:'3em' , width:'3em' }}></span>
            </div>
        )
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />
    }

    return <>{children}</>
}