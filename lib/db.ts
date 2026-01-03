import { neon } from '@neondatabase/serverless'

// Validate environment variable
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set')
}

// Create Neon SQL client
export const sql = databaseUrl ? neon(databaseUrl) : null

// Helper function to check if database is configured
export const isDatabaseConfigured = () => {
  return !!databaseUrl && !!sql
}

// Database types (exported for compatibility)
export interface Course {
  id: string
  user_id: string
  playlist_id: string
  title: string
  thumbnail: string
  video_count: number
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  course_id: string
  video_id: string
  title: string
  thumbnail: string
  duration: string
  position: number
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  video_id: string
  completed: boolean
  bookmarked: boolean
  notes: string
  completed_at?: string
  updated_at: string
}

export interface StreakActivity {
  id: string
  user_id: string
  date: string
  videos_watched: number
  created_at: string
}

export interface VideoTimestamp {
  id: string
  user_id: string
  video_id: string
  timestamp: number
  duration: number
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}
