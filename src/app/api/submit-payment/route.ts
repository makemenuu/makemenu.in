import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const { userId, utr, amount } = await req.json()

  // ✅ Fetch shop_name from users table
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users")
    .select("shop_name")
    .eq("id", userId)
    .single()

  if (userError) {
    console.error("User fetch error:", userError.message)
  }

  const clientName = userData?.shop_name || "Unknown"

  const { error } = await supabaseAdmin.from("payments").insert({
    user_id: userId,
    utr,
    amount,
    status: "pending",
    client_name: clientName,  // ✅ saved from shop_name
    plan_type: "Growth",      // ✅ hardcoded since you only have one plan
  })

  if (error) {
    console.error("Insert error:", error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}