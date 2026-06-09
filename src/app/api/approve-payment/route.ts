import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const { paymentId } = await req.json()

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("user_id")
    .eq("id", paymentId)
    .single()

  if (!payment) {
    return NextResponse.json({ error: "Not found" })
  }

  await supabaseAdmin
    .from("payments")
    .update({ status: "approved" })
    .eq("id", paymentId)

  await supabaseAdmin
    .from("users")
.update({
  is_paid: true,
  plan: "growth",
  subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
})
    .eq("id", payment.user_id)

  return NextResponse.json({ success: true })
}