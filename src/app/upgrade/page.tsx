  "use client";

  import { useEffect, useState } from "react"
  import { useRouter } from "next/navigation"
  import { supabase } from "@/lib/supabaseClient"

  export default function UpgradePage() {
    const [utr, setUtr] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    const upiLink = `upi://pay?pa=8680913379@ptsbi&pn=Makemenu&am=399&cu=INR`

    const router = useRouter()
    useEffect(() => {
    const checkPaidUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

          if (dbUser?.is_frozen) {
  router.replace("/frozen")
  return
}

      // ✅ ONLY redirect if subscription is ACTIVE
  if (dbUser?.is_paid && dbUser.subscription_end) {
    const subEnd = new Date(dbUser.subscription_end)
    const now = new Date()

    if (subEnd > now) {
      router.replace("/dashboard")
      return
    }
  }

  }

  checkPaidUser()
  }, [])


    const handleSubmit = async () => {
      if (utr.length < 10) {
        alert("Invalid UTR")
        return
      }

      setLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("Not logged in")
        return
      }

  const res = await fetch("/api/submit-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: user.id,
      utr,
      amount: 399,
    }),
  })

  const data = await res.json()

  if (data.success) {
    setSubmitted(true)
  } else {
    alert("Something went wrong")
  }

      setLoading(false)
    }

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-6">

          <h1 className="text-2xl font-bold">Upgrade to Growth</h1>

          <p className="text-gray-600">₹399 / month</p>

          {/* PAY BUTTON */}
  {!isIOS ? (
    // ✅ ANDROID / DESKTOP
    <a
      href={upiLink}
      target="_blank"
      className="block bg-green-500 text-white text-center py-3 rounded-xl"
    >
      Pay Now
    </a>
  ) : (
    // 🍏 iPHONE FLOW
    <div className="text-center space-y-4">

      <p className="font-semibold">Scan & Pay</p>

      <img
        src="/upi-qr.png"
        alt="UPI QR"
        className="w-48 mx-auto"
      />

      <p className="text-sm text-gray-600">
        UPI ID: <b>8680913379@ptsbi</b>
      </p>

      <button
        onClick={() => {
          navigator.clipboard.writeText("8680913379@ptsbi")
          alert("UPI ID copied!")
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Copy UPI ID
      </button>

      <p className="text-xs text-gray-500">
        Open any UPI app and paste UPI ID
      </p>

    </div>
  )}

          {/* UTR INPUT */}
          <input
            placeholder="Enter UTR"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded"
          >
            {loading ? "Submitting..." : "Submit Payment"}
          </button>


          {submitted && (
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <p style={{ color: "#16a34a", fontWeight: 600 }}>
        ✅ Payment submitted successfully. Waiting for admin approval.
      </p>

      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: "12px",
          backgroundColor: "#2563eb",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Go to Home
      </button>
    </div>
  )}

          {success && (
            <p className="text-green-600 text-sm">
              Payment submitted. Waiting for admin approval.
            </p>
          )}

        </div>
      </div>
    ) 
  }