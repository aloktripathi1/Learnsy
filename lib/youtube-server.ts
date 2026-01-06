// Server-side YouTube API functions

// Simple in-memory cache for playlist data (expires after 5 minutes)
const playlistCache = new Map<string, { data: YouTubePlaylist; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Utility to clear cache (useful for testing)
export function clearPlaylistCache() {
  playlistCache.clear()
  console.log("Playlist cache cleared")
}

// Utility to clear expired cache entries
export function cleanExpiredCache() {
  const now = Date.now()
  let cleaned = 0
  for (const [key, value] of playlistCache.entries()) {
    if (now - value.timestamp >= CACHE_DURATION) {
      playlistCache.delete(key)
      cleaned++
    }
  }
  if (cleaned > 0) {
    console.log(`Cleaned ${cleaned} expired cache entries`)
  }
}

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  position: number
}

export interface YouTubePlaylist {
  id: string
  title: string
  thumbnail: string
  videos: YouTubeVideo[]
}

export function extractPlaylistId(url: string): string | null {
  console.log("Extracting playlist ID from URL:", url)

  if (!url || typeof url !== "string") {
    console.log("Invalid URL provided")
    return null
  }

  // Clean the URL
  const cleanUrl = url.trim()

  // Handle different YouTube playlist URL formats
  const patterns = [
    // Standard playlist URLs
    /[&?]list=([a-zA-Z0-9_-]+)/,
    // Direct playlist URLs
    /playlist\?list=([a-zA-Z0-9_-]+)/,
    // Full YouTube URLs
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
    // YouTube short URLs with playlist
    /youtu\.be\/.*[?&]list=([a-zA-Z0-9_-]+)/,
    // Watch URLs with playlist
    /youtube\.com\/watch\?.*list=([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1]) {
      const playlistId = match[1]
      console.log("Extracted playlist ID:", playlistId)

      // Validate playlist ID format (YouTube playlist IDs are typically 34 characters)
      if (playlistId.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(playlistId)) {
        return playlistId
      }
    }
  }

  console.log("No valid playlist ID found in URL")
  return null
}

export function validatePlaylistUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { isValid: false, error: "Please enter a URL" }
  }

  const cleanUrl = url.trim()

  if (!cleanUrl) {
    return { isValid: false, error: "Please enter a URL" }
  }

  // Check if it's a YouTube URL
  if (!cleanUrl.includes("youtube.com") && !cleanUrl.includes("youtu.be")) {
    return { isValid: false, error: "Please enter a valid YouTube URL" }
  }

  // Check if it contains a playlist parameter
  if (!cleanUrl.includes("list=")) {
    return {
      isValid: false,
      error:
        "URL must contain a playlist (list= parameter). Make sure you're using a playlist URL, not a single video URL.",
    }
  }

  const playlistId = extractPlaylistId(cleanUrl)
  if (!playlistId) {
    return { isValid: false, error: "Could not extract playlist ID from URL. Please check the URL format." }
  }

  return { isValid: true }
}

