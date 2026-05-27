"use server"

// Placeholder — replaced in Step 6 with Drizzle-based implementation
export async function checkPlaylistLimit(_userId?: string) {
  return {
    canImport: true,
    currentCount: 0,
    maxCount: 2,
    remaining: 2,
  }
}
