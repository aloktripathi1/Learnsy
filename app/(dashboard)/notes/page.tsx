"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Search, Edit3, Trash2, Play, Clock, Check } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { getNotesAction, updateProgressAction } from "@/app/actions/courses"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface NoteItem {
  id: string
  video_id: string
  notes: string
  updated_at: string
  videos: {
    id: string
    video_id: string
    title: string
    thumbnail: string
    duration: string
    courses: {
      id: string
      title: string
    }
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function NoteSkeleton() {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
        <div className="flex gap-1 shrink-0">
          <div className="skeleton h-7 w-7 rounded" />
          <div className="skeleton h-7 w-7 rounded" />
        </div>
      </div>
      <div className="skeleton h-16 w-full rounded" />
    </div>
  )
}

export default function NotesPage() {
  
  const { user } = useAuth()
  const router = useRouter()

  const [notes, setNotes]             = useState<NoteItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [savingId, setSavingId]       = useState<string | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)

  const loadNotes = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      const data = await getNotesAction()
      const valid = (data ?? [])
        .filter((n) => n.notes?.trim() && n.videos)
        .map((n) => ({
          ...n,
          videos: Array.isArray(n.videos) ? n.videos[0] : n.videos,
        })) as NoteItem[]
      setNotes(valid)
    } catch {
      setError("Couldn't load notes.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadNotes()
  }, [user?.id, loadNotes])

  useEffect(() => {
    const handler = () => loadNotes()
    window.addEventListener("notesUpdated", handler)
    return () => window.removeEventListener("notesUpdated", handler)
  }, [loadNotes])

  const startEdit = (note: NoteItem) => {
    setEditingId(note.id)
    setEditContent(note.notes)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const saveNote = async (note: NoteItem, content: string = editContent) => {
    if (!user) return
    setSavingId(note.id)
    try {
      await updateProgressAction({ video_id: note.video_id, notes: content })
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, notes: content } : n)),
      )
      setEditingId(null)
      setEditContent("")
      window.dispatchEvent(new CustomEvent("notesUpdated"))
      toast.success("Note saved")
    } catch {
      toast.error("Couldn't save note.")
    } finally {
      setSavingId(null)
    }
  }

  const deleteNote = async (note: NoteItem) => {
    if (!user) return
    // Optimistic
    setNotes((prev) => prev.filter((n) => n.id !== note.id))
    try {
      await updateProgressAction({ video_id: note.video_id, notes: "" })
      window.dispatchEvent(new CustomEvent("notesUpdated"))
      toast.success("Note deleted")
    } catch {
      setNotes((prev) => [...prev, note])
      toast.error("Couldn't delete note.")
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const filtered = searchQuery.trim()
    ? notes.filter(
        (n) =>
          n.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.videos.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.videos.courses.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : notes

  const grouped = filtered.reduce<Record<string, NoteItem[]>>((acc, n) => {
    if (!n.videos?.courses) return acc
    const key = n.videos.courses.title ?? "Unknown Course"
    acc[key] = acc[key] ?? []
    acc[key].push(n)
    return acc
  }, {})

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full space-y-6 p-4 md:p-8 pb-24 md:pb-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notes</h1>
        <p className="text-[#a1a1aa] text-sm mt-1">
          Your learning notes organised by course
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525b]" />
        <Input
          placeholder="Search notes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-[#0a0a0a] border-[#1a1a1a] text-white placeholder:text-[#52525b] focus:border-indigo-500/50 text-sm"
        />
      </div>

      {/* Count */}
      {!loading && !error && (
        <p className="text-xs text-[#52525b]">
          {filtered.length} note{filtered.length !== 1 ? "s" : ""} ·{" "}
          {Object.keys(grouped).length} course
          {Object.keys(grouped).length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/30 border border-red-900/40">
          <span className="text-sm text-red-400">{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadNotes}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-7 px-2 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <NoteSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            className="w-12 h-12 text-[#2a2a2a] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-[#52525b] text-sm mb-4">
            {notes.length === 0
              ? "No notes yet. Take notes while studying to capture key insights."
              : "No notes match your search."}
          </p>
          {notes.length === 0 && (
            <Button
              onClick={() => router.push("/courses")}
              className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
            >
              Start Learning
            </Button>
          )}
        </div>
      )}

      {/* Grouped notes */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).map(([courseTitle, courseNotes]) => (
            <div key={courseTitle}>
              <h2 className="text-xs font-semibold text-[#52525b] uppercase tracking-wider mb-3">
                {courseTitle}
              </h2>
              <div className="space-y-2">
                {courseNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors duration-150"
                  >
                    {/* Note header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-1">
                          {note.videos.title}
                        </p>
                        <p className="text-xs text-[#52525b] flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(note.updated_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/study/${note.videos.courses.id}/${note.video_id}`)}
                          className="h-7 w-7 text-[#52525b] hover:text-white hover:bg-white/5"
                          title="Watch video"
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                        {editingId === note.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => saveNote(note)}
                              disabled={savingId === note.id}
                              className="h-7 w-7 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                              title="Save note"
                            >
                              {savingId === note.id ? (
                                <span className="loading-spinner h-3.5 w-3.5" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEdit}
                              className="h-7 w-7 text-[#52525b] hover:text-white hover:bg-white/5"
                              title="Cancel"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(note)}
                              className="h-7 w-7 text-[#52525b] hover:text-white hover:bg-white/5"
                              title="Edit note"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNote(note)}
                              className="h-7 w-7 text-[#52525b] hover:text-red-400 hover:bg-red-950/30"
                              title="Delete note"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Note content */}
                    {editingId === note.id ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onBlur={() => saveNote(note, editContent)}
                        autoFocus
                        className="min-h-[100px] bg-black border-[#1a1a1a] text-white placeholder:text-[#52525b] text-sm focus:border-indigo-500/50 resize-none"
                        onKeyDown={(e) => {
                          if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                            e.preventDefault()
                            saveNote(note)
                          }
                          if (e.key === "Escape") cancelEdit()
                        }}
                      />
                    ) : (
                      <div
                        className={cn(
                          "text-sm text-[#a1a1aa] whitespace-pre-wrap leading-relaxed cursor-text",
                          "hover:text-white transition-colors duration-150",
                        )}
                        onClick={() => startEdit(note)}
                      >
                        {note.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
