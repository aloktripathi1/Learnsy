"use client"

import { useUser, useClerk } from "@clerk/nextjs"

// Helper hook for compatibility with existing code
export function useAuth() {
  const { user, isLoaded } = useUser()
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
    signIn: handleSignIn,
    signInWithGoogle: handleSignIn,
    signOut: () => signOut(),
    error: null,
  }
}
