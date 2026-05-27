"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle,
  Circle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  List,
  X,
  Save,
  PlayCircle,
  ArrowLeft,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { YouTubePlayer } from "@/components/youtube-player"
import {
  getCoursesAction,
  getVideosAction,
  getUserProgressAction,
  updateProgressAction,
  updateStreakActivityAction,
  saveVideoTimestampAction,
  getVideoTimestampAction,
} from "@/app/actions/courses"
import type { Course, Video, UserProgress } from "@/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { AUTO_COMPLETE_THRESHOLD } from "@/lib/config"

// ── Skeleton ──────────────────────────────────────────────────────────────────
function StudySkeleton() {
  return (
    <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden">
      <div className="flex-1 flex flex-col">
        <div className="skeleton aspect-video w-full bg-[#0a0a0a]" />
        <div className="p-4 lg:p-6 space-y-4">
          <div className="skeleton h-7 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="flex gap-2">
            <div className="skeleton h-9 w-28 rounded" />
            <div className="skeleton h-9 w-28 rounded" />
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-72 border-l border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="skeleton w-16 h-10 rounded flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-2/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Playlist item ─────────────────────────────────────────────────────────────
function PlaylistItem({
  video,
  index,
  isActive,
  isCompleted,
  onClick,
}: {
  video: Video & { video_id: string }
  index: number
  isActive: boolean
  isCompleted: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex gap-3 p-3 rounded-lg transition-colors duration-150",
        "hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
        isActive && "bg-indigo-500/10 border-l-2 border-indigo-500",
        !isActive && "border-l-2 border-transparent",
      )}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-[60px] h-[45px] rounded overflow-hidden bg-[#1a1a1a]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            (video as Video & { thumbnail?: string | null }).thumbnail ??
            `/api/placeholder/60/45`
          }
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isCompleted && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
        )}
        {isActive && !isCompleted && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <PlayCircle className="h-4 w-4 text-indigo-400" />
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs line-clamp-2 leading-snug",
            isActive ? "text-white font-medium" : isCompleted ? "text-[#52525b]" : "text-[#a1a1aa]",
          )}
        >
          {index + 1}. {video.title}
        </p>
        {video.duration != null && video.duration > 0 && (
          <p className="text-[10px] text-[#52525b] mt-1">
            {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
          </p>
        )}
      </div>
    </button>
  )
}

