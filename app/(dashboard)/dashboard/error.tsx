"use client"

import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-[#a1a1aa] text-sm">
        {error.message || "Something went wrong loading the dashboard."}
      </p>
      <Button
        onClick={reset}
        className="h-9 bg-indigo-500 hover:bg-indigo-600 text-white text-sm"
      >
        Try again
      </Button>
    </div>
  )
}
