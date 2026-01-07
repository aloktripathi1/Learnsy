"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useMemo } from "react"

// Helper hook for compatibility with existing code
export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut, openSignIn, redirectToSignIn } = useClerk()

  const handleSignIn = async () => {
    try {
      // Redirect to Clerk's sign-in page
      await redirectToSignIn({
        redirectUrl: '/dashboard',
      })
    } catch (error) {
      console.error("Sign-in error:", error)
      throw error
    }
  }

  const user = useMemo(() => {
    return clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          user_metadata: {
            full_name: clerkUser.fullName || "",
            avatar_url: clerkUser.imageUrl || "",
          },
        }
      : null
  }, [clerkUser?.id, clerkUser?.primaryEmailAddress?.emailAddress, clerkUser?.fullName, clerkUser?.imageUrl])

  return {
    user,
    loading: !isLoaded,
    signIn: handleSignIn,
    signInWithGoogle: handleSignIn,
    signOut: () => signOut(),
    error: null,
  }
}