export async function fetchPlaylistData(playlistId: string): Promise<YouTubePlaylist> {
  // Check cache first
  const cached = playlistCache.get(playlistId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached data for playlist: ${playlistId}`)
    return cached.data
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key not configured")
    throw new Error("YouTube API key not configured on server")
  }

  console.log(`Fetching playlist data for ID: ${playlistId}`)

  try {
    // Fetch playlist details first
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    console.log("Fetching playlist details...")

    const playlistResponse = await fetch(playlistUrl, {
      headers: {
        Accept: "application/json",
      },
    })

    if (!playlistResponse.ok) {
      const errorText = await playlistResponse.text()
      console.error("Playlist API error:", playlistResponse.status, errorText)

      // Handle specific YouTube API errors
      if (playlistResponse.status === 403) {
        if (errorText.includes("quotaExceeded")) {
          throw new Error("YouTube API quota exceeded. Please try again later.")
        }
        if (errorText.includes("keyInvalid")) {
          throw new Error("Invalid YouTube API key configuration.")
        }
        throw new Error("Access denied. The playlist might be private or the API key is invalid.")
      }

      if (playlistResponse.status === 404) {
        throw new Error("Playlist not found. Please check the URL and make sure the playlist exists.")
      }

      if (playlistResponse.status === 400) {
        throw new Error("Invalid playlist ID format. Please check the URL.")
      }

      throw new Error(`YouTube API error (${playlistResponse.status}): ${errorText}`)
    }

    const playlistData = await playlistResponse.json()
    console.log("Playlist API response received")

    if (!playlistData.items || playlistData.items.length === 0) {
      console.error("Playlist not found or is private")
      throw new Error("Playlist not found. It might be private, deleted, or the URL is incorrect.")
    }

    const playlist = playlistData.items[0]
    console.log("Playlist found:", playlist.snippet?.title)

    // Fetch all playlist items (handle pagination properly)
    const allVideos: any[] = []
    let nextPageToken = ""
    let pageCount = 0
    const maxPages = 50 // Increased limit to handle very large playlists

    console.log("Starting to fetch all playlist items...")

    do {
      pageCount++
      if (pageCount > maxPages) {
        console.warn(`Reached maximum page limit (${maxPages}), stopping pagination`)
        break
      }

      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50${nextPageToken ? `&pageToken=${nextPageToken}` : ""}&key=${YOUTUBE_API_KEY}`
      console.log(
        `Fetching playlist items page ${pageCount}${nextPageToken ? ` (token: ${nextPageToken.substring(0, 10)}...)` : ""}`,
      )

      const itemsResponse = await fetch(itemsUrl, {
        headers: {
          Accept: "application/json",
        },
      })

      if (!itemsResponse.ok) {
        const errorText = await itemsResponse.text()
        console.error("Playlist items API error:", itemsResponse.status, errorText)

        if (itemsResponse.status === 403) {
          if (errorText.includes("quotaExceeded")) {
            throw new Error("YouTube API quota exceeded. Please try again later.")
          }
          throw new Error("Access denied while fetching playlist videos.")
        }

        throw new Error(`Failed to fetch playlist videos (${itemsResponse.status}): ${errorText}`)
      }

      const itemsData = await itemsResponse.json()

      if (itemsData.items && itemsData.items.length > 0) {
        // Filter out private/deleted videos during fetch
        const validItems = itemsData.items.filter((item: any) => {
          const title = item.snippet?.title
          const videoId = item.snippet?.resourceId?.videoId
          return videoId && title && title !== "Private video" && title !== "Deleted video"
        })

        allVideos.push(...validItems)
        console.log(
          `Page ${pageCount}: Added ${validItems.length} valid videos (${itemsData.items.length - validItems.length} skipped), total: ${allVideos.length}`,
        )
      } else {
        console.log(`Page ${pageCount}: No items found`)
      }

      nextPageToken = itemsData.nextPageToken || ""
    } while (nextPageToken && pageCount < maxPages)

    console.log(`Pagination complete. Total videos found: ${allVideos.length} across ${pageCount} pages`)

    if (allVideos.length === 0) {
      throw new Error("No videos found in this playlist. The playlist might be empty or all videos might be private.")
    }

    // Get video details for durations (in batches of 50)
    const videoDetailsMap = new Map()
    const validVideoIds = allVideos.map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean)

    if (validVideoIds.length === 0) {
      throw new Error("No valid videos found in playlist.")
    }

    console.log(`Fetching details for ${validVideoIds.length} videos...`)

    // Process videos in batches of 50 (YouTube API limit)
    const batchCount = Math.ceil(validVideoIds.length / 50)
    console.log(`Fetching details in ${batchCount} batches...`)
    
    // Process batches in parallel (max 3 concurrent requests)
    const batchPromises: Promise<void>[] = []
    const maxConcurrent = 3
    
    for (let i = 0; i < validVideoIds.length; i += 50) {
      const batchPromise = (async (batchIndex: number) => {
        const batch = validVideoIds.slice(batchIndex, batchIndex + 50)
        const videoIds = batch.join(",")

        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`

        try {
          const videosResponse = await fetch(videosUrl, {
            headers: {
              Accept: "application/json",
            },
          })

          if (!videosResponse.ok) {
            const errorText = await videosResponse.text()
            
            if (videosResponse.status === 403 && errorText.includes("quotaExceeded")) {
              throw new Error("YouTube API quota exceeded. Please try again later.")
            }
            
            console.warn(`Failed to fetch video details for batch ${Math.floor(batchIndex / 50) + 1}, continuing...`)
            return
          }

          const videosData = await videosResponse.json()

          if (videosData.items) {
            videosData.items.forEach((video: any) => {
              videoDetailsMap.set(video.id, video)
            })
          }
        } catch (error) {
          console.warn(`Error fetching batch ${Math.floor(batchIndex / 50) + 1}:`, error)
        }
      })(i)
      
      batchPromises.push(batchPromise)
      
      // Wait for batch if we've reached max concurrent
      if (batchPromises.length >= maxConcurrent) {
        await Promise.all(batchPromises)
        batchPromises.length = 0
      }
    }
    
    // Wait for remaining batches
    if (batchPromises.length > 0) {
      await Promise.all(batchPromises)
    }

    console.log(`Retrieved details for ${videoDetailsMap.size}/${validVideoIds.length} videos`)

    // Create video objects
    const videos: YouTubeVideo[] = allVideos
      .map((item: any, index: number) => {
        const videoId = item.snippet?.resourceId?.videoId
        if (!videoId) {
          console.log("Skipping item with no videoId at position", index)
          return null
        }

        // Skip private/deleted videos
        if (item.snippet?.title === "Private video" || item.snippet?.title === "Deleted video") {
          console.log("Skipping private/deleted video at position", index)
          return null
        }

        const videoDetails = videoDetailsMap.get(videoId)
        const duration = videoDetails?.contentDetails?.duration
          ? formatDuration(videoDetails.contentDetails.duration)
          : "0:00"

        return {
          id: videoId,
          title: item.snippet?.title || "Untitled Video",
          thumbnail: getBestThumbnail(item.snippet?.thumbnails),
          duration,
          position: index,
        }
      })
      .filter(Boolean)

    if (videos.length === 0) {
      throw new Error("No accessible videos found in playlist. All videos might be private or deleted.")
    }

    console.log(`Successfully processed ${videos.length} videos`)

    const result = {
      id: playlistId,
      title: playlist.snippet?.title || "Untitled Playlist",
      thumbnail: getBestThumbnail(playlist.snippet?.thumbnails),
      videos,
    }

    // Cache the result
    playlistCache.set(playlistId, { data: result, timestamp: Date.now() })

    return result
  } catch (error) {
    console.error("Error fetching playlist data:", error)

    if (error instanceof Error) {
      // Re-throw known errors
      throw error
    }

    // Handle unknown errors
    throw new Error("Failed to fetch playlist data. Please check your internet connection and try again.")
  }
}

function getBestThumbnail(thumbnails: any): string {
  if (!thumbnails) {
    return "/placeholder.svg?height=180&width=320"
  }

  // Prefer higher quality thumbnails
  return (
    thumbnails.medium?.url || thumbnails.high?.url || thumbnails.default?.url || "/placeholder.svg?height=180&width=320"
  )
}

function formatDuration(duration: string): string {
  try {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return "0:00"

    const hours = Number.parseInt(match[1]?.replace("H", "") || "0")
    const minutes = Number.parseInt(match[2]?.replace("M", "") || "0")
    const seconds = Number.parseInt(match[3]?.replace("S", "") || "0")

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  } catch (error) {
    console.error("Error formatting duration:", duration, error)
    return "0:00"
  }
}
