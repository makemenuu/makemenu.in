"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useRef, useState } from "react"

// ─── tiny helper ──────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 80 }: { src?: string; name: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return src ? (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#EF233C",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        fontFamily: "inherit",
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  )
}

// ─── section wrapper ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #F0F0F0",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #F5F5F5",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: 16,
            borderRadius: 2,
            background: "#EF233C",
            flexShrink: 0,
          }}
        />
        <h3
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "#111",
            letterSpacing: 0.2,
            textTransform: "uppercase",
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

// ─── field components ─────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{ fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 0.3 }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  border: "1.5px solid #EBEBEB",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  color: "#111",
  outline: "none",
  width: "100%",
  background: "#FAFAFA",
  transition: "border-color 0.15s",
  fontFamily: "inherit",
  boxSizing: "border-box",
}

function TextInput({
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  placeholder?: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? "#EF233C" : "#EBEBEB",
      }}
    />
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        background: "#FAFAFA",
        borderRadius: 10,
        border: "1.5px solid #EBEBEB",
        cursor: "pointer",
      }}
      onClick={() => onChange(!checked)}
    >
      <span style={{ fontSize: 14, color: "#333", fontWeight: 500 }}>{label}</span>
      {/* pill toggle */}
      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? "#EF233C" : "#DDD",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  )
}

