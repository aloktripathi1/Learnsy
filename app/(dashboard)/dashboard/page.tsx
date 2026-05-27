"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Bookmark,
  Play,
  TrendingUp,
  Target,
  Plus,
  Trash2,
  MoreHorizontal,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
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
import { StreakCalendar } from "@/components/streak-calendar"
import { DailyReminder } from "@/components/daily-reminder"
import { ImportPlaylistModal } from "@/components/import-playlist-modal"
import { useAuth } from "@/lib/auth"
import { checkPlaylistLimit } from "@/app/actions/youtube"
import type { Course, StreakActivity } from "@/types"
import { MAX_PLAYLISTS_FREE } from "@/lib/config"
import { toast } from "sonner"

interface PlaylistLimit {
  canImport: boolean
  currentCount: number
  maxCount: number
  remaining: number
}

interface Stats {
  watchedVideos: number
  activeStreak: number
  totalCourses: number
  bookmarkedVideos: number
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: number | string
  sub: string
  icon: React.ElementType
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors duration-150">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#a1a1aa] font-medium uppercase tracking-wider">
          {label}
        </span>
        <Icon className="h-4 w-4 text-[#52525b]" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <p className="text-xs text-[#52525b]">{sub}</p>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
      </div>
      <div className="skeleton h-7 w-12 rounded mb-1" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  )
}

function CourseRowSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a]">
      <div className="skeleton w-16 h-12 rounded flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-1.5 w-full rounded" />
        <div className="skeleton h-3 w-1/4 rounded" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  
  const { user } = useAuth()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playlistLimit, setPlaylistLimit] = useState<PlaylistLimit>({
    canImport: true,
    currentCount: 0,
    maxCount: MAX_PLAYLISTS_FREE,
    remaining: MAX_PLAYLISTS_FREE,
  })
  const [stats, setStats] = useState<Stats>({
    watchedVideos: 0,
    activeStreak: 0,
    totalCourses: 0,
    bookmarkedVideos: 0,
  })
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  const calculateStreak = useCallback(async (): Promise<number> => {
    try {
      const { getStreakActivityAction } = await import("@/app/actions/courses")
      const streakData: StreakActivity[] = await getStreakActivityAction()
      if (streakData.length === 0) return 0

      const sorted = [...streakData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

      const hasRecent = sorted.some(
        (s) => s.date === today || s.date === yesterday,
      )
      if (!hasRecent) return 0

      let streak = 0
      const cur = new Date()
      for (let i = 0; i < 365; i++) {
        const ds = cur.toISOString().split("T")[0]
        const has = sorted.some((s) => s.date === ds)
        if (has) {
          streak++
          cur.setDate(cur.getDate() - 1)
        } else {
          if (ds === today) { cur.setDate(cur.getDate() - 1); continue }
          break
        }
      }
      return streak
    } catch {
      return 0
    }
  }, [])

  const loadData = useCallback(async () => {
    if (!user) return
    setError(null)

    try {
      const { getCoursesAction, getBookmarksAction, getUserProgressAction } =
        await import("@/app/actions/courses")

      const [coursesData, bookmarks, progress, limitCheck] = await Promise.all([
        getCoursesAction(),
        getBookmarksAction(),
        getUserProgressAction(),
        checkPlaylistLimit(user.id ?? undefined),
      ])

      const safeCoursesData = coursesData ?? []
      setCourses(safeCoursesData)

      const currentCount = safeCoursesData.length
      const maxCount = limitCheck?.maxCount ?? MAX_PLAYLISTS_FREE
      const remaining = Math.max(0, maxCount - currentCount)

      setPlaylistLimit({
        canImport: currentCount < maxCount,
        currentCount,
        maxCount,
        remaining,
      })

      const watchedCount = progress?.filter((p) => p.completed === true).length ?? 0
      const streakCount = await calculateStreak()

      setStats({
        watchedVideos: watchedCount,
        activeStreak: streakCount,
        totalCourses: currentCount,
        bookmarkedVideos: bookmarks?.length ?? 0,
      })
    } catch (err) {
      setError("Couldn't load dashboard data.")
      setStats({ watchedVideos: 0, activeStreak: 0, totalCourses: 0, bookmarkedVideos: 0 })
    } finally {
      setLoading(false)
    }
  }, [user, calculateStreak])

  useEffect(() => {
    if (user) loadData()
  }, [user?.id, loadData])

  useEffect(() => {
    const refresh = () => loadData()
    window.addEventListener("notesUpdated",    refresh)
    window.addEventListener("bookmarksUpdated", refresh)
    window.addEventListener("progressUpdated",  refresh)
    window.addEventListener("coursesUpdated",   refresh)
    return () => {
      window.removeEventListener("notesUpdated",    refresh)
      window.removeEventListener("bookmarksUpdated", refresh)
      window.removeEventListener("progressUpdated",  refresh)
      window.removeEventListener("coursesUpdated",   refresh)
    }
  }, [loadData])

  const resumeCourse = async (course: Course) => {
    try {
      const { getVideosAction, getUserProgressAction } = await import("@/app/actions/courses")
      const [videos, progress] = await Promise.all([
        getVideosAction(course.id),
        getUserProgressAction(),
      ])
      const nextVideo = videos.find((v) => {
        const vp = progress.find((p) => p.video_id === v.video_id)
        return !vp?.completed
      })
      const target = nextVideo ?? videos[0]
      if (target) router.push(`/study/${course.id}/${target.video_id}`)
    } catch {
      toast.error("Couldn't open course. Please try again.")
    }
  }

  const deleteCourse = async (course: Course) => {
    if (!user) return
    setDeletingCourseId(course.id)
    try {
      const { deleteCourseAction } = await import("@/app/actions/courses")
      await deleteCourseAction(course.id)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      await loadData()
      setCourseToDelete(null)
      toast.success("Course deleted")
    } catch {
      toast.error("Failed to delete course. Please try again.")
    } finally {
      setDeletingCourseId(null)
    }
  }

  const firstName = user?.name?.split(" ")[0] ?? "Learner"

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full space-y-6 p-4 md:p-8 pb-24 md:pb-8">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-[#a1a1aa] text-sm mt-1">
          Ready to continue your learning journey?
        </p>
      </div>

      {/* Daily reminder */}
      <DailyReminder courses={courses} stats={stats} />

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/30 border border-red-900/40">
          <span className="text-sm text-red-400">{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadData}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 px-2 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Videos"
              value={stats.watchedVideos}
              sub="Watched"
              icon={Play}
            />
            <StatCard
              label="Streak"
              value={stats.activeStreak}
              sub={stats.activeStreak > 0 ? "days in a row" : "Start today!"}
              icon={Flame}
            />
            <StatCard
              label="Courses"
              value={stats.totalCourses}
              sub={`${playlistLimit.remaining} slot${playlistLimit.remaining !== 1 ? "s" : ""} remaining`}
              icon={BookOpen}
            />
            <StatCard
              label="Bookmarks"
              value={stats.bookmarkedVideos}
              sub="Saved videos"
              icon={Bookmark}
            />
          </>
        )}
      </div>

      {/* Streak heatmap */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 md:p-6">
        <h2 className="text-sm font-semibold text-white mb-1">Learning Activity</h2>
        <p className="text-xs text-[#52525b] mb-4">Your daily study streak this year</p>
        <StreakCalendar />
      </div>

      {/* Import CTA */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Import Course</h2>
            <p className="text-xs text-[#52525b] mt-0.5">
              Add a YouTube playlist ({playlistLimit.currentCount}/{playlistLimit.maxCount} used)
            </p>
          </div>
        </div>

        <ImportPlaylistModal
          onSuccess={loadData}
          playlistLimit={playlistLimit}
          trigger={
            <Button
              className="w-full h-10 bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors duration-150"
              disabled={!playlistLimit.canImport}
            >
              <Plus className="h-4 w-4 mr-2" />
              {playlistLimit.canImport ? "Import Playlist" : "Limit Reached"}
            </Button>
          }
        />

        {/* Limit indicator */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[#52525b]">
            {playlistLimit.currentCount} of {playlistLimit.maxCount} playlists used
          </span>
          <span
            className={
              playlistLimit.canImport ? "text-emerald-500" : "text-amber-500"
            }
          >
            {playlistLimit.remaining} remaining
          </span>
        </div>
        <div className="mt-2 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{
              width: `${(playlistLimit.currentCount / playlistLimit.maxCount) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Your courses */}
      {(loading || courses.length > 0) && (
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Your Courses</h2>
              <p className="text-xs text-[#52525b] mt-0.5">
                Continue where you left off
              </p>
            </div>
            {courses.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/courses")}
                className="text-xs text-[#a1a1aa] hover:text-white h-7 px-2"
              >
                View all
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <CourseRowSkeleton key={i} />
              ))
            ) : (
              courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="flex gap-3 p-3 rounded-lg bg-black border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-150"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnail ?? "/placeholder.svg?height=48&width=80"}
                    alt={course.title}
                    className="w-16 h-12 object-cover rounded flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="text-sm font-medium text-white line-clamp-1 leading-tight">
                      {course.title}
                    </h3>
                    <Progress value={0} className="h-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#52525b]">0% complete</span>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => resumeCourse(course)}
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Continue
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#52525b] hover:text-white hover:bg-white/5"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#0a0a0a] border-[#1a1a1a]"
                          >
                            <DropdownMenuItem
                              onClick={() => setCourseToDelete(course)}
                              className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Empty state — no courses at all */}
      {!loading && courses.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
            No courses yet. Import your first YouTube playlist to get started.
          </p>
          <ImportPlaylistModal
            onSuccess={loadData}
            playlistLimit={playlistLimit}
            trigger={
              <Button className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Import Playlist
              </Button>
            }
          />
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={() => setCourseToDelete(null)}
      >
        <AlertDialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Course</AlertDialogTitle>
            <AlertDialogDescription className="text-[#a1a1aa]">
              Are you sure you want to delete &ldquo;{courseToDelete?.title}&rdquo;?
              This will permanently remove the course and all your progress,
              bookmarks, and notes.
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
