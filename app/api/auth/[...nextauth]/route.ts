// NextAuth v5 route handler stub.
// SessionProvider calls /api/auth/session here; without this file it 404s and
// bounces the user to /api/auth/error (which also doesn't exist → blank page).
//
// This stub returns an empty session so the client stays on the page.
// Replace with real NextAuth config when auth is fully wired up.

import { NextResponse } from "next/server"

export async function GET() {
  // Return an empty session — no user signed in, no redirect loop.
  return NextResponse.json({})
}

export async function POST() {
  return NextResponse.json({})
}
