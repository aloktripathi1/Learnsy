"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Play,
  Search,
  CheckCircle,
  Trash2,
  MoreHorizontal,
  Plus,
  Clock,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import {
  getCoursesAction,
  getVideosAction,
  getUserProgressAction,
  deleteCourseAction,
} from "@/app/actions/courses"
import { checkPlaylistLimit } from "@/app/actions/youtube"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ImportPlaylistModal } from "@/components/import-playlist-modal"
import type { Course, UserProgress, Video } from "@/types"
import { MAX_PLAYLISTS_FREE } from "@/lib/config"
import { toast } from "sonner"

interface PlaylistLimit {
  canImport: boolean
  currentCount: number
  maxCount: number
  remaining: number
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
      <div className="skeleton aspect-video w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-1 w-full rounded" />
        <div className="skeleton h-9 w-full rounded" />
      </div>
    </div>
  )
}

// ── CourseCard ────────────────────────────────────────────────────────────────
function CourseCard({
  course,
  progress,
  onContinue,
  onDelete,
}: {
  course: Course
  progress: UserProgress[]
  onContinue: (course: Course) => void
  onDelete: (course: Course) => void
}) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)

  useEffect(() => {
    let mounted = true
    getVideosAction(course.id)
      .then((vids) => { if (mounted) setVideos(vids) })
      .catch(() => {})
      .finally(() => { if (mounted) setLoadingVideos(false) })
    return () => { mounted = false }
  }, [course.id])

  // Re-derive completed count when progress prop updates
  const getVid = (p: UserProgress) => p.video_id ?? p.videoId
  const completedCount = videos.filter((v) =>
    progress.some((p) => getVid(p) === (v.video_id ?? v.youtubeId) && p.completed),
  ).length

  const videoCount = (course as Course & { video_count?: number }).video_count ?? videos.length
  const progressPercent = videoCount > 0 ? (completedCount / videoCount) * 100 : 0

  const formatDate = (d: string | Date) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  return (
    <div className="group bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#2a2a2a] transition-all duration-150 hover:scale-[1.01]">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            (course as Course & { thumbnail?: string | null }).thumbnail ??
            "/placeholder.svg?height=180&width=320"
          }
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
        {/* Badge */}
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-sm">
            {videoCount} videos
          </span>
        </div>
        {/* Menu */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="bg-[#0a0a0a] border-[#1a1a1a]"
            >
              <DropdownMenuItem
                onClick={() => onDelete(course)}
                className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-white text-sm line-clamp-2 leading-snug mb-1">
            {course.title}
          </h3>
          <p className="text-xs text-[#52525b] flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Added{" "}
            {formatDate(
              (course as Course & { created_at?: string | Date }).created_at ??
                new Date(),
            )}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-[#52525b]">Progress</span>
            {loadingVideos ? (
              <span className="text-[#52525b]">Loading…</span>
            ) : (
              <span className="text-[#a1a1aa]">
                {completedCount}/{videoCount}
              </span>
            )}
          </div>
          <Progress value={progressPercent} className="h-1" />
        </div>

        {/* Action */}
        <div className="flex gap-2">
          <Button
            onClick={() => onContinue(course)}
            className="flex-1 h-8 text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-medium"
            disabled={loadingVideos}
          >
            {progressPercent === 0 ? (
              <>
                <Play className="h-3 w-3 mr-1.5" />
                Start
              </>
            ) : progressPercent === 100 ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1.5 text-emerald-400" />
                Review
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1.5" />
                Continue
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  
  const { user } = useAuth()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressData, setProgressData] = useState<UserProgress[]>([])
  const [playlistLimit, setPlaylistLimit] = useState<PlaylistLimit>({
    canImport: true,
    currentCount: 0,
    maxCount: MAX_PLAYLISTS_FREE,
    remaining: MAX_PLAYLISTS_FREE,
  })
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  const filteredCourses = searchQuery.trim()
    ? courses.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : courses

  const loadCourses = useCallback(async () => {
    if (!user) return
    setError(null)

    try {
      setLoading(true)
      const [coursesData, progress] = await Promise.all([
        getCoursesAction(),
        getUserProgressAction(),
      ])

      const safe = coursesData ?? []
      setCourses(safe)
      setProgressData(progress ?? [])

      const currentCount = safe.length
      const maxCount = MAX_PLAYLISTS_FREE
      const remaining = Math.max(0, maxCount - currentCount)

      setPlaylistLimit({
        canImport: currentCount < maxCount,
        currentCount,
        maxCount,
        remaining,
      })
    } catch {
      setError("Couldn't load courses.")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadCourses()
  }, [user?.id, loadCourses])

  useEffect(() => {
    const handler = () => loadCourses()
    window.addEventListener("coursesUpdated", handler)
    return () => window.removeEventListener("coursesUpdated", handler)
  }, [loadCourses])

  useEffect(() => {
    const handler = async () => {
      if (!user) return
      try {
        const progress = await getUserProgressAction()
        setProgressData(progress ?? [])
      } catch {}
    }
    window.addEventListener("progressUpdated", handler)
    return () => window.removeEventListener("progressUpdated", handler)
  }, [user])

  const continueCourse = useCallback(
    async (course: Course) => {
      try {
        const [videos, progress] = await Promise.all([
          getVideosAction(course.id),
          getUserProgressAction(),
        ])
        if (!videos?.length) {
          toast.error("No videos found. Try reimporting the playlist.")
          return
        }
        const nextVideo = videos.find((v) => {
          const vp = progress.find((p) => p.video_id === v.video_id)
          return !vp?.completed
        })
        const target = nextVideo ?? videos[0]
        router.push(`/study/${course.id}/${target.video_id}`)
      } catch {
        toast.error("Couldn't open course. Please try again.")
      }
    },
    [router],
  )

  const deleteCourse = async (course: Course) => {
    if (!user) return
    setDeletingCourseId(course.id)
    try {
      await deleteCourseAction(course.id)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      const limitCheck = await checkPlaylistLimit(user.id ?? undefined)
      setPlaylistLimit(limitCheck)
      setCourseToDelete(null)
      toast.success("Course deleted")
    } catch {
      toast.error("Failed to delete course. Please try again.")
    } finally {
      setDeletingCourseId(null)
    }
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full space-y-6 p-4 md:p-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Courses
          </h1>
          <p className="text-[#a1a1aa] text-sm mt-1">
            {playlistLimit.currentCount}/{playlistLimit.maxCount} playlists used
          </p>
        </div>
        <ImportPlaylistModal
          onSuccess={loadCourses}
          playlistLimit={playlistLimit}
          trigger={
            <Button className="shrink-0 h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Import
            </Button>
          }
        />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
        <Input
          placeholder="Search courses…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-[#52525b] focus:border-indigo-500/50 text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/30 border border-red-900/40">
          <span className="text-sm text-red-400">{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadCourses}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 px-2 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="responsive-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <p className="text-[#52525b] text-sm mb-4">
            {courses.length === 0
              ? "No courses yet. Import your first YouTube playlist."
              : "No courses match your search."}
          </p>
          {courses.length === 0 && playlistLimit.canImport && (
            <ImportPlaylistModal
              onSuccess={loadCourses}
              playlistLimit={playlistLimit}
              trigger={
                <Button className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Import Playlist
                </Button>
              }
            />
          )}
          {courses.length === 0 && !playlistLimit.canImport && (
            <p className="text-xs text-amber-500">
              You&rsquo;ve reached the {playlistLimit.maxCount}-playlist limit.
              Delete a course to import a new one.
            </p>
          )}
        </div>
      ) : (
        <div className="responsive-grid">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={progressData}
              onContinue={continueCourse}
              onDelete={(c) => setCourseToDelete(c)}
            />
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <AlertDialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Course
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#a1a1aa]">
              Are you sure you want to delete &ldquo;{courseToDelete?.title}
              &rdquo;? This permanently removes the course and all your
              progress, bookmarks, and notes.
              {!playlistLimit.canImport && (
                <span className="block mt-2 text-xs text-emerald-500">
                  Deleting will free up a slot for a new playlist.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2a2a2a] text-[#a1a1aa] hover:text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => courseToDelete && deleteCourse(courseToDelete)}
              disabled={deletingCourseId === courseToDelete?.id}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingCourseId === courseToDelete?.id ? (
                <span className="flex items-center gap-2">
                  <span className="loading-spinner h-3.5 w-3.5" />
                  Deleting…
                </span>
              ) : (
                "Delete Course"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
