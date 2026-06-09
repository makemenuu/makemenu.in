import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, shop_name, email, is_paid, is_frozen, subscription_end")
    .eq("is_paid", true)
    .order("shop_name", { ascending: true })

  if (error) {
    console.error("Get managed users error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data || [] })
}