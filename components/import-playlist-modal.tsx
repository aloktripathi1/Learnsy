"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlaylistUrlInput } from "@/components/playlist-url-input"
import { Plus, AlertCircle, CheckCircle, X } from "lucide-react"
import type { Course } from "@/types"
import { MAX_PLAYLISTS_FREE } from "@/lib/config"

interface ImportPlaylistModalProps {
  onSuccess?: (course?: Course) => void | Promise<void>
  trigger?: React.ReactNode
  playlistLimit?: {
    canImport: boolean
    currentCount: number
    maxCount: number
    remaining: number
  }
}

export function ImportPlaylistModal({
  onSuccess,
  trigger,
  playlistLimit = { canImport: true, currentCount: 0, maxCount: MAX_PLAYLISTS_FREE, remaining: MAX_PLAYLISTS_FREE },
}: ImportPlaylistModalProps) {
  const { data: session } = useSession()
  const user = session?.user
  const [isOpen, setIsOpen] = useState(false)
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState("")
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isOpen])

  const handleImport = async () => {
    if (!playlistUrl.trim() || !user || !playlistLimit.canImport) {
      return
    }

    setIsImporting(true)
    setImportError(null)
    setImportSuccess(null)
    setImportProgress(0)
    setProgressMessage("Starting import...")

    try {
      // Use streaming API for real-time progress
      const response = await fetch("/api/import-playlist-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl }),
      })

      if (!response.ok || !response.body) {
        throw new Error("Failed to start import")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let result: any = null
      let buffer = ""

      const processEvent = (eventChunk: string) => {
        const lines = eventChunk.split(/\r?\n/)

        for (const rawLine of lines) {
          const line = rawLine.trim()
          if (!line.startsWith("data: ")) continue

          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === "progress") {
              setImportProgress(data.progress)
              setProgressMessage(data.message)
            } else if (data.type === "success") {
              result = data
            } else if (data.type === "error") {
              throw new Error(data.error)
            }
          } catch (eventError) {
            console.warn("Failed to parse import event", eventError)
          }
        }
      }

      while (true) {
        const { done, value } = await reader.read()

        if (value) {
          const chunk = decoder.decode(value, { stream: !done })
          buffer += chunk.replace(/\r/g, "")
          const parts = buffer.split("\n\n")
          buffer = parts.pop() ?? ""

          for (const part of parts) {
            if (part.trim()) {
              processEvent(part)
            }
          }
        }

        if (done) break
      }

      if (buffer.trim()) {
        processEvent(buffer)
      }

      if (result?.success) {
        setImportSuccess(
          result.message ||
            `Successfully imported "${result.course?.title}" with ${result.course?.videoCount || 0} videos!`,
        )

        // Call onSuccess immediately to refresh parent with latest course data
        if (onSuccess) {
          try {
            await Promise.resolve(onSuccess(result.course as Course))
          } catch (callbackError) {
            console.error("Error in onSuccess callback:", callbackError)
          }
        }

        // Broadcast to any listeners (e.g., other tabs/pages)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("coursesUpdated", { detail: result.course as Course }))
        }
        
        // Close modal after brief success message
        setTimeout(() => {
          setPlaylistUrl("")
          setImportError(null)
          setImportSuccess(null)
          setImportProgress(0)
          setProgressMessage("")
          setIsOpen(false)
        }, 1500)
      }
    } catch (error) {
      console.error("Import error:", error)
      setImportError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
      setImportSuccess(null)
      setImportProgress(0)
      setProgressMessage("")
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    if (isImporting) return // Prevent closing while importing

    setPlaylistUrl("")
    setImportError(null)
    setImportSuccess(null)
    setImportProgress(0)
    setProgressMessage("")
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Close with Escape (unless importing)
    if (e.key === "Escape" && !isImporting) {
      e.preventDefault()
      handleClose()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isImporting) {
      handleClose()
    }
  }

  const modalContent = isOpen ? (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content modal-content-import" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold enhanced-heading">
                <Plus className="h-5 w-5 inline mr-2" />
                Import YouTube Playlist
              </h2>
              <p className="text-sm text-muted-foreground mt-1 enhanced-text">
                Add a YouTube playlist to your courses ({playlistLimit.currentCount}/{playlistLimit.maxCount} used)
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} disabled={isImporting} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <PlaylistUrlInput
            value={playlistUrl}
            onChange={setPlaylistUrl}
            onImport={handleImport}
            isImporting={isImporting}
            limitReached={!playlistLimit.canImport}
            currentCount={playlistLimit.currentCount}
            maxCount={playlistLimit.maxCount}
          />

          {/* Import progress */}
          {isImporting && (
            <div className="space-y-2 p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-400 font-medium">{progressMessage}</span>
                <span className="text-indigo-500">{importProgress}%</span>
              </div>
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success */}
          {importSuccess && (
            <div className="flex items-start gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-400">{importSuccess}</p>
            </div>
          )}

          {/* Error */}
          {importError && (
            <div className="flex items-start gap-2 p-3 bg-red-950/30 rounded-lg border border-red-900/40">
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-400">Import Failed</p>
                <p className="text-xs text-red-400/80 mt-0.5">{importError}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-[#52525b] space-y-2 p-3 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a]">
            <p className="font-medium text-[#a1a1aa]">How to import a playlist:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to YouTube and find the playlist you want to study</li>
              <li>Copy the playlist URL from your browser&rsquo;s address bar</li>
              <li>Paste the URL in the field above and click Import</li>
            </ol>
            <p className="mt-1 text-[#52525b]">
              Playlist must be public or unlisted.
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {trigger ? (
        <div 
          onClick={() => {
            if (playlistLimit.canImport) {
              setIsOpen(true)
            } else {
              // Show alert if limit is reached
              alert(`You've reached the maximum limit of ${playlistLimit.maxCount} playlists. Delete an existing course to import a new one.`)
            }
          }}
          className={!playlistLimit.canImport ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        >
          {trigger}
        </div>
      ) : (
        <Button 
          onClick={() => {
            if (playlistLimit.canImport) {
              setIsOpen(true)
            } else {
              alert(`You've reached the maximum limit of ${playlistLimit.maxCount} playlists. Delete an existing course to import a new one.`)
            }
          }}
          className="enhanced-button"
          variant={!playlistLimit.canImport ? "secondary" : "default"}
        >
          <Plus className="h-4 w-4 mr-2" />
          Import Playlist
        </Button>
      )}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  )
}

// Default export for compatibility
export default ImportPlaylistModal
