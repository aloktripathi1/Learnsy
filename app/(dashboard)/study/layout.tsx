"use client"

import type React from "react"

// Study page layout - hides global sidebar for Watch Mode
export default function StudyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* No sidebar in Watch Mode - video is the focus */}
      {children}
    </div>
  )
}
