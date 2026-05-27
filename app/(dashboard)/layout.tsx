"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { TopNav } from "@/components/top-nav"
import { useAuth } from "@/lib/auth"
import { ensureUserAction } from "@/app/actions/user"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/")
      } else {
        ensureUserAction().then(() => setIsReady(true))
      }
    }
  }, [user, loading, router])

  if (loading || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-black">
        <TopNav />
        <main className="flex-1 overflow-auto">{children}</main>
        <MobileNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
