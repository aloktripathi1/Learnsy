export type Plan = "free" | "pro"

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  plan: Plan
  stripeCustomerId: string | null
  createdAt: Date
}

export interface Course {
  id: string
  userId: string
  playlistId: string
  title: string
  description: string | null
  thumbnail: string | null
  totalVideos: number
  createdAt: Date
  /** Alias used by DB rows */
  video_count?: number
  created_at?: string | Date
}

export interface Video {
  id: string
  courseId: string
  youtubeId: string
  title: string
  description: string | null
  thumbnail: string | null
  /** Duration in seconds (number) from API; may be formatted string from DB row */
  duration: number
  position: number
  /** Snake-case alias used by DB rows */
  video_id?: string
  course_id?: string
}

export interface UserProgress {
  id: string
  userId: string
  videoId: string
  watchedSeconds: number
  completed: boolean
  notes: string | null
  bookmarked: boolean
  lastWatchedAt: Date | null
  updatedAt: Date
  /** Snake-case aliases returned by DB rows */
  video_id?: string
  user_id?: string
  updated_at?: string | Date
}

export interface StreakActivity {
  id: string
  userId: string
  date: string
  videosWatched: number
  /** Snake-case alias */
  videos_watched?: number
  user_id?: string
}

export interface VideoTimestamp {
  id: string
  userId: string
  videoId: string
  position: number
  updatedAt: Date
  /** Snake-case aliases */
  video_id?: string
  user_id?: string
  updated_at?: string | Date
}

// YouTube API types
export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  position: number
}

export interface YouTubePlaylist {
  id: string
  title: string
  description: string
  thumbnail: string
  videos: YouTubeVideo[]
}

// AI types
export interface QuizQuestion {
  question: string
  options: [string, string, string, string]
  answer: string
}

export interface QuizResponse {
  questions: QuizQuestion[]
}

// API response types
export interface ApiError {
  error: string
}

export interface ImportProgress {
  type: "progress" | "error" | "success"
  message?: string
  progress?: number
  error?: string
  course?: Course & { videoCount: number }
}
