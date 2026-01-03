import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DatabaseService } from "@/lib/database"

const MAX_PLAYLISTS_PER_USER = 4

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized",
      }, { status: 401 })
    }

    const courses = await DatabaseService.getCourses(userId)
    const currentCount = courses.length
    const maxCount = MAX_PLAYLISTS_PER_USER
    const remaining = Math.max(0, maxCount - currentCount)

    console.log("Playlist limit check:", {
      userId,
      currentCount,
      maxCount,
      remaining,
      canImport: currentCount < maxCount,
    })

    return NextResponse.json({
      canImport: currentCount < maxCount,
      currentCount: currentCount,
      maxCount: maxCount,
      remaining: remaining,
    })
  } catch (error) {
    console.error("Error checking playlist limit:", error)
    return NextResponse.json({
      canImport: false,
      currentCount: 0,
      maxCount: MAX_PLAYLISTS_PER_USER,
      remaining: 0,
      error: "Could not check playlist limit",
    }, { status: 500 })
  }
}