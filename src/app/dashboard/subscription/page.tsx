"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function SubscriptionPage() {
  const [daysLeft, setDaysLeft] = useState(0)
  const [percentRemaining, setPercentRemaining] = useState(0)
  const [isPaid, setIsPaid] = useState(false)
  const [plan, setPlan] = useState("free")
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!dbUser) return

      const now = new Date()
      const end = dbUser.is_paid && dbUser.subscription_end
        ? new Date(dbUser.subscription_end)
        : new Date(dbUser.trial_end)

      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const remaining = Math.max(diff, 0)

      // ✅ Use dbUser.is_paid directly — don't read the stale isPaid state
      const total = dbUser.is_paid ? 30 : 40
      const percent = ((remaining / total) * 100).toFixed(1)

      setDaysLeft(remaining)
      setPercentRemaining(Number(percent))
      setIsPaid(dbUser.is_paid)
      setPlan(dbUser.plan)
    }

    loadUser()
    const interval = setInterval(loadUser, 5000)
    return () => clearInterval(interval)
  }, [])

  const totalDays = isPaid ? 30 : 40

  const freeFeatures = [
    "Create 1 Digital Menu",
    "Add up to 20 items",
    "QR Code generation",
    "Mobile-friendly menu view",
  ]

  const growthFeatures = [
    "Unlimited Menus",
    "Unlimited Items",
    "Custom Branding (Logo + Colors)",
    "Premium Templates (Good designs)",
    "QR Code (Download + Print)",
  ]

  // ✅ Reusable Active badge component
  const ActiveBadge = () => (
    <div style={{
      position: "absolute",
      top: "-18px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#22c55e",
      color: "#fff",
      fontWeight: 800,
      fontSize: "15px",
      padding: "6px 28px",
      borderRadius: "999px",
      whiteSpace: "nowrap",
      letterSpacing: "0.3px",
    }}>
      Active
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "24px", fontFamily: "sans-serif" }}>

      {/* ── Paid Plan Banner ── */}
      {isPaid && (
        <div style={{
          backgroundColor: "#d1fae5",
          padding: "12px",
          borderRadius: "10px",
          marginBottom: "20px"
        }}>
          ✅ You are on Growth Plan
        </div>
      )}

      {/* ── Trial/Subscription Banner ── */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "14px",
        padding: "16px 24px",
        display: "flex",
        flexDirection: window.innerWidth < 768 ? "column" : "row",
        gap: "12px",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
      }}>
        <p style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#111" }}>
          {daysLeft} days left in your {isPaid ? "subscription" : "free trial"}
          <span style={{ fontWeight: 400, fontSize: "15px", color: "#6b7280" }}>
            {" "}({isPaid ? "30 day plan" : "40 day trial"})
          </span>
        </p>
        <span style={{
          backgroundColor: "#e5e7eb",
          color: "#374151",
          borderRadius: "999px",
          padding: "6px 16px",
          fontSize: "13px",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}>
          {percentRemaining}% Remaining
        </span>
      </div>

      {/* ── Controls Row ── */}
      <div style={{
        display: "flex",
        flexDirection: window.innerWidth < 768 ? "column" : "row",
        gap: "12px",
        alignItems: "center",
        marginBottom: "32px",
        flexWrap: "wrap",
      }}>
        <div style={{
          display: "flex",
          alignItems: "stretch",
          backgroundColor: "#dc2626",
          borderRadius: "12px",
          overflow: "hidden",
          color: "#fff",
          flexShrink: 0,
          height: "56px",
        }}>
          </div>

        <div style={{
          backgroundColor: "#FEF3C7",
          color: "#92400E",
          border: "1.5px solid #FDE68A",
          borderRadius: "999px",
          padding: "0 20px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          fontSize: "14px",
          fontWeight: 500,
          flexShrink: 0,
        }}>
          Paytm/GooglePay/PhonePe – UPI 
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => { if (!isPaid) router.push("/upgrade") }}
          disabled={isPaid}
          style={{
            backgroundColor: isPaid ? "#9ca3af" : "#f97316",
            cursor: isPaid ? "not-allowed" : "pointer",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "0 32px",
            height: "56px",
            fontSize: "17px",
            fontWeight: 800,
          }}
        >
          {isPaid ? "Already Subscribed" : "Upgrade to Growth"}
        </button>
      </div>

      {/* ── Plan Cards ── */}
<div
  style={{
    display: "grid",
    gap: "24px",
    alignItems: "start",
  }}
  className="grid-cols-1 md:grid-cols-2"
>

        {/* Free Plan */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          // ✅ Bold border only when this plan is active
          border: !isPaid ? "2.5px solid #111" : "2px solid #d1d5db",
          padding: "36px 32px 32px",
          position: "relative",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {/* ✅ Show Active badge only on the currently active plan */}
          {!isPaid && <ActiveBadge />}

          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "26px", fontWeight: 800, color: "#111" }}>Free plan</span>
            <span style={{ fontSize: "16px", color: "#6b7280", marginLeft: "8px" }}>(40 Days)</span>
          </div>
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", margin: "0 0 24px" }}>
            Start your digital menu journey
          </p>
          <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {freeFeatures.map((f) => (
              <li key={f} style={{ fontSize: "15px", color: "#1f2937", lineHeight: 1.5 }}>{f}</li>
            ))}
          </ul>
        </div>

        {/* Growth Plan */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          // ✅ Bold border only when this plan is active
          border: isPaid ? "2.5px solid #111" : "2px solid #d1d5db",
          padding: "36px 32px 32px",
          position: "relative",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {/* ✅ Show Active badge only on the currently active plan */}
          {isPaid && <ActiveBadge />}

          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "26px", fontWeight: 800, color: "#111" }}>Growth plan</span>
          </div>
          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", margin: "0 0 24px" }}>
            Grow your business with full features
          </p>
          <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {growthFeatures.map((f) => (
              <li key={f} style={{ fontSize: "15px", color: "#1f2937", lineHeight: 1.5 }}>
                <span style={{ marginRight: "6px" }}>✅</span>{f}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}