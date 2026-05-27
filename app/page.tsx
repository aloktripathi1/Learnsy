"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Play,
  BookOpen,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
  Github,
  Menu,
  X,
  Sparkles,
} from "lucide-react"
import { useClerk } from "@clerk/nextjs"

const features = [
  {
    icon: BookOpen,
    title: "Structured Learning",
    description:
      "Transform YouTube playlists into organised courses with clear progress tracking and navigation.",
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description:
      "Monitor your learning with completion stats, streak calendars, and detailed analytics.",
  },
  {
    icon: Zap,
    title: "Distraction-Free",
    description:
      "Clean interface designed for deep focus, with note-taking, bookmarks, and keyboard shortcuts.",
  },
]

const benefits = [
  { title: "Progress Tracking",    desc: "Visual progress indicators and completion statistics" },
  { title: "Smart Notes",          desc: "Take notes linked to specific videos and topics" },
  { title: "Bookmarks",            desc: "Save important moments for quick reference" },
  { title: "Keyboard Shortcuts",   desc: "Navigate efficiently with keyboard controls" },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { redirectToSignIn } = useClerk()
  const handleSignIn = () => redirectToSignIn({ redirectUrl: "/dashboard" })

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-black/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
                <Zap className="h-4 w-4 text-white" fill="white" />
              </div>
              <span className="text-base font-bold tracking-tight">Learnsy</span>
            </div>

            <div className="hidden sm:block">
              <Button
                onClick={handleSignIn}
                className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium"
              >
                Sign in with Google
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>

            <button
              className="sm:hidden p-2 text-[#a1a1aa] hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="sm:hidden pb-4 border-t border-[#1a1a1a] pt-4">
              <Button
                onClick={handleSignIn}
                className="w-full h-10 bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
              >
                Sign in with Google
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400">
              Transform Your Learning Journey
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Learn smarter with
            <span className="block mt-1 text-indigo-400">YouTube Playlists</span>
          </h1>

          <p className="text-lg text-[#a1a1aa] mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform any YouTube playlist into a structured learning experience.
            Track progress, take notes, and stay focused without distractions.
          </p>

          <Button
            onClick={handleSignIn}
            size="lg"
            className="h-12 px-8 bg-indigo-500 hover:bg-indigo-600 text-white text-base font-medium shadow-lg shadow-indigo-500/20"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* App mockup */}
          <div className="mt-16 relative max-w-3xl mx-auto">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#1a1a1a]">
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
                <div className="w-3 h-3 rounded-full bg-[#1a1a1a]" />
                <div className="flex-1 bg-[#1a1a1a] rounded h-5 ml-4" />
              </div>
              {/* Content */}
              <div className="grid grid-cols-3 gap-0">
                {/* Video area */}
                <div className="col-span-2 p-4 space-y-3 border-r border-[#1a1a1a]">
                  <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Play className="h-6 w-6 text-indigo-400 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
                  <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                  <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-3/4 rounded-full" />
                  </div>
                </div>
                {/* Playlist */}
                <div className="p-3 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex gap-2 p-1.5 rounded ${i === 2 ? "bg-indigo-500/10 border border-indigo-500/20" : ""}`}
                    >
                      <div className="w-8 h-6 bg-[#1a1a1a] rounded shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className={`h-2 ${i === 2 ? "bg-indigo-400/30" : "bg-[#1a1a1a]"} rounded`} />
                        <div className="h-2 bg-[#1a1a1a] rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Everything you need to learn effectively
            </h2>
            <p className="text-[#a1a1aa] text-base max-w-xl mx-auto">
              Professional-grade tools for serious learners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 hover:border-[#2a2a2a] transition-colors duration-150"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                  Why Choose Learnsy
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                  Built for serious learners
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Take control of your learning journey with professional-grade tools.
                </p>
              </div>
              <div className="space-y-3">
                {benefits.map((b) => (
                  <div
                    key={b.title}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors duration-150"
                  >
                    <CheckCircle className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">{b.title}</p>
                      <p className="text-xs text-[#52525b] mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini dashboard preview */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Course Progress</span>
                <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  75% Complete
                </span>
              </div>
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                <Play className="h-10 w-10 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#a1a1aa]">
                  <span>Videos Completed</span>
                  <span className="font-semibold text-white">12 of 16</span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-3/4" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Streak", value: "7 days" },
                  { label: "Notes",  value: "18" },
                  { label: "Saved",  value: "5" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2 rounded-lg bg-black border border-[#1a1a1a]">
                    <div className="text-[10px] text-[#52525b]">{s.label}</div>
                    <div className="text-sm font-bold text-white">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to transform your learning?
          </h2>
          <p className="text-[#a1a1aa] text-base mb-8 leading-relaxed">
            Join learners who have already improved their study habits with Learnsy.
          </p>
          <Button
            onClick={handleSignIn}
            size="lg"
            className="h-12 px-8 bg-indigo-500 hover:bg-indigo-600 text-white text-base font-medium shadow-lg shadow-indigo-500/20"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-[#1a1a1a] text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500">
              <Zap className="h-3.5 w-3.5 text-white" fill="white" />
            </div>
            <span className="text-sm font-bold">Learnsy</span>
          </div>
          <p className="text-xs text-[#52525b] mb-4">
            © 2025 Learnsy. Built for focused learning.
          </p>
          <a
            href="https://github.com/aloktripathi1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            Made by Alok Tripathi
          </a>
        </div>
      </footer>
    </div>
  )
}
