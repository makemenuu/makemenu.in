import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const { userId, freeze } = await req.json()

  if (!userId || typeof freeze !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ is_frozen: freeze })
    .eq("id", userId)

  if (error) {
    console.error("Freeze error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}