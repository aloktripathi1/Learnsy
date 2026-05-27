"use server"

// Placeholder — will be replaced in Step 6 with Drizzle-based actions
import type { StreakActivity, VideoTimestamp } from "@/types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCoursesAction(): Promise<any[]> {
  return []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getVideosAction(_courseId: string): Promise<any[]> {
  return []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserProgressAction(): Promise<any[]> {
  return []
}

export async function deleteCourseAction(_courseId: string): Promise<void> {
  return
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getBookmarksAction(): Promise<any[]> {
  return []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getNotesAction(): Promise<any[]> {
  return []
}

export async function getStreakActivityAction(): Promise<StreakActivity[]> {
  return []
}

export async function updateProgressAction(_data: {
  video_id: string
  completed?: boolean
  bookmarked?: boolean
  notes?: string
}): Promise<void> {
  return
}

export async function updateStreakActivityAction(_date: string): Promise<void> {
  return
}

export async function saveVideoTimestampAction(
  _videoId: string,
  _timestamp: number,
  _duration: number,
): Promise<void> {
  return
}

export async function getVideoTimestampAction(
  _videoId: string,
): Promise<VideoTimestamp | null> {
  return null
}