function SaveButton({
  onClick,
  loading,
  label,
}: {
  onClick: () => void
  loading: boolean
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        marginTop: 4,
        padding: "11px 0",
        width: "100%",
        background: loading ? "#ccc" : "#EF233C",
        color: "#fff",
        border: "none",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        letterSpacing: 0.3,
        transition: "opacity 0.15s",
        fontFamily: "inherit",
      }}
    >
      {loading ? "Saving…" : label}
    </button>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        background: "#111",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        animation: "slideUp 0.2s ease",
      }}
    >
      <span style={{ color: "#4ADE80", fontSize: 16 }}>✓</span>
      {message}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState("")

  // Profile
  const [displayName, setDisplayName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  // Restaurant
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [savingSettings, setSavingSettings] = useState(false)

  // Receipt
  const [restaurantName, setRestaurantName] = useState("")
  const [headerText, setHeaderText] = useState("")
  const [footerText, setFooterText] = useState("")
  const [showDate, setShowDate] = useState(true)
  const [showOrderNumber, setShowOrderNumber] = useState(true)
  const [paperSize, setPaperSize] = useState("58mm")
  const [savingReceipt, setSavingReceipt] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

      if (profile) {
        setDisplayName(profile.name || "")
        // Strip any stale cache-buster that may have been saved to DB
        setAvatarUrl(profile.avatar_url?.split("?")[0] || "")
      }

      const { data: rest } = await supabase
        .from("restaurant_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (rest) {
        setLatitude(rest.latitude ?? "")
        setLongitude(rest.longitude ?? "")
        setOpenTime(rest.open_time ?? "")
        setCloseTime(rest.close_time ?? "")
      }

      const { data: receipt } = await supabase
        .from("receipt_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (receipt) {
        setRestaurantName(receipt.restaurant_name || "")
        setHeaderText(receipt.header_text || "")
        setFooterText(receipt.footer_text || "")
        setShowDate(receipt.show_date ?? true)
        setShowOrderNumber(receipt.show_order_number ?? true)
        setPaperSize(receipt.paper_size || "58mm")
      }
    }

    load()
  }, [])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setSavingProfile(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("profiles")
      .update({ name: displayName })
      .eq("id", user.id)

    window.dispatchEvent(new Event("profileUpdated"))
    setSavingProfile(false)
    setToast("Profile updated")
  }

  const uploadAvatar = async (file: File) => {
    setUploading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const filePath = `${user.id}/avatar.png`
    await supabase.storage.from("avatars").upload(filePath, file, { upsert: true })

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
    const cleanUrl = data.publicUrl  // store clean URL in DB
    const displayUrl = cleanUrl + "?t=" + Date.now() // bust cache only for local display

    await supabase.from("profiles").update({ avatar_url: cleanUrl }).eq("id", user.id)
    setAvatarUrl(displayUrl)
    window.dispatchEvent(new Event("profileUpdated"))
    setUploading(false)
    setToast("Avatar updated")
  }

  const saveRestaurantSettings = async () => {
    setSavingSettings(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("restaurant_settings").upsert(
      { user_id: user.id, latitude, longitude, open_time: openTime, close_time: closeTime },
      { onConflict: "user_id" }
    )
    setSavingSettings(false)
    setToast("Restaurant settings saved")
  }

  const saveReceiptSettings = async () => {
    setSavingReceipt(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("receipt_settings").upsert(
      {
        user_id: user.id,
        restaurant_name: restaurantName,
        header_text: headerText,
        footer_text: footerText,
        show_date: showDate,
        show_order_number: showOrderNumber,
        paper_size: paperSize,
      },
      { onConflict: "user_id" }
    )
    setSavingReceipt(false)
    setToast("Receipt settings saved")
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        input[type="time"]::-webkit-calendar-picker-indicator { opacity: 0.4; cursor: pointer; }
      `}</style>

      <div
        style={{
          padding: "32px 28px",
          maxWidth: 680,
          fontFamily:
            "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Page header */}
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>
            Settings
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#999" }}>
            Manage your profile, restaurant, and receipt preferences
          </p>
        </div>

        {/* ── Profile ── */}
        <Section title="Profile">
          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Avatar src={avatarUrl} name={displayName || "User"} size={72} />
              {/* camera badge */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#EF233C",
                  border: "2px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                }}
                title="Change photo"
              >
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M11 2H5L3 5H1a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1V6a1 1 0 00-1-1h-2L11 2z"
                    stroke="#fff"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="9" r="2.5" stroke="#fff" strokeWidth="1.4" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
              />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111" }}>
                {displayName || "Your Name"}
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 12,
                  color: "#EF233C",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Change photo"}
              </p>
            </div>
          </div>

          {/* Name field */}
          <Field label="Display Name">
            <TextInput
              placeholder="e.g. Karneshwaran M"
              value={displayName}
              onChange={setDisplayName}
            />
          </Field>

          <SaveButton onClick={saveProfile} loading={savingProfile} label="Save Profile" />
        </Section>

        {/* ── Restaurant ── */}
        <Section title="Restaurant Settings">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Latitude">
              <TextInput placeholder="e.g. 12.9716" value={latitude} onChange={setLatitude} />
            </Field>
            <Field label="Longitude">
              <TextInput placeholder="e.g. 77.5946" value={longitude} onChange={setLongitude} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Opening Time">
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Closing Time">
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          <SaveButton
            onClick={saveRestaurantSettings}
            loading={savingSettings}
            label="Save Restaurant Settings"
          />
        </Section>

        {/* ── Receipt ── */}
        <Section title="Receipt Settings">
          <Field label="Restaurant Name on Receipt">
            <TextInput
              placeholder="e.g. Spice Garden"
              value={restaurantName}
              onChange={setRestaurantName}
            />
          </Field>

          <Field label="Header Text">
            <TextInput
              placeholder="e.g. Thank you for dining with us!"
              value={headerText}
              onChange={setHeaderText}
            />
          </Field>

          <Field label="Footer Text">
            <TextInput
              placeholder="e.g. Visit us again soon 🙏"
              value={footerText}
              onChange={setFooterText}
            />
          </Field>

          <Toggle label="Show Date on Receipt" checked={showDate} onChange={setShowDate} />
          <Toggle
            label="Show Order Number on Receipt"
            checked={showOrderNumber}
            onChange={setShowOrderNumber}
          />

          <Field label="Paper Size">
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              style={{
                ...inputStyle,
                cursor: "pointer",
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                paddingRight: 36,
              }}
            >
              <option value="58mm">58 mm</option>
              <option value="80mm">80 mm</option>
            </select>
          </Field>

          <SaveButton
            onClick={saveReceiptSettings}
            loading={savingReceipt}
            label="Save Receipt Settings"
          />
        </Section>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  )
}
