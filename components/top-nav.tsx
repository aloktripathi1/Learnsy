"use client"

import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { useEffect, useState } from "react"
import { getStreakActivityAction } from "@/app/actions/courses"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/courses":    "My Courses",
  "/bookmarks":  "Bookmarks",
  "/notes":      "Notes",
}

function getPageTitle(pathname: string): string {
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + "/")) return title
  }
  if (pathname.startsWith("/study/")) return "Study"
  return "Learnsy"
}

export function TopNav() {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!user) return
    getStreakActivityAction()
      .then((activities) => {
        if (activities.length === 0) return
        const sorted = [...activities].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        const today = new Date().toISOString().split("T")[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
        const hasRecent = sorted.some(
          (s) => s.date === today || s.date === yesterday,
        )
        if (!hasRecent) return

        let count = 0
        const cur = new Date()
        for (let i = 0; i < 365; i++) {
          const ds = cur.toISOString().split("T")[0]
          const has = sorted.some((s) => s.date === ds)
          if (has) {
            count++
            cur.setDate(cur.getDate() - 1)
          } else {
            if (ds === today) { cur.setDate(cur.getDate() - 1); continue }
            break
          }
        }
        setStreak(count)
      })
      .catch(() => {})
  }, [user])

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-[#1a1a1a] bg-black/95 backdrop-blur-sm px-4 md:px-6 shrink-0">
      {/* Hamburger — sidebar toggle on desktop, drawer on mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-white/5 md:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Page title */}
      <h2 className="text-sm font-semibold text-white flex-1">
        {getPageTitle(pathname)}
      </h2>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold text-white">{streak}</span>
          </div>
        )}
      </div>
    </header>
  )
}