// ── Playlist sidebar ───────────────────────────────────────────────────────────
function PlaylistSidebar({
  videos,
  progress,
  currentVideoId,
  onVideoClick,
}: {
  videos: (Video & { video_id: string })[]
  progress: UserProgress[]
  currentVideoId: string
  onVideoClick: (video: Video & { video_id: string }) => void
}) {
  const getVid = (p: UserProgress) => p.video_id ?? p.videoId
  const completedCount = videos.filter((v) =>
    progress.some((p) => getVid(p) === v.video_id && p.completed),
  ).length

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-[#1a1a1a] flex-shrink-0">
        <h3 className="text-sm font-semibold text-white">Playlist</h3>
        <p className="text-xs text-[#52525b] mt-0.5">
          {completedCount}/{videos.length} completed
        </p>
        {/* Mini progress bar */}
        <div className="mt-2 h-0.5 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{
              width: `${videos.length > 0 ? (completedCount / videos.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {videos.map((video, index) => {
            const vp = progress.find((p) => getVid(p) === video.video_id)
            return (
              <PlaylistItem
                key={video.id ?? video.video_id}
                video={video}
                index={index}
                isActive={video.video_id === currentVideoId}
                isCompleted={vp?.completed ?? false}
                onClick={() => onVideoClick(video)}
              />
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  const playlistId = params.playlistId as string
  const videoId    = params.videoId    as string

  const [course, setCourse]           = useState<Course | null>(null)
  const [videos, setVideos]           = useState<(Video & { video_id: string })[]>([])
  const [currentVideo, setCurrentVideo] = useState<(Video & { video_id: string }) | null>(null)
  const [progress, setProgress]       = useState<UserProgress[]>([])
  const [notes, setNotes]             = useState("")
  const [isSaving, setIsSaving]       = useState(false)
  const [showNotes, setShowNotes]     = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [loading, setLoading]         = useState(true)
  const [savedTimestamp, setSavedTimestamp] = useState(0)

  const getVid = (p: UserProgress) => p.video_id ?? p.videoId
  const currentProgress = progress.find((p) => getVid(p) === videoId)
  const isCompleted  = currentProgress?.completed  ?? false
  const isBookmarked = currentProgress?.bookmarked ?? false

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [courses, videosData, progressData] = await Promise.all([
        getCoursesAction(),
        getVideosAction(playlistId),
        getUserProgressAction(),
      ])

      const foundCourse = courses.find((c) => c.id === playlistId)
      if (!foundCourse) {
        toast.error("Course not found.")
        router.replace("/courses")
        return
      }

      setCourse(foundCourse)
      setVideos(videosData)
      setProgress(progressData)

      const video = videosData.find((v) => v.video_id === videoId)
      if (!video) {
        toast.error("Video not found.")
        router.replace("/courses")
        return
      }
      setCurrentVideo(video)

      const getVid2 = (p: UserProgress) => p.video_id ?? p.videoId
      const ep = progressData.find((p) => getVid2(p) === videoId)
      if (ep?.notes) setNotes(ep.notes)

      const ts = await getVideoTimestampAction(videoId)
      if (ts && ts.position > 0) setSavedTimestamp(ts.position)
    } catch {
      toast.error("Failed to load course data.")
    } finally {
      setLoading(false)
    }
  }, [user, playlistId, videoId, router])

  useEffect(() => {
    if (user) loadData()
  }, [user?.id, loadData])

  // Shared helper — upsert a progress entry in local state
  const upsertLocalProgress = useCallback(
    (patch: Partial<UserProgress> & { video_id: string }) => {
      setProgress((prev) => {
        const pVid = (p: UserProgress) => p.video_id ?? p.videoId
        const exists = prev.some((p) => pVid(p) === patch.video_id)
        if (exists) return prev.map((p) => (pVid(p) === patch.video_id ? { ...p, ...patch } : p))
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            userId: user?.id ?? "",
            videoId: patch.video_id,
            watchedSeconds: 0,
            completed:  false,
            bookmarked: false,
            notes:      null,
            lastWatchedAt: null,
            updatedAt: new Date(),
            ...patch,
          } as UserProgress,
        ]
      })
    },
    [user],
  )

  const toggleComplete = useCallback(async () => {
    if (!user) return
    const newCompleted = !isCompleted
    upsertLocalProgress({ video_id: videoId, completed: newCompleted })
    try {
      await updateProgressAction({ video_id: videoId, completed: newCompleted, bookmarked: isBookmarked })
      if (newCompleted) {
        await updateStreakActivityAction(new Date().toISOString().split("T")[0])
      }
      window.dispatchEvent(new Event("progressUpdated"))
    } catch {
      upsertLocalProgress({ video_id: videoId, completed: isCompleted })
      toast.error("Couldn't save progress.")
    }
  }, [user, videoId, isCompleted, isBookmarked, upsertLocalProgress])

  const toggleBookmark = useCallback(async () => {
    if (!user) return
    const newBookmarked = !isBookmarked
    upsertLocalProgress({ video_id: videoId, bookmarked: newBookmarked })
    try {
      await updateProgressAction({ video_id: videoId, completed: isCompleted, bookmarked: newBookmarked })
      window.dispatchEvent(new Event("bookmarksUpdated"))
      toast.success(newBookmarked ? "Bookmarked" : "Bookmark removed")
    } catch {
      upsertLocalProgress({ video_id: videoId, bookmarked: isBookmarked })
      toast.error("Couldn't update bookmark.")
    }
  }, [user, videoId, isCompleted, isBookmarked, upsertLocalProgress])

  const saveNotes = useCallback(async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await updateProgressAction({ video_id: videoId, completed: isCompleted, bookmarked: isBookmarked, notes })
      upsertLocalProgress({ video_id: videoId, notes: notes as unknown as null })
      window.dispatchEvent(new Event("notesUpdated"))
      toast.success("Notes saved")
    } catch {
      toast.error("Couldn't save notes.")
    } finally {
      setIsSaving(false)
    }
  }, [user, videoId, isCompleted, isBookmarked, notes, upsertLocalProgress])

  const handleVideoProgress = useCallback(
    async (currentTime: number, duration: number) => {
      if (!user || !videoId) return
      try {
        await saveVideoTimestampAction(videoId, Math.floor(currentTime), Math.floor(duration))
        const pct = (currentTime / duration) * 100
        if (pct >= AUTO_COMPLETE_THRESHOLD && !isCompleted) {
          await updateProgressAction({ video_id: videoId, completed: true, bookmarked: isBookmarked })
          upsertLocalProgress({ video_id: videoId, completed: true })
          await updateStreakActivityAction(new Date().toISOString().split("T")[0])
          window.dispatchEvent(new Event("progressUpdated"))
        }
      } catch {}
    },
    [user, videoId, isCompleted, isBookmarked, upsertLocalProgress],
  )

  const goToNextVideo = useCallback(() => {
    const idx = videos.findIndex((v) => v.video_id === videoId)
    if (idx < videos.length - 1) {
      router.push(`/study/${playlistId}/${videos[idx + 1].video_id}`)
    }
  }, [videos, videoId, playlistId, router])

  const goToPreviousVideo = useCallback(() => {
    const idx = videos.findIndex((v) => v.video_id === videoId)
    if (idx > 0) {
      router.push(`/study/${playlistId}/${videos[idx - 1].video_id}`)
    }
  }, [videos, videoId, playlistId, router])

  const handleVideoEnd = useCallback(async () => {
    if (!isCompleted) await toggleComplete()
    goToNextVideo()
  }, [isCompleted, toggleComplete, goToNextVideo])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case "c": toggleComplete();    break
        case "b": toggleBookmark();    break
        case "n": goToNextVideo();     break
        case "p": goToPreviousVideo(); break
        case "l": setShowPlaylist((v) => !v); break
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleComplete, toggleBookmark, goToNextVideo, goToPreviousVideo])

  if (loading) return <StudySkeleton />

  if (!currentVideo || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[#a1a1aa] text-sm mb-4">Video not found.</p>
          <Button
            onClick={() => router.push("/courses")}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  const currentIndex  = videos.findIndex((v) => v.video_id === videoId)
  const hasNext       = currentIndex < videos.length - 1
  const hasPrevious   = currentIndex > 0
  const completedCount = videos.filter((v) =>
    progress.some((p) => getVid(p) === v.video_id && p.completed),
  ).length

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Video player */}
        <div className="bg-black flex-shrink-0">
          <YouTubePlayer
            videoId={videoId}
            startTime={savedTimestamp}
            onProgress={handleVideoProgress}
            onEnd={handleVideoEnd}
          />
        </div>

        {/* Video info + controls */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-4 max-w-3xl">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/courses")}
                className="h-7 px-2 text-xs text-[#52525b] hover:text-white hover:bg-white/5 -ml-2"
              >
                <ArrowLeft className="h-3 w-3 mr-1" />
                Courses
              </Button>
              <span className="text-[#2a2a2a]">/</span>
              <span className="text-xs text-[#52525b] truncate max-w-[160px]">
                {course.title}
              </span>
            </div>

            {/* Title + meta */}
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-white leading-snug">
                {currentVideo.title}
              </h1>
              <p className="text-xs text-[#52525b] mt-1">
                Video {currentIndex + 1} of {videos.length}
                {currentVideo.duration != null && currentVideo.duration > 0
                  ? ` · ${Math.floor(currentVideo.duration / 60)}:${String(currentVideo.duration % 60).padStart(2, "0")}`
                  : ""}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={toggleComplete}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-colors duration-150",
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-[#1a1a1a] text-[#a1a1aa] border border-[#2a2a2a] hover:text-white hover:bg-[#2a2a2a]",
                )}
                variant="ghost"
              >
                {isCompleted ? (
                  <><CheckCircle className="h-3.5 w-3.5 mr-1.5" />Completed</>
                ) : (
                  <><Circle className="h-3.5 w-3.5 mr-1.5" />Mark Complete</>
                )}
              </Button>

              <Button
                onClick={toggleBookmark}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-colors duration-150",
                  isBookmarked
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
                    : "bg-[#1a1a1a] text-[#a1a1aa] border border-[#2a2a2a] hover:text-white hover:bg-[#2a2a2a]",
                )}
                variant="ghost"
              >
                {isBookmarked ? (
                  <><BookmarkCheck className="h-3.5 w-3.5 mr-1.5" />Bookmarked</>
                ) : (
                  <><Bookmark className="h-3.5 w-3.5 mr-1.5" />Bookmark</>
                )}
              </Button>

              <Button
                onClick={() => setShowNotes((v) => !v)}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-colors duration-150 lg:hidden",
                  showNotes
                    ? "bg-white/10 text-white border border-white/10"
                    : "bg-[#1a1a1a] text-[#a1a1aa] border border-[#2a2a2a] hover:text-white hover:bg-[#2a2a2a]",
                )}
                variant="ghost"
              >
                <StickyNote className="h-3.5 w-3.5 mr-1.5" />
                Notes
              </Button>

              <Button
                onClick={() => setShowPlaylist(true)}
                size="sm"
                className="h-8 px-3 text-xs font-medium bg-[#1a1a1a] text-[#a1a1aa] border border-[#2a2a2a] hover:text-white hover:bg-[#2a2a2a] lg:hidden"
                variant="ghost"
              >
                <List className="h-3.5 w-3.5 mr-1.5" />
                Playlist
              </Button>
            </div>

            {/* Course progress mini-bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#52525b]">Course progress</span>
                <span className="text-[#a1a1aa]">
                  {completedCount}/{videos.length} videos
                </span>
              </div>
              <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${videos.length > 0 ? (completedCount / videos.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Notes section */}
            {showNotes && (
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-[#52525b]" />
                  My Notes
                </h2>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your notes here…"
                  className="min-h-[120px] bg-black border-[#1a1a1a] text-white placeholder:text-[#52525b] text-sm focus:border-indigo-500/50 resize-none"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                      e.preventDefault()
                      saveNotes()
                    }
                  }}
                />
                <Button
                  onClick={saveNotes}
                  disabled={isSaving}
                  size="sm"
                  className="h-8 px-3 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {isSaving ? "Saving…" : "Save Notes"}
                </Button>
              </div>
            )}

            {/* Desktop notes — always visible */}
            <div className="hidden lg:block bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-[#52525b]" />
                My Notes
                <span className="text-xs text-[#52525b] font-normal ml-auto">
                  Ctrl+S to save
                </span>
              </h2>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                placeholder="Write your notes here…"
                className="min-h-[120px] bg-black border-[#1a1a1a] text-white placeholder:text-[#52525b] text-sm focus:border-indigo-500/50 resize-none"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                    e.preventDefault()
                    saveNotes()
                  }
                }}
              />
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                onClick={goToPreviousVideo}
                disabled={!hasPrevious}
                variant="outline"
                className="flex-1 h-9 text-xs border-[#2a2a2a] bg-transparent text-[#a1a1aa] hover:text-white hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={goToNextVideo}
                disabled={!hasNext}
                className="flex-1 h-9 text-xs bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Playlist sidebar (desktop) ─────────────────────────── */}
      <div className="hidden lg:block w-72 border-l border-[#1a1a1a] flex-shrink-0 overflow-hidden">
        <PlaylistSidebar
          videos={videos}
          progress={progress}
          currentVideoId={videoId}
          onVideoClick={(v) => router.push(`/study/${playlistId}/${v.video_id}`)}
        />
      </div>

      {/* ── Playlist sidebar (mobile overlay) ─────────────────── */}
      {showPlaylist && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowPlaylist(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] border-l border-[#1a1a1a]">
            <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-white">Playlist</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylist(false)}
                className="h-7 w-7 text-[#a1a1aa] hover:text-white hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PlaylistSidebar
              videos={videos}
              progress={progress}
              currentVideoId={videoId}
              onVideoClick={(v) => {
                router.push(`/study/${playlistId}/${v.video_id}`)
                setShowPlaylist(false)
              }}
            />
          </div>
        </div>
      )}

      {/* ── Keyboard shortcut bar ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 hidden lg:flex items-center justify-center gap-6 h-8 bg-black/90 border-t border-[#1a1a1a] text-[10px] text-[#52525b]">
        <span><kbd className="font-mono">N</kbd> next</span>
        <span><kbd className="font-mono">P</kbd> prev</span>
        <span><kbd className="font-mono">B</kbd> bookmark</span>
        <span><kbd className="font-mono">C</kbd> complete</span>
        <span><kbd className="font-mono">L</kbd> playlist</span>
        <span><kbd className="font-mono">Ctrl+S</kbd> save notes</span>
      </div>
    </div>
  )
}
