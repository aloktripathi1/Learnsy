"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Bookmark,
  LayoutDashboard,
  StickyNote,
  LogOut,
  User,
  Menu,
  X,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navigation = [
  { title: "Dashboard",  url: "/dashboard",  icon: LayoutDashboard },
  { title: "My Courses", url: "/courses",     icon: BookOpen },
  { title: "Bookmarks",  url: "/bookmarks",   icon: Bookmark },
  { title: "Notes",      url: "/notes",       icon: StickyNote },
]

export function AppSidebar() {
  const pathname   = usePathname()
  const { user, signOut } = useAuth()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        className="hidden md:flex border-r border-[#1a1a1a] bg-[#0a0a0a]"
      >
        {/* ── Header / Logo ─────────────────────────────────────── */}
        <SidebarHeader className="border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between px-3 py-3">
            {!isCollapsed && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
                  <Zap className="h-4 w-4 text-white" fill="white" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  Learnsy
                </span>
              </Link>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 text-[#a1a1aa] hover:text-white hover:bg-white/5"
                >
                  {isCollapsed ? (
                    <Menu className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </SidebarHeader>

        {/* ── Nav items ─────────────────────────────────────────── */}
        <SidebarContent className="px-2 py-2">
          <SidebarMenu className="gap-0.5">
            {navigation.map((item) => {
              const isActive =
                pathname === item.url ||
                (item.url !== "/dashboard" && pathname.startsWith(item.url))

              const button = (
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "h-10 w-full rounded-lg px-3 gap-3 transition-colors duration-150",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/15"
                      : "text-[#a1a1aa] hover:text-white hover:bg-white/5",
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              )

              return (
                <SidebarMenuItem key={item.title}>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    button
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* ── Footer / User ─────────────────────────────────────── */}
        <SidebarFooter className="border-t border-[#1a1a1a] p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className={cn(
                          "h-auto rounded-lg px-2 py-2 gap-3 w-full",
                          "text-[#a1a1aa] hover:text-white hover:bg-white/5 transition-colors duration-150",
                        )}
                      >
                        <Avatar className="h-8 w-8 rounded-lg shrink-0">
                          <AvatarImage
                            src={user?.image ?? undefined}
                            alt={user?.name ?? "User"}
                          />
                          <AvatarFallback className="rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-semibold">
                            {user?.name
                              ? user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                              : <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                          <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                            <span className="truncate font-semibold text-white text-xs">
                              {user?.name ?? "User"}
                            </span>
                            <span className="truncate text-[10px] text-[#52525b]">
                              {user?.email ?? ""}
                            </span>
                          </div>
                        )}
                        {!isCollapsed && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#a1a1aa] shrink-0">
                            Free
                          </span>
                        )}
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      {user?.name ?? "User"}
                    </TooltipContent>
                  )}
                </Tooltip>

                <DropdownMenuContent
                  className="w-56 bg-[#0a0a0a] border-[#1a1a1a]"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.name ?? "User"}
                    </p>
                    <p className="text-xs text-[#52525b] truncate">
                      {user?.email ?? ""}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-[#1a1a1a]" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-[#a1a1aa] hover:text-white focus:text-white focus:bg-white/5 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}
