"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { saveVideoTimestampAction } from "@/app/actions/courses"

interface YouTubePlayerProps {
  videoId: string
  startTime?: number
  onProgress?: (currentTime: number, duration: number) => void
  onEnd?: () => void
  className?: string
}

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  seekTo(seconds: number, allowSeekAhead: boolean): void
  loadVideoById(videoId: string): void
  destroy(): void
}

export function YouTubePlayer({ videoId, startTime = 0, onProgress, onEnd, className }: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentVideoIdRef = useRef<string>(videoId)
  const [isReady, setIsReady] = useState(false)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timestampIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSavedTimeRef = useRef<number>(0)
  const isInitializingRef = useRef<boolean>(false)
  const startTimeRef = useRef<number>(startTime)

  const saveTimestamp = useCallback(async () => {
    const player = playerRef.current
    if (!player) return
    const currentTime = player.getCurrentTime()
    const duration = player.getDuration()
    if (currentTime > 0 && duration > 0 && Math.abs(currentTime - lastSavedTimeRef.current) >= 5) {
      lastSavedTimeRef.current = currentTime
      await saveVideoTimestampAction(currentVideoIdRef.current, Math.floor(currentTime), Math.floor(duration))
    }
  }, [])

  const stopTracking = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    if (timestampIntervalRef.current) clearInterval(timestampIntervalRef.current)
    progressIntervalRef.current = null
    timestampIntervalRef.current = null
  }, [])

  const startTracking = useCallback(() => {
    stopTracking()
    progressIntervalRef.current = setInterval(() => {
      const player = playerRef.current
      if (!player) return
      const currentTime = player.getCurrentTime()
      const duration = player.getDuration()
      if (duration > 0) onProgress?.(currentTime, duration)
    }, 1000)
    timestampIntervalRef.current = setInterval(saveTimestamp, 5000)
  }, [onProgress, saveTimestamp, stopTracking])

  const seekToResume = useCallback((seconds: number) => {
    if (seconds <= 10) return
    const attemptSeek = () => {
      const player = playerRef.current
      if (!player) return
      if (player.getPlayerState() >= 1) {
        player.seekTo(seconds, true)
        lastSavedTimeRef.current = seconds
      } else {
        setTimeout(attemptSeek, 500)
      }
    }
    setTimeout(attemptSeek, 1000)
  }, [])

  const initializePlayer = useCallback(() => {
    if (!containerRef.current || !window.YT?.Player || isInitializingRef.current) return
    isInitializingRef.current = true

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      width: "100%",
      height: "100%",
      playerVars: { rel: 0, modestbranding: 1, iv_load_policy: 3, enablejsapi: 1, origin: window.location.origin },
      events: {
        onReady: () => {
          setIsReady(true)
          isInitializingRef.current = false
          currentVideoIdRef.current = videoId
          seekToResume(startTimeRef.current)
        },
        onStateChange: (event: { data: number }) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            startTracking()
          } else {
            stopTracking()
            if (event.data === window.YT.PlayerState.PAUSED) saveTimestamp()
            if (event.data === window.YT.PlayerState.ENDED) {
              saveTimestamp()
              onEnd?.()
            }
          }
        },
        onError: () => { isInitializingRef.current = false },
      },
    })
  }, [videoId, seekToResume, startTracking, stopTracking, saveTimestamp, onEnd])

  useEffect(() => { startTimeRef.current = startTime }, [startTime])

  useEffect(() => {
    if (window.YT?.Player) {
      if (!playerRef.current) initializePlayer()
      return
    }
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const script = document.createElement("script")
      script.src = "https://www.youtube.com/iframe_api"
      script.async = true
      document.head.appendChild(script)
    }
    window.onYouTubeIframeAPIReady = () => {
      if (!playerRef.current) initializePlayer()
    }
  }, [initializePlayer])

  useEffect(() => {
    if (videoId !== currentVideoIdRef.current && playerRef.current && isReady) {
      stopTracking()
      saveTimestamp()
      playerRef.current.loadVideoById(videoId)
      currentVideoIdRef.current = videoId
      lastSavedTimeRef.current = 0
      seekToResume(startTimeRef.current)
    }
  }, [videoId, isReady, stopTracking, saveTimestamp, seekToResume])

  useEffect(() => {
    return () => {
      stopTracking()
      saveTimestamp()
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [stopTracking, saveTimestamp])

  return (
    <div className={`relative w-full aspect-video bg-black ${className ?? ""}`}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

export default YouTubePlayer
