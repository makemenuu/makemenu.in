"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ReceiptSettings() {

  const [restaurantName, setRestaurantName] = useState("")
  const [headerText, setHeaderText] = useState("")
  const [footerText, setFooterText] = useState("")

  const [showDate, setShowDate] = useState(true)
  const [showOrderNumber, setShowOrderNumber] = useState(true)

  const [paperSize, setPaperSize] = useState("58mm")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // ================= LOAD =================
  const loadSettings = async () => {

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("receipt_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (data) {
      setRestaurantName(data.restaurant_name || "")
      setHeaderText(data.header_text || "")
      setFooterText(data.footer_text || "")

      setShowDate(data.show_date ?? true)
      setShowOrderNumber(data.show_order_number ?? true)

      setPaperSize(data.paper_size || "58mm")
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // ================= SAVE =================
  const saveSettings = async () => {

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("User not logged in")
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("receipt_settings")
      .upsert({
        user_id: user.id,
        restaurant_name: restaurantName,
        header_text: headerText,
        footer_text: footerText,
        show_date: showDate,
        show_order_number: showOrderNumber,
        paper_size: paperSize
      }, {
        onConflict: "user_id"
      })

    setSaving(false)

    if (error) {
      console.error(error)
      alert("Failed to save settings")
      return
    }

    alert("Receipt settings saved ✅")
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (

    <div className="p-6 max-w-2xl space-y-6">

      <h2 className="text-2xl font-semibold">
        Receipt Settings
      </h2>

      {/* ================= BASIC INFO ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <h3 className="font-semibold text-lg">
          Basic Information
        </h3>

        <input
          className="border p-3 w-full rounded"
          placeholder="Restaurant Name"
          value={restaurantName}
          onChange={(e)=>setRestaurantName(e.target.value)}
        />

        <input
          className="border p-3 w-full rounded"
          placeholder="Header Text (optional)"
          value={headerText}
          onChange={(e)=>setHeaderText(e.target.value)}
        />

        <input
          className="border p-3 w-full rounded"
          placeholder="Footer Text (Thank you message)"
          value={footerText}
          onChange={(e)=>setFooterText(e.target.value)}
        />

      </div>

      {/* ================= DISPLAY OPTIONS ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <h3 className="font-semibold text-lg">
          Display Options
        </h3>

        <label className="flex items-center justify-between">
          <span>Show Order Number</span>
          <input
            type="checkbox"
            checked={showOrderNumber}
            onChange={(e)=>setShowOrderNumber(e.target.checked)}
          />
        </label>

        <label className="flex items-center justify-between">
          <span>Show Date</span>
          <input
            type="checkbox"
            checked={showDate}
            onChange={(e)=>setShowDate(e.target.checked)}
          />
        </label>

      </div>

      {/* ================= PAPER ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <h3 className="font-semibold text-lg">
          Paper Settings
        </h3>

        <select
          className="border p-3 w-full rounded"
          value={paperSize}
          onChange={(e)=>setPaperSize(e.target.value)}
        >
          <option value="58mm">58mm Paper</option>
          <option value="80mm">80mm Paper</option>
        </select>

      </div>

      {/* ================= SAVE ================= */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className="bg-red-500 text-white px-6 py-3 rounded-lg w-full font-medium hover:bg-red-600 transition"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>

    </div>

  )
}