"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { getStreakActivityAction } from "@/app/actions/courses"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
const DAYS   = ["","Mon","","Wed","","Fri",""]

export function StreakCalendar() {
  const { data: session } = useSession()
  const user = session?.user
  const [activityMap, setActivityMap] = useState<Record<string, number>>({})
  const [loading, setLoading]         = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    try {
      const activities = await getStreakActivityAction()
      const map: Record<string, number> = {}
      activities.forEach((a) => { map[a.date] = a.videosWatched })
      setActivityMap(map)
    } catch {}
    finally { setLoading(false) }
  }, [user])

  useEffect(() => {
    if (user) loadData()
    const handler = () => loadData()
    window.addEventListener("progressUpdated", handler)
    return () => window.removeEventListener("progressUpdated", handler)
  }, [user, loadData])

  // Build a 52-week grid (364 days back from today, always ending on today)
  const today      = new Date()
  const todayStr   = today.toISOString().split("T")[0]
  const dayOfWeek  = today.getDay() // 0=Sun

  // Find the Sunday that starts the last full week ending today
  const gridEnd    = new Date(today)
  const gridStart  = new Date(today)
  gridStart.setDate(today.getDate() - (52 * 7 + dayOfWeek - 1))

  // Build weeks array
  const weeks: { date: string; count: number; level: number }[][] = []
  let week: { date: string; count: number; level: number }[] = []

  const cur = new Date(gridStart)
  while (cur <= gridEnd) {
    const ds    = cur.toISOString().split("T")[0]
    const count = activityMap[ds] ?? 0
    const level = count === 0 ? 0 : Math.min(Math.ceil(count / 2), 4)
    week.push({ date: ds, count, level })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
    cur.setDate(cur.getDate() + 1)
  }
  if (week.length > 0) weeks.push(week)

  // Month labels — find first week of each month
  const monthLabels: { label: string; colIndex: number }[] = []
  weeks.forEach((w, i) => {
    const firstDay = w.find((d) => d.date)
    if (!firstDay) return
    const m = new Date(firstDay.date).getMonth()
    const already = monthLabels.some((ml) => ml.label === MONTHS[m])
    if (!already) monthLabels.push({ label: MONTHS[m], colIndex: i })
  })

  // Stats
  const activeDays   = Object.keys(activityMap).length
  const currentStreak = (() => {
    let s = 0
    const c = new Date(today)
    for (let i = 0; i < 365; i++) {
      const ds = c.toISOString().split("T")[0]
      if (activityMap[ds]) {
        s++
        c.setDate(c.getDate() - 1)
      } else {
        if (ds === todayStr) { c.setDate(c.getDate() - 1); continue }
        break
      }
    }
    return s
  })()

  const cellColor = (level: number) => {
    switch (level) {
      case 1: return "#1e1b4b"
      case 2: return "#3730a3"
      case 3: return "#6366f1"
      case 4: return "#a5b4fc"
      default: return "#1a1a1a"
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex gap-6 text-xs">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        <div className="skeleton h-24 w-full rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="flex items-center gap-5 text-xs text-[#a1a1aa]">
        <div>
          <span className="font-semibold text-white">{activeDays}</span>{" "}
          <span className="text-[#52525b]">active days</span>
        </div>
        <div>
          <span className="font-semibold text-white">{currentStreak}</span>{" "}
          <span className="text-[#52525b]">day streak</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-1">
        <div style={{ minWidth: "640px" }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: "20px" }}>
            {weeks.map((_, i) => {
              const ml = monthLabels.find((m) => m.colIndex === i)
              return (
                <div
                  key={i}
                  className="text-[10px] text-[#52525b]"
                  style={{ width: "14px", marginRight: "2px", flexShrink: 0 }}
                >
                  {ml?.label ?? ""}
                </div>
              )
            })}
          </div>

          {/* Day labels + grid */}
          <div className="flex gap-0">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-[2px] mr-1" style={{ width: "20px" }}>
              {DAYS.map((d, i) => (
                <div
                  key={i}
                  className="text-[10px] text-[#52525b] leading-none flex items-center"
                  style={{ height: "14px" }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Columns */}
            <div className="flex gap-[2px]">
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {w.map((day, di) => (
                    <div
                      key={di}
                      title={`${day.date}: ${day.count} video${day.count !== 1 ? "s" : ""}`}
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "2px",
                        backgroundColor: cellColor(day.level),
                        flexShrink: 0,
                        transition: "opacity 0.15s ease",
                        opacity: day.date > todayStr ? 0.15 : 1,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-[10px] text-[#52525b]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "2px",
              backgroundColor: cellColor(level),
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
