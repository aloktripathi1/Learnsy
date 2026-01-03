"use client"

import { useUser, useClerk } from "@clerk/nextjs"

// Helper hook for compatibility with existing code
export function useAuth() {
  const { user, isLoaded } = useUser()
  const { signOut, openSignIn } = useClerk()

  return {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          user_metadata: {
            full_name: user.fullName || "",
            avatar_url: user.imageUrl || "",
          },
        }
      : null,
    loading: !isLoaded,
    signIn: () => openSignIn(),
    signInWithGoogle: () => openSignIn(),
    signOut: () => signOut(),
    error: null,
  }
}
