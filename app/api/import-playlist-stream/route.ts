// Placeholder — will be replaced in Step 6 with Drizzle + Upstash Redis implementation
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(_request: NextRequest) {
  return new Response(
    JSON.stringify({ error: "Import not yet configured. Complete setup steps first." }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  )
}
