import type React from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNav } from "@/components/top-nav"
import { MobileNav } from "@/components/mobile-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Redirect unauthenticated users to the landing page.
  // Auth.js v5 is a stub in dev — once wired up this gate is enforced for real.
  if (session !== null && !session?.user) {
    redirect("/")
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
