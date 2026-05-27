"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useMemo } from "react"

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser()
  const clerk = useClerk()

  const handleSignIn = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`
    await clerk.redirectToSignIn({ redirectUrl })
  }

  const user = useMemo(() => {
    return clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          name: clerkUser.fullName || clerkUser.firstName || "",
          image: clerkUser.imageUrl || "",
          user_metadata: {
            full_name: clerkUser.fullName || "",
            avatar_url: clerkUser.imageUrl || "",
          },
        }
      : null
  }, [clerkUser?.id, clerkUser?.primaryEmailAddress?.emailAddress, clerkUser?.fullName, clerkUser?.firstName, clerkUser?.imageUrl])

  return {
    user,
    loading: !isLoaded,
    signIn: handleSignIn,
    signInWithGoogle: handleSignIn,
    signOut: () => clerk.signOut(),
    error: null,
  }
}
