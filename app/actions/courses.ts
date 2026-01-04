'use server'

import { DatabaseService } from '@/lib/database'
import { ensureUserExists } from '@/lib/ensure-user'
import type { Course, Video, UserProgress } from '@/lib/db'

export async function getCoursesAction(): Promise<Course[]> {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.getCourses(userId)
}

export async function getVideosAction(courseId: string): Promise<Video[]> {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.getVideos(courseId)
}

export async function getUserProgressAction(): Promise<UserProgress[]> {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.getUserProgress(userId)
}

export async function deleteCourseAction(courseId: string): Promise<void> {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  await DatabaseService.deleteCourseWithRelatedData(courseId, userId)
}

export async function getBookmarksAction() {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.getBookmarks(userId)
}

export async function getNotesAction() {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.getNotes(userId)
}

export async function getStreakActivityAction() {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.getStreakActivity(userId)
}

export async function updateProgressAction(data: {
  video_id: string
  completed?: boolean
  bookmarked?: boolean
  notes?: string
}) {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  // Only pass the allowed fields to prevent issues
  const updateData: any = {
    user_id: userId,
    video_id: data.video_id,
  }
  
  if (data.completed !== undefined) updateData.completed = data.completed
  if (data.bookmarked !== undefined) updateData.bookmarked = data.bookmarked
  if (data.notes !== undefined) updateData.notes = data.notes
  
  return await DatabaseService.updateProgress(updateData)
}

export async function updateStreakActivityAction(date: string) {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.updateStreakActivity(userId, date)
}

export async function saveVideoTimestampAction(videoId: string, timestamp: number, duration: number) {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.saveVideoTimestamp(userId, videoId, timestamp, duration)
}

export async function getVideoTimestampAction(videoId: string) {
  const userId = await ensureUserExists()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return await DatabaseService.getVideoTimestamp(userId, videoId)
}
