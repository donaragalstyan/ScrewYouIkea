import { NextResponse } from "next/server"
import { getManualDetail } from "@/lib/manual-store"

interface ManualParams {
  params: { id: string }
}

export async function GET(_request: Request, { params }: ManualParams) {
  const manual = await getManualDetail(params.id)
  if (!manual) {
    return NextResponse.json({ error: "Manual not found" }, { status: 404 })
  }
  return NextResponse.json(manual)
}
