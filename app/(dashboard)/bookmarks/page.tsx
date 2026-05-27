"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bookmark, Search, Play, Trash2, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getBookmarksAction, updateProgressAction } from "@/app/actions/courses"
import { toast } from "sonner"

interface BookmarkItem {
  id: string
  video_id: string
  notes: string
  updated_at: string
  videos: {
    id: string
    video_id: string
    title: string
    thumbnail: string
    duration: string
    courses: {
      id: string
      title: string
    }
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function BookmarkSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
      <div className="skeleton w-16 h-12 rounded flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </div>
      <div className="flex gap-1 shrink-0">
        <div className="skeleton h-7 w-14 rounded" />
        <div className="skeleton h-7 w-7 rounded" />
      </div>
    </div>
  )
}

export default function BookmarksPage() {
  
  const { user } = useAuth()
  const router = useRouter()

  const [bookmarks, setBookmarks]     = useState<BookmarkItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)

  const loadBookmarks = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      const data = await getBookmarksAction()
      const valid = (data ?? [])
        .filter((b) => b.bookmarked === true && b.videos)
        .map((b) => ({
          ...b,
          videos: Array.isArray(b.videos) ? b.videos[0] : b.videos,
        })) as BookmarkItem[]
      setBookmarks(valid)
    } catch {
      setError("Couldn't load bookmarks.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadBookmarks()
  }, [user?.id, loadBookmarks])

  useEffect(() => {
    const handler = () => loadBookmarks()
    window.addEventListener("bookmarksUpdated", handler)
    return () => window.removeEventListener("bookmarksUpdated", handler)
  }, [loadBookmarks])

  const removeBookmark = async (bookmark: BookmarkItem) => {
    // Optimistic remove
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id))
    try {
      await updateProgressAction({ video_id: bookmark.video_id, bookmarked: false })
      window.dispatchEvent(new CustomEvent("bookmarksUpdated"))
      toast.success("Bookmark removed")
    } catch {
      setBookmarks((prev) => [...prev, bookmark])
      toast.error("Couldn't remove bookmark.")
    }
  }

  const watchVideo = (bookmark: BookmarkItem) => {
    router.push(`/study/${bookmark.videos.courses.id}/${bookmark.video_id}`)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const filtered = searchQuery.trim()
    ? bookmarks.filter(
        (b) =>
          b.videos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.videos.courses.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : bookmarks

  const grouped = filtered.reduce<Record<string, BookmarkItem[]>>((acc, b) => {
    if (!b.videos?.courses) return acc
    const key = b.videos.courses.title ?? "Unknown Course"
    acc[key] = acc[key] ?? []
    acc[key].push(b)
    return acc
  }, {})

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full space-y-6 p-4 md:p-8 pb-24 md:pb-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Bookmarks</h1>
        <p className="text-[#a1a1aa] text-sm mt-1">
          Your saved videos for quick access
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
        <Input
          placeholder="Search bookmarks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-[#52525b] focus:border-indigo-500/50 text-sm"
        />
      </div>

      {/* Count */}
      {!loading && !error && (
        <p className="text-xs text-[#52525b]">
          {filtered.length} bookmark{filtered.length !== 1 ? "s" : ""} ·{" "}
          {Object.keys(grouped).length} course
          {Object.keys(grouped).length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/30 border border-red-900/40">
          <span className="text-sm text-red-400">{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadBookmarks}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 px-2 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookmarkSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-12 h-12 text-[#2a2a2a] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <p className="text-[#52525b] text-sm mb-4">
            {bookmarks.length === 0
              ? "No bookmarks yet. Bookmark videos while studying to find them here."
              : "No bookmarks match your search."}
          </p>
          {bookmarks.length === 0 && (
            <Button
              onClick={() => router.push("/courses")}
              className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
            >
              Browse Courses
            </Button>
          )}
        </div>
      )}

      {/* Grouped list */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([courseTitle, courseBookmarks]) => (
            <div key={courseTitle}>
              <h2 className="text-xs font-semibold text-[#52525b] uppercase tracking-wider mb-3">
                {courseTitle}
              </h2>
              <div className="space-y-2">
                {courseBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-start gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg hover:border-[#2a2a2a] transition-colors duration-150"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        bookmark.videos.thumbnail ||
                        "/placeholder.svg?height=48&width=64"
                      }
                      alt={bookmark.videos.title}
                      className="w-16 h-12 object-cover rounded flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-sm font-medium text-white line-clamp-2 leading-snug">
                        {bookmark.videos.title}
                      </p>
                      <p className="text-xs text-[#52525b] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(bookmark.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        size="sm"
                        onClick={() => watchVideo(bookmark)}
                        className="h-7 px-2.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Watch
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBookmark(bookmark)}
                        className="h-7 w-7 text-[#52525b] hover:text-red-400 hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
