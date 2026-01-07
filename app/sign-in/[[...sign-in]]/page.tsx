"use client"

import { useEffect } from "react"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const { signIn, isLoaded } = useSignIn()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    // Automatically redirect to Google OAuth
    const signInWithGoogle = async () => {
      try {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/dashboard",
          redirectUrlComplete: "/dashboard",
        })
      } catch (error) {
        console.error("Sign-in error:", error)
        // If auto-redirect fails, redirect to Clerk's sign-in page as fallback
        router.push("/sign-in")
      }
    }

    signInWithGoogle()
  }, [isLoaded, signIn, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting to Google...</p>
      </div>
    </div>
  )
}
