"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BookOpen, Bookmark, LayoutDashboard, StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { title: "Courses",    href: "/courses",     icon: BookOpen },
  { title: "Bookmarks",  href: "/bookmarks",   icon: Bookmark },
  { title: "Notes",      href: "/notes",       icon: StickyNote },
]

export function MobileNav() {
  const pathname = usePathname()

  // Don't show on study pages — too distracting
  if (pathname.startsWith("/study/")) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 px-2 bg-black/95 backdrop-blur-md border-t border-[#1a1a1a]">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full rounded-lg gap-1 transition-colors duration-150",
              isActive ? "text-indigo-400" : "text-[#52525b] hover:text-[#a1a1aa]",
            )}
          >
            <item.icon
              className={cn("h-5 w-5", isActive && "stroke-[2.5px]")}
            />
            <span className="text-[10px] font-medium">{item.title}</span>
          </Link>
        )
      })}
    </div>
  )
}
