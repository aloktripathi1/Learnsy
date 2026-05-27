"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Play, X, Zap, Target, Clock, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getStreakActivityAction, getVideosAction, getUserProgressAction } from "@/app/actions/courses"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Course } from "@/types"

interface DailyReminderProps {
  courses: Course[]
  stats: {
    activeStreak: number
    watchedVideos: number
  }
}

type ReminderType = "continue" | "streak" | "inactive" | "welcome" | null

interface ReminderMessage {
  type: ReminderType
  title: string
  description: string
  action?: string
  actionFn?: () => void
}

export function DailyReminder({ courses, stats }: DailyReminderProps) {
  
  const { user } = useAuth()
  const router = useRouter()

  const [lastActivity, setLastActivity]         = useState<Date | null | undefined>(undefined)
  const [reminderMessage, setReminderMessage]   = useState<ReminderMessage | null>(null)
  const [isDismissed, setIsDismissed]           = useState(false)
  const [showBanner, setShowBanner]             = useState(false)

  useEffect(() => {
    if (!user) return
    getStreakActivityAction()
      .then((data) => {
        if (data.length === 0) {
          setLastActivity(null)
        } else {
          const sorted = [...data].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          setLastActivity(new Date(sorted[0].date))
        }
      })
      .catch(() => setLastActivity(null))
  }, [user])

  useEffect(() => {
    if (lastActivity === undefined) return
    generateReminderMessage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActivity, courses, stats])

  const generateReminderMessage = () => {
    const now   = new Date()
    const today = now.toISOString().split("T")[0]

    const dismissedToday = localStorage.getItem(`reminder-dismissed-${today}`)
    if (dismissedToday) {
      setIsDismissed(true)
      return
    }

    if (!lastActivity) {
      setReminderMessage({
        type: "welcome",
        title: "🎯 Ready to start learning?",
        description:
          courses.length > 0
            ? "You have courses ready to explore. Start your learning journey today!"
            : "Import your first YouTube playlist to begin your learning adventure.",
        action: courses.length > 0 ? "Start Learning" : "Import Playlist",
        actionFn: () => {
          if (courses.length > 0) resumeFirstCourse()
          else router.push("/courses")
        },
      })
      setShowBanner(true)
      return
    }

    const daysSince        = Math.floor((now.getTime() - lastActivity.getTime()) / 86400000)
    const lastActivityDate = lastActivity.toISOString().split("T")[0]

    if (lastActivityDate === today) return

    if (daysSince === 1) {
      setReminderMessage(
        stats.activeStreak > 0
          ? {
              type: "streak",
              title: `🔥 Keep your ${stats.activeStreak}-day streak alive!`,
              description: "You watched videos yesterday. Continue today to maintain your streak.",
              action: "Continue Learning",
              actionFn: resumeFirstCourse,
            }
          : {
              type: "continue",
              title: "📚 Continue where you left off",
              description: "You made progress yesterday. Keep the momentum going.",
              action: "Resume",
              actionFn: resumeFirstCourse,
            },
      )
      setShowBanner(true)
    } else if (daysSince >= 2 && daysSince <= 3) {
      setReminderMessage({
        type: "inactive",
        title: `⏰ You've been away for ${daysSince} days`,
        description:
          stats.activeStreak > 0
            ? `Your ${stats.activeStreak}-day streak is at risk. A quick session can get you back on track.`
            : "Your learning journey is waiting. Even a short session makes a difference.",
        action: "Get Back on Track",
        actionFn: resumeFirstCourse,
      })
      setShowBanner(true)
    } else if (daysSince >= 4) {
      setReminderMessage({
        type: "inactive",
        title: "🌟 Ready to restart your learning?",
        description: `It's been ${daysSince} days since your last session. Your courses are waiting.`,
        action: "Restart Learning",
        actionFn: resumeFirstCourse,
      })
      setShowBanner(true)
    }
  }

  const resumeFirstCourse = async () => {
    if (courses.length === 0) { router.push("/courses"); return }
    try {
      const first    = courses[0]
      const [videos, progress] = await Promise.all([
        getVideosAction(first.id),
        getUserProgressAction(),
      ])
      const nextVideo = videos.find((v) => {
        const vp = progress.find((p) => p.video_id === v.video_id)
        return !vp?.completed
      })
      const target = nextVideo ?? videos[0]
      if (target) router.push(`/study/${first.id}/${target.video_id}`)
    } catch {
      router.push("/courses")
    }
  }

  const dismiss = () => {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem(`reminder-dismissed-${today}`, "true")
    setIsDismissed(true)
    setShowBanner(false)
    toast.success("Reminder dismissed", { description: "We'll check in tomorrow." })
  }

  if (isDismissed || !reminderMessage || !showBanner) return null

  const getIcon = () => {
    switch (reminderMessage.type) {
      case "welcome":  return <Target className="h-4 w-4 text-indigo-400" />
      case "continue": return <Play   className="h-4 w-4 text-emerald-400" />
      case "streak":   return <Zap    className="h-4 w-4 text-amber-400" />
      case "inactive": return <Clock  className="h-4 w-4 text-amber-400" />
      default:         return <Calendar className="h-4 w-4 text-indigo-400" />
    }
  }

  const getBorder = () => {
    switch (reminderMessage.type) {
      case "welcome":  return "border-indigo-500/20 bg-indigo-500/5"
      case "continue": return "border-emerald-500/20 bg-emerald-500/5"
      case "streak":   return "border-amber-500/20 bg-amber-500/5"
      case "inactive": return "border-amber-500/20 bg-amber-500/5"
      default:         return "border-indigo-500/20 bg-indigo-500/5"
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200",
        getBorder(),
      )}
    >
      <div className="mt-0.5 shrink-0">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white mb-0.5">{reminderMessage.title}</p>
        <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">
          {reminderMessage.description}
        </p>
        {reminderMessage.action && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-7 px-2.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => { reminderMessage.actionFn?.(); dismiss() }}
            >
              {reminderMessage.action}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismiss}
              className="h-7 px-2 text-xs text-[#52525b] hover:text-[#a1a1aa]"
            >
              Maybe later
            </Button>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={dismiss}
        className="h-6 w-6 text-[#52525b] hover:text-[#a1a1aa] shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
