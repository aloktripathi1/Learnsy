"use server"

import { ensureUserExists } from "@/lib/ensure-user"
import { DatabaseService } from "@/lib/database"

const MAX_PLAYLISTS_PER_USER = 4

// Check if user can import more playlists
export async function checkPlaylistLimit(userId?: string) {
  try {
    const actualUserId = userId || await ensureUserExists()
    
    if (!actualUserId) {
      return {
        canImport: false,
        currentCount: 0,
        maxCount: MAX_PLAYLISTS_PER_USER,
        remaining: 0,
      }
    }

    const courses = await DatabaseService.getCourses(actualUserId)
    const currentCount = courses.length
    const remaining = Math.max(0, MAX_PLAYLISTS_PER_USER - currentCount)
    const canImport = currentCount < MAX_PLAYLISTS_PER_USER

    return {
      canImport,
      currentCount,
      maxCount: MAX_PLAYLISTS_PER_USER,
      remaining,
    }
  } catch (error) {
    console.error("Error checking playlist limit:", error)
    return {
      canImport: false,
      currentCount: 0,
      maxCount: MAX_PLAYLISTS_PER_USER,
      remaining: 0,
    }
  }
}
