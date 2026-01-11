"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  Circle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  StickyNote,
  List,
  X,
  Save,
  AlertCircle,
  PlayCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
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
import type { Course, Video, UserProgress } from "@/lib/db"
import { cn } from "@/lib/utils"

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const playlistId = params.playlistId as string
  const videoId = params.videoId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savedTimestamp, setSavedTimestamp] = useState<number>(0)

  // Current video progress
  const currentProgress = progress.find((p) => p.video_id === videoId)
  const isCompleted = currentProgress?.completed || false
  const isBookmarked = currentProgress?.bookmarked || false

  const loadData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log("Loading course data for:", playlistId, videoId)
      
      // Load data in parallel for better performance
      const [courses, videosData, progressData] = await Promise.all([
        getCoursesAction(),
        getVideosAction(playlistId),
        getUserProgressAction()
      ])

      console.log("Data loaded:", { 
        coursesCount: courses.length, 
        videosCount: videosData.length,
        progressCount: progressData.length 
      })
      
      // Find current course
      const foundCourse = courses.find((c) => c.id === playlistId)
      if (!foundCourse) {
        console.error("Course not found")
        alert("Course not found. Redirecting to courses page.")
        setLoading(false)
        router.replace("/courses")
        return
      }

      setCourse(foundCourse)
      setVideos(videosData)

      // Find current video
      const video = videosData.find((v) => v.video_id === videoId)
      if (!video) {
        console.error("Video not found")
        alert("Video not found. Redirecting to courses page.")
        setLoading(false)
        router.replace("/courses")
        return
      }
      setCurrentVideo(video)
      setProgress(progressData)

      // Load existing notes
      const existingProgress = progressData.find((p) => p.video_id === videoId)
      if (existingProgress?.notes) {
        setNotes(existingProgress.notes)
      }

      // Load saved timestamp
      const timestamp = await getVideoTimestampAction(videoId)
      if (timestamp && timestamp.timestamp > 0) {
        setSavedTimestamp(timestamp.timestamp)
      }

      console.log("Course loaded successfully")
    } catch (error) {
      console.error("Error loading study data:", error)
      alert(`Failed to load course: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [user?.id, playlistId, videoId, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user?.id, loadData])

  const toggleComplete = async () => {
    if (!user) return

    try {
      const newCompleted = !isCompleted
      
      await updateProgressAction({
        video_id: videoId,
        completed: newCompleted,
        bookmarked: isBookmarked,
      })

      // Update local state
      setProgress((prev) =>
        prev.map((p) =>
          p.video_id === videoId ? { ...p, completed: newCompleted } : p
        ).concat(
          prev.find((p) => p.video_id === videoId)
            ? []
            : [{
                id: crypto.randomUUID(),
                user_id: user.id,
                video_id: videoId,
                completed: newCompleted,
                bookmarked: isBookmarked,
                notes: notes,
                updated_at: new Date().toISOString(),
              }]
        )
      )

      // Update streak if completing
      if (newCompleted) {
        const today = new Date().toISOString().split("T")[0]
        await updateStreakActivityAction(today)
      }

      // Dispatch event for other components
      window.dispatchEvent(new Event("progressUpdated"))
    } catch (error) {
      console.error("Error toggling completion:", error)
    }
  }

  const toggleBookmark = async () => {
    if (!user) return

    try {
      const newBookmarked = !isBookmarked

      await updateProgressAction({
        video_id: videoId,
        completed: isCompleted,
        bookmarked: newBookmarked,
      })

      // Update local state
      setProgress((prev) =>
        prev.map((p) =>
          p.video_id === videoId ? { ...p, bookmarked: newBookmarked } : p
        ).concat(
          prev.find((p) => p.video_id === videoId)
            ? []
            : [{
                id: crypto.randomUUID(),
                user_id: user.id,
                video_id: videoId,
                completed: isCompleted,
                bookmarked: newBookmarked,
                notes: notes,
                updated_at: new Date().toISOString(),
              }]
        )
      )

      // Dispatch event for other components
      window.dispatchEvent(new Event("bookmarksUpdated"))
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    }
  }

  const saveNotes = async () => {
    if (!user) return

    try {
      setIsSaving(true)

      await updateProgressAction({
        video_id: videoId,
        completed: isCompleted,
        bookmarked: isBookmarked,
        notes: notes,
      })

      // Update local state
      setProgress((prev) =>
        prev.map((p) =>
          p.video_id === videoId ? { ...p, notes } : p
        ).concat(
          prev.find((p) => p.video_id === videoId)
            ? []
            : [{
                id: crypto.randomUUID(),
                user_id: user.id,
                video_id: videoId,
                completed: isCompleted,
                bookmarked: isBookmarked,
                notes,
                updated_at: new Date().toISOString(),
              }]
        )
      )

      // Dispatch event for other components
      window.dispatchEvent(new Event("notesUpdated"))
    } catch (error) {
      console.error("Error saving notes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleVideoProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!user || !videoId) return
    
    // Save timestamp every 5 seconds
    try {
      await saveVideoTimestampAction(videoId, Math.floor(currentTime), Math.floor(duration))
      
      // Auto-complete video when 30% watch time is reached
      const watchPercentage = (currentTime / duration) * 100
      if (watchPercentage >= 30 && !isCompleted) {
        await updateProgressAction({
          video_id: videoId,
          completed: true,
          bookmarked: isBookmarked,
        })
        
        // Update local state
        setProgress((prev) =>
          prev.map((p) =>
            p.video_id === videoId ? { ...p, completed: true } : p
          ).concat(
            prev.find((p) => p.video_id === videoId)
              ? []
              : [{
                  id: crypto.randomUUID(),
                  user_id: user.id,
                  video_id: videoId,
                  completed: true,
                  bookmarked: isBookmarked,
                  notes: notes,
                  updated_at: new Date().toISOString(),
                }]
          )
        )
        
        // Update streak
        const today = new Date().toISOString().split("T")[0]
        await updateStreakActivityAction(today)
        
        // Dispatch event for other components
        window.dispatchEvent(new Event("progressUpdated"))
      }
    } catch (error) {
      console.error("Error saving timestamp:", error)
    }
  }, [user, videoId, isCompleted, isBookmarked, notes])

  const handleVideoEnd = async () => {
    if (!isCompleted) {
      await toggleComplete()
    }
    // Auto-navigate to next video
    goToNextVideo()
  }

  const goToNextVideo = () => {
    if (!currentVideo || videos.length === 0) return

    const currentIndex = videos.findIndex((v) => v.video_id === videoId)
    if (currentIndex < videos.length - 1) {
      const nextVideo = videos[currentIndex + 1]
      router.push(`/study/${playlistId}/${nextVideo.video_id}`)
    }
  }

  const goToPreviousVideo = () => {
    if (!currentVideo || videos.length === 0) return

    const currentIndex = videos.findIndex((v) => v.video_id === videoId)
    if (currentIndex > 0) {
      const prevVideo = videos[currentIndex - 1]
      router.push(`/study/${playlistId}/${prevVideo.video_id}`)
    }
  }

  const goToVideo = (video: Video) => {
    router.push(`/study/${playlistId}/${video.video_id}`)
    setShowPlaylist(false)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in textarea
      if (e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case "c":
          toggleComplete()
          break
        case "b":
          toggleBookmark()
          break
        case "n":
          goToNextVideo()
          break
        case "p":
          goToPreviousVideo()
          break
        case "l":
          setShowPlaylist((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isCompleted, isBookmarked, videos, videoId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!currentVideo || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Video not found. Redirecting...</AlertDescription>
        </Alert>
      </div>
    )
  }

  const currentIndex = videos.findIndex((v) => v.video_id === videoId)
  const hasNext = currentIndex < videos.length - 1
  const hasPrevious = currentIndex > 0
  const completedCount = videos.filter((v) =>
    progress.find((p) => p.video_id === v.video_id && p.completed)
  ).length

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player */}
        <div className="bg-black flex-shrink-0">
          <YouTubePlayer
            videoId={videoId}
            startTime={savedTimestamp}
            onProgress={handleVideoProgress}
            onEnd={handleVideoEnd}
          />
        </div>

        {/* Video Info and Controls */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Course Badge */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses`)}
                className="mb-2 -ml-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Courses
              </Button>
              <Badge variant="outline" className="text-xs">
                {course.title}
              </Badge>
            </div>

            {/* Video Title and Actions */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
                    {currentVideo.title}
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Video {currentIndex + 1} of {videos.length} • {currentVideo.duration}
                  </p>
                </div>

                {/* Mobile Playlist Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="lg:hidden"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={toggleComplete}
                  variant={isCompleted ? "default" : "outline"}
                  size="sm"
                  className="touch-target"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>

                <Button
                  onClick={toggleBookmark}
                  variant={isBookmarked ? "default" : "outline"}
                  size="sm"
                  className="touch-target"
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmark
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-medium">
                      {completedCount}/{videos.length} videos
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(completedCount / videos.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <StickyNote className="h-5 w-5" />
                  My Notes
                </CardTitle>
                <CardDescription>
                  Take notes while you learn. Press Ctrl+S to save.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your notes here..."
                  className="min-h-[150px] text-base"
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
                  className="w-full lg:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Notes"}
                </Button>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                onClick={goToPreviousVideo}
                disabled={!hasPrevious}
                variant="outline"
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={goToNextVideo}
                disabled={!hasNext}
                className="flex-1"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Keyboard Shortcuts */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground mb-3 font-medium">
                  Keyboard Shortcuts:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded border">C</kbd> Mark
                    complete
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded border">B</kbd> Bookmark
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded border">N</kbd> Next
                    video
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded border">P</kbd> Previous
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded border">L</kbd> Toggle
                    playlist
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-background rounded border">Ctrl+S</kbd> Save
                    notes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Playlist Sidebar - Desktop */}
      <div className="hidden lg:block w-72 border-l bg-card overflow-hidden flex-shrink-0">
        <PlaylistSidebar
          videos={videos}
          progress={progress}
          currentVideoId={videoId}
          onVideoClick={goToVideo}
        />
      </div>

      {/* Playlist Sidebar - Mobile Overlay */}
      {showPlaylist && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPlaylist(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Playlist</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPlaylist(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PlaylistSidebar
              videos={videos}
              progress={progress}
              currentVideoId={videoId}
              onVideoClick={goToVideo}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function PlaylistSidebar({
  videos,
  progress,
  currentVideoId,
  onVideoClick,
}: {
  videos: Video[]
  progress: UserProgress[]
  currentVideoId: string
  onVideoClick: (video: Video) => void
}) {
  const completedCount = videos.filter((v) =>
    progress.find((p) => p.video_id === v.video_id && p.completed)
  ).length

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Playlist</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {completedCount}/{videos.length} completed
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {videos.map((video, index) => {
            const videoProgress = progress.find((p) => p.video_id === video.video_id)
            const isCompleted = videoProgress?.completed || false
            const isCurrent = video.video_id === currentVideoId

            return (
              <button
                key={video.id}
                onClick={() => onVideoClick(video)}
                className={cn(
                  "w-full text-left p-3 rounded-lg mb-2 transition-colors",
                  "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                  isCurrent && "bg-accent border-2 border-primary"
                )}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isCurrent ? (
                      <PlayCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {video.duration}
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "text-sm line-clamp-2 leading-snug",
                        isCurrent && "font-medium"
                      )}
                    >
                      {video.title}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
