import {
  sql,
  isDatabaseConfigured,
  type Course,
  type Video,
  type UserProgress,
  type StreakActivity,
  type VideoTimestamp,
  type User,
} from "./db"

export { type Course, type Video, type UserProgress, type StreakActivity, type VideoTimestamp }

export class DatabaseService {
  private static checkDatabase() {
    if (!isDatabaseConfigured() || !sql) {
      throw new Error("Database is not configured. Please check your DATABASE_URL environment variable.")
    }
    return sql
  }

  // Users
  static async upsertUser(user: { id: string; email: string; name?: string; image_url?: string }): Promise<User> {
    const db = this.checkDatabase()
    console.log("Upserting user:", user.id)
    
    const result = await db`
      INSERT INTO users (id, email, name, image_url)
      VALUES (${user.id}, ${user.email}, ${user.name || null}, ${user.image_url || null})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        image_url = EXCLUDED.image_url,
        updated_at = NOW()
      RETURNING *
    `
    
    if (!result || result.length === 0) {
      throw new Error("Failed to upsert user")
    }
    
    console.log("User upserted successfully")
    return result[0] as User
  }

  // Courses
  static async getCourses(userId: string): Promise<Course[]> {
    const db = this.checkDatabase()
    console.log("Getting courses for user:", userId)
    
    const courses = await db`
      SELECT * FROM courses
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    
    console.log(`Retrieved ${courses.length} courses`)
    return courses as Course[]
  }

  static async createCourse(course: Omit<Course, "id" | "created_at" | "updated_at">): Promise<Course> {
    const db = this.checkDatabase()
    console.log("Creating course:", course)
    
    const result = await db`
      INSERT INTO courses (user_id, playlist_id, title, thumbnail, video_count)
      VALUES (${course.user_id}, ${course.playlist_id}, ${course.title}, ${course.thumbnail}, ${course.video_count})
      RETURNING *
    `
    
    if (!result || result.length === 0) {
      throw new Error("Failed to create course")
    }
    
    console.log("Course created successfully:", result[0].id)
    return result[0] as Course
  }

  static async deleteCourse(courseId: string): Promise<void> {
    const db = this.checkDatabase()
    console.log("Deleting course:", courseId)
    
    await db`
      DELETE FROM courses WHERE id = ${courseId}
    `
    
    console.log("Course deleted successfully")
  }

  // Videos
  static async getVideos(courseId: string): Promise<Video[]> {
    const db = this.checkDatabase()
    console.log("Getting videos for course:", courseId)
    
    const videos = await db`
      SELECT * FROM videos
      WHERE course_id = ${courseId}
      ORDER BY position ASC
    `
    
    console.log(`Retrieved ${videos.length} videos`)
    return videos as Video[]
  }

  static async createVideos(videos: Omit<Video, "id" | "created_at">[]): Promise<Video[]> {
    const db = this.checkDatabase()
    console.log(`Creating ${videos.length} videos`)
    
    if (videos.length === 0) {
      return []
    }
    
    const results: Video[] = []
    
    // Insert videos in larger batches using bulk insert for much better performance
    const batchSize = 100
    for (let i = 0; i < videos.length; i += batchSize) {
      const batch = videos.slice(i, i + batchSize)
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(videos.length / batchSize)} with ${batch.length} videos`)
      
      // Use bulk insert with unnest for maximum performance
      const courseIds = batch.map(v => v.course_id)
      const videoIds = batch.map(v => v.video_id)
      const titles = batch.map(v => v.title)
      const thumbnails = batch.map(v => v.thumbnail || '')
      const durations = batch.map(v => v.duration || '0:00')
      const positions = batch.map(v => v.position)
      
      const result = await db`
        INSERT INTO videos (course_id, video_id, title, thumbnail, duration, position)
        SELECT * FROM UNNEST(
          ${courseIds}::uuid[],
          ${videoIds}::text[],
          ${titles}::text[],
          ${thumbnails}::text[],
          ${durations}::text[],
          ${positions}::integer[]
        )
        RETURNING *
      `
      
      results.push(...(result as Video[]))
    }
    
    console.log(`Successfully created ${results.length} videos in ${Math.ceil(videos.length / batchSize)} batches`)
    return results
  }

  // User Progress
  static async getUserProgress(userId: string, videoId?: string): Promise<UserProgress[]> {
    const db = this.checkDatabase()
    console.log("Getting user progress for user:", userId, videoId ? `and video: ${videoId}` : "")
    
    let progress
    if (videoId) {
      progress = await db`
        SELECT * FROM user_progress
        WHERE user_id = ${userId} AND video_id = ${videoId}
      `
    } else {
      progress = await db`
        SELECT * FROM user_progress
        WHERE user_id = ${userId}
      `
    }
    
    console.log(`Retrieved ${progress.length} progress records`)
    return progress as UserProgress[]
  }

  static async updateProgress(
    progress: Partial<UserProgress> & { user_id: string; video_id: string },
  ): Promise<UserProgress | null> {
    const db = this.checkDatabase()
    console.log("Updating progress:", progress)
    
    // Auto-set completed_at when marking as completed
    const completedAt = progress.completed 
      ? (progress.completed_at || new Date().toISOString()) 
      : progress.completed_at || null
    
    const result = await db`
      INSERT INTO user_progress (user_id, video_id, completed, bookmarked, notes, completed_at)
      VALUES (
        ${progress.user_id},
        ${progress.video_id},
        ${progress.completed ?? false},
        ${progress.bookmarked ?? false},
        ${progress.notes || null},
        ${completedAt}
      )
      ON CONFLICT (user_id, video_id) DO UPDATE SET
        completed = EXCLUDED.completed,
        bookmarked = EXCLUDED.bookmarked,
        notes = COALESCE(EXCLUDED.notes, user_progress.notes),
        completed_at = CASE 
          WHEN EXCLUDED.completed = true AND user_progress.completed = false THEN EXCLUDED.completed_at
          WHEN EXCLUDED.completed = false THEN NULL
          ELSE user_progress.completed_at
        END,
        updated_at = NOW()
      RETURNING *
    `
    
    console.log("Progress updated successfully")
    return result[0] as UserProgress
  }

  // Streak Activity
  static async getStreakActivity(userId: string): Promise<StreakActivity[]> {
    const db = this.checkDatabase()
    console.log("Getting streak activity for user:", userId)
    
    const streaks = await db`
      SELECT * FROM streak_activity
      WHERE user_id = ${userId}
      ORDER BY date ASC
    `
    
    console.log(`Retrieved ${streaks.length} streak records`)
    return streaks as StreakActivity[]
  }

  static async updateStreakActivity(userId: string, date: string): Promise<void> {
    const db = this.checkDatabase()
    console.log("Updating streak activity for user:", userId, "date:", date)
    
    await db`
      INSERT INTO streak_activity (user_id, date, videos_watched)
      VALUES (${userId}, ${date}, 1)
      ON CONFLICT (user_id, date) DO UPDATE SET
        videos_watched = streak_activity.videos_watched + 1
    `
    
    console.log("Streak activity updated successfully")
  }

  // Bookmarks
  static async getBookmarks(userId: string): Promise<any[]> {
    const db = this.checkDatabase()
    console.log("Getting bookmarks for user:", userId)
    
    const bookmarks = await db`
      SELECT 
        up.id,
        up.user_id,
        up.video_id,
        up.bookmarked,
        up.notes,
        up.updated_at,
        json_build_object(
          'id', v.id,
          'video_id', v.video_id,
          'title', v.title,
          'thumbnail', v.thumbnail,
          'duration', v.duration,
          'courses', json_build_object(
            'id', c.id,
            'title', c.title
          )
        ) as videos
      FROM user_progress up
      INNER JOIN videos v ON up.video_id = v.video_id
      INNER JOIN courses c ON v.course_id = c.id
      WHERE up.user_id = ${userId} AND up.bookmarked = true
    `
    
    console.log(`Retrieved ${bookmarks.length} bookmarks`)
    return bookmarks
  }

  // Notes
  static async getNotes(userId: string): Promise<any[]> {
    const db = this.checkDatabase()
    console.log("Getting notes for user:", userId)
    
    const notes = await db`
      SELECT 
        up.id,
        up.user_id,
        up.video_id,
        up.bookmarked,
        up.notes,
        up.updated_at,
        json_build_object(
          'id', v.id,
          'video_id', v.video_id,
          'title', v.title,
          'thumbnail', v.thumbnail,
          'duration', v.duration,
          'courses', json_build_object(
            'id', c.id,
            'title', c.title
          )
        ) as videos
      FROM user_progress up
      INNER JOIN videos v ON up.video_id = v.video_id
      INNER JOIN courses c ON v.course_id = c.id
      WHERE up.user_id = ${userId} AND up.notes IS NOT NULL AND up.notes != ''
    `
    
    console.log(`Retrieved ${notes.length} notes`)
    return notes
  }

  // Video Timestamps
  static async getVideoTimestamp(userId: string, videoId: string): Promise<VideoTimestamp | null> {
    const db = this.checkDatabase()
    console.log("Getting video timestamp for user:", userId, "video:", videoId)
    
    const result = await db`
      SELECT * FROM video_timestamps
      WHERE user_id = ${userId} AND video_id = ${videoId}
    `
    
    if (result.length === 0) {
      return null
    }
    
    console.log("Retrieved timestamp:", result[0].timestamp)
    return result[0] as VideoTimestamp
  }

  static async updateVideoTimestamp(
    userId: string,
    videoId: string,
    timestamp: number,
    duration: number,
  ): Promise<void> {
    const db = this.checkDatabase()
    console.log("Updating video timestamp:", { userId, videoId, timestamp, duration })
    
    await db`
      INSERT INTO video_timestamps (user_id, video_id, timestamp, duration)
      VALUES (${userId}, ${videoId}, ${timestamp}, ${duration})
      ON CONFLICT (user_id, video_id) DO UPDATE SET
        timestamp = EXCLUDED.timestamp,
        duration = EXCLUDED.duration,
        updated_at = NOW()
    `
    
    console.log("Video timestamp updated successfully")
  }

  // Alias for backward compatibility
  static async saveVideoTimestamp(
    userId: string,
    videoId: string,
    timestamp: number,
    duration: number,
  ): Promise<void> {
    return this.updateVideoTimestamp(userId, videoId, timestamp, duration)
  }

  // Course Deletion with Related Data
  static async deleteCourseWithRelatedData(courseId: string, userId: string): Promise<void> {
    const db = this.checkDatabase()
    console.log("Deleting course and related data:", courseId)
    
    try {
      // Get all videos for this course
      const videos = await this.getVideos(courseId)
      const videoIds = videos.map((v) => v.video_id)
      
      if (videoIds.length > 0) {
        // Delete user progress for all videos in this course
        await db`
          DELETE FROM user_progress
          WHERE user_id = ${userId} AND video_id = ANY(${videoIds})
        `
        
        // Delete video timestamps for all videos in this course
        await db`
          DELETE FROM video_timestamps
          WHERE user_id = ${userId} AND video_id = ANY(${videoIds})
        `
      }
      
      // Delete all videos for this course
      await db`
        DELETE FROM videos WHERE course_id = ${courseId}
      `
      
      // Finally delete the course (ensure user can only delete their own courses)
      await db`
        DELETE FROM courses WHERE id = ${courseId} AND user_id = ${userId}
      `
      
      console.log("Course and all related data deleted successfully")
    } catch (error) {
      console.error("Error in deleteCourseWithRelatedData:", error)
      throw error
    }
  }
}
