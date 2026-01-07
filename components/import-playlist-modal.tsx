"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlaylistUrlInput } from "@/components/playlist-url-input"
import { Plus, AlertCircle, CheckCircle, X } from "lucide-react"
import { useAuth } from "@/lib/auth"
import type { Course } from "@/lib/db"

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
  playlistLimit = { canImport: true, currentCount: 0, maxCount: 4, remaining: 4 },
}: ImportPlaylistModalProps) {
  const { user } = useAuth()
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

          {/* Show import progress */}
          {isImporting && (
            <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-400 font-medium">{progressMessage}</span>
                <span className="text-blue-600 dark:text-blue-500">{importProgress}%</span>
              </div>
              <div className="w-full bg-blue-100 dark:bg-blue-900/40 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Show import success */}
          {importSuccess && (
            <Alert className="enhanced-card border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-700 dark:text-green-400 enhanced-text">
                {importSuccess}
              </AlertDescription>
            </Alert>
          )}

          {/* Show import error */}
          {importError && (
            <Alert variant="destructive" className="enhanced-card">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm enhanced-heading">Import Failed</AlertTitle>
              <AlertDescription className="text-sm enhanced-text">{importError}</AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-2 p-4 bg-muted/30 rounded-lg">
            <p className="font-medium">How to import a playlist:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to YouTube and find the playlist you want to import</li>
              <li>Copy the playlist URL from your browser's address bar</li>
              <li>Paste the URL in the field above</li>
              <li>Click "Import Playlist" to add it to your courses</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              Note: The playlist must be public or unlisted. Private playlists cannot be imported.
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
