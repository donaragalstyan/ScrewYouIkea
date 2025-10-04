import { NextResponse } from "next/server"
import { listManualSummaries } from "@/lib/manual-store"

export async function GET() {
  const manuals = await listManualSummaries()
  return NextResponse.json(manuals)
}
