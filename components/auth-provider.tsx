"use client"

// Auth is provided by <ClerkProvider> in app/layout.tsx.
// This file is kept as a no-op for any remaining imports.
import type React from "react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
