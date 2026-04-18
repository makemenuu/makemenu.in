"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeCanvas } from "qrcode.react"

type QRCodeRow = {
  id: string
  name: string
  slug: string
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#fff",
          border: "1.5px solid #EBEBEB",
          borderLeft: "4px solid #EF233C",
          borderRadius: 12,
          padding: "12px 18px",
          boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
          fontFamily: "'DM Sans', -apple-system, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#111",
          animation: "toastIn 0.2s ease",
          minWidth: 200,
        }}
      >
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "#FFF1F2", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l4 4 6-7" stroke="#EF233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {message}

        <button
          onClick={onClose}
          style={{
            marginLeft: "auto", background: "none", border: "none",
            cursor: "pointer", color: "#aaa", fontSize: 16,
            lineHeight: 1, padding: "0 0 0 8px",
          }}
        >
          ×
        </button>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QRPage() {
  const [qrName, setQrName]   = useState("")
  const [qrCodes, setQrCodes] = useState<QRCodeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState("")

  const fetchQRCodes = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    setQrCodes(data || [])
  }

  const createQRCode = async () => {
    if (!qrName.trim()) { alert("Enter QR name"); return }

    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const createdName = qrName.trim()
    const slug = createdName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    const { error } = await supabase.from("qr_codes").insert({
      user_id: session.user.id,
      name: createdName,
      slug,
    })

    if (!error) {
      setQrName("")
      fetchQRCodes()
      setToast(`QR code "${createdName}" created!`)
    }

    setLoading(false)
  }

  const deleteQR = async (id: string) => {
    if (!confirm("Delete this QR?")) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("qr_codes").delete().eq("id", id).eq("user_id", session.user.id)
    fetchQRCodes()
  }

  // name param added so the toast can say which QR was downloaded
  const downloadQR = (slug: string, name: string) => {
    const canvas = document.getElementById(`qr-${slug}`) as HTMLCanvasElement
    if (!canvas) return
    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = `${slug}.png`
    link.click()
    setToast(`QR code "${name}" downloaded!`)
  }

  const copyLink = (menuUrl: string) => {
    navigator.clipboard.writeText(menuUrl)
    setToast("Link copied to clipboard!")
  }

  useEffect(() => { fetchQRCodes() }, [])

  return (
    <div className="space-y-8">

      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* TITLE */}
      <h2 className="text-2xl font-bold text-black-500">QR Codes</h2>

      {/* CREATE QR */}
      <div className="bg-white p-4 rounded shadow max-w-md space-y-3">
        <h3 className="font-semibold text-black-500">Create QR</h3>
        <input
          className="border p-2 w-full"
          placeholder="QR Name (Table 1, Counter...)"
          value={qrName}
          onChange={(e) => setQrName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createQRCode()}
        />
        <button
          onClick={createQRCode}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create QR"}
        </button>
      </div>

      {/* QR LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qr) => {
          const menuUrl =
            typeof window !== "undefined"
              ? `${window.location.origin}/menu/${qr.slug}`
              : ""

          return (
            <div key={qr.id} className="bg-white p-4 rounded shadow space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-black-500">{qr.name}</h4>
                <button
                  onClick={() => deleteQR(qr.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>

              <QRCodeCanvas id={`qr-${qr.slug}`} value={menuUrl} size={200} />

              <p className="text-xs break-all text-red-400">{menuUrl}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => downloadQR(qr.slug, qr.name)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Download
                </button>
                <button
                  onClick={() => copyLink(menuUrl)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}