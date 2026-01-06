import { NextRequest } from 'next/server'
import { extractPlaylistId, fetchPlaylistData, validatePlaylistUrl } from "@/lib/youtube-server"
import { DatabaseService } from "@/lib/database"
import { ensureUserExists } from "@/lib/ensure-user"

export const dynamic = 'force-dynamic'

const MAX_PLAYLISTS_PER_USER = 4

// Helper to send progress updates
function sendProgress(controller: ReadableStreamDefaultController, message: string, progress: number) {
  const data = JSON.stringify({ message, progress, type: 'progress' })
  controller.enqueue(`data: ${data}\n\n`)
}

function sendError(controller: ReadableStreamDefaultController, error: string) {
  const data = JSON.stringify({ error, type: 'error' })
  controller.enqueue(`data: ${data}\n\n`)
}

function sendSuccess(controller: ReadableStreamDefaultController, result: any) {
  const data = JSON.stringify({ ...result, type: 'success' })
  controller.enqueue(`data: ${data}\n\n`)
}

export async function POST(request: NextRequest) {
  // Parse request body first
  let playlistUrl: string
  try {
    const body = await request.json()
    playlistUrl = body.playlistUrl
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      try {
        sendProgress(controller, 'Verifying authentication...', 5)
        
        // Ensure user exists in database
        const userId = await ensureUserExists()
        
        if (!userId) {
          sendError(controller, "Unauthorized")
          controller.close()
          return
        }
        
        sendProgress(controller, 'Validating playlist URL...', 10)

        // Validate inputs
        if (!playlistUrl) {
          sendError(controller, "Missing playlist URL. Please try again.")
          controller.close()
          return
        }

        // Check if YouTube API key is configured
        if (!process.env.YOUTUBE_API_KEY) {
          sendError(controller, "YouTube API is not configured on the server.")
          controller.close()
          return
        }

        // Validate URL format
        const urlValidation = validatePlaylistUrl(playlistUrl)
        if (!urlValidation.isValid) {
          sendError(controller, urlValidation.error || "Invalid playlist URL format.")
          controller.close()
          return
        }

        // Extract playlist ID
        const playlistId = extractPlaylistId(playlistUrl)
        if (!playlistId) {
          sendError(controller, "Could not extract playlist ID from URL.")
          controller.close()
          return
        }

        sendProgress(controller, 'Checking playlist limit...', 20)

        // Check limit and existing courses in one query
        const existingCourses = await DatabaseService.getCourses(userId)

        if (existingCourses.length >= MAX_PLAYLISTS_PER_USER) {
          sendError(controller, "Limit reached. Complete or delete a playlist to import more.")
          controller.close()
          return
        }

        // Check if course already exists
        const existingCourse = existingCourses.find((course) => course.playlist_id === playlistId)
        if (existingCourse) {
          sendError(controller, `This playlist "${existingCourse.title}" has already been imported.`)
          controller.close()
          return
        }

        sendProgress(controller, 'Fetching playlist from YouTube...', 30)

        // Fetch playlist data from YouTube
        const playlistData = await fetchPlaylistData(playlistId)

        if (!playlistData.videos || playlistData.videos.length === 0) {
          sendError(controller, "This playlist appears to be empty or all videos are private/deleted.")
          controller.close()
          return
        }

        sendProgress(controller, `Found ${playlistData.videos.length} videos. Creating course...`, 60)

        // Create course in database
        const courseData = {
          user_id: userId,
          playlist_id: playlistId,
          title: playlistData.title || "Untitled Playlist",
          thumbnail: playlistData.thumbnail || "",
          video_count: playlistData.videos.length,
        }

        const course = await DatabaseService.createCourse(courseData)

        sendProgress(controller, 'Importing videos to database...', 70)

        // Create videos in database (using optimized bulk insert)
        const videos = playlistData.videos.map((video) => ({
          course_id: course.id,
          video_id: video.id,
          title: video.title || "Untitled Video",
          thumbnail: video.thumbnail || "",
          duration: video.duration || "0:00",
          position: video.position,
        }))

        const createdVideos = await DatabaseService.createVideos(videos)

        sendProgress(controller, 'Import complete!', 100)

        // Send success message
        sendSuccess(controller, {
          success: true,
          course: {
            ...course,
            videoCount: createdVideos.length,
          },
          message: `Successfully imported "${playlistData.title}" with ${createdVideos.length} videos!`,
        })

        controller.close()
      } catch (error) {
        console.error("Import error:", error)
        
        let errorMessage = "An unexpected error occurred."
        if (error instanceof Error) {
          errorMessage = error.message
        }
        
        sendError(controller, errorMessage)
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
