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
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        padding: "11px 16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        fontSize: 14,
        fontWeight: 500,
        color: "#111",
        whiteSpace: "nowrap",
        animation: "toastPop 0.15s ease",
      }}
    >
      <style>{`@keyframes toastPop { from { opacity:0; transform:translateX(-50%) scale(0.96); } to { opacity:1; transform:translateX(-50%) scale(1); } }`}</style>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#22c55e" />
        <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
      <button onClick={onClose} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
    </div>
  )
}

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteModal({
  qrName,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  qrName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translate(-50%,-48%) scale(0.97); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={!isDeleting ? onCancel : undefined}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 10000,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Dialog — perfectly centered */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10001,
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #E5E7EB",
          boxShadow: "0 20px 48px rgba(0,0,0,0.15)",
          width: "calc(100vw - 48px)",
          maxWidth: 400,
          padding: "24px 24px 20px",
          animation: "slideUp 0.15s ease",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#FEF2F2",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6M14 11v6" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "#111" }}>
          Delete QR code?
        </p>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>
          You're about to delete{" "}
          <span style={{ color: "#111", fontWeight: 600 }}>"{qrName}"</span>.
        </p>

        {/* Warning */}
        <div style={{
          background: "#FFFBEB",
          border: "1px solid #FDE68A",
          borderRadius: 8,
          padding: "11px 13px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: 20,
        }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M10 2.5L1.5 17h17L10 2.5z" stroke="#D97706" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M10 8.5v4" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10" cy="14.5" r="0.75" fill="#D97706" />
          </svg>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#92400E" }}>
            <strong>All orders placed through this QR code will also be permanently deleted.</strong>
            {" "}This cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid #E5E7EB",
              background: "#fff",
              fontSize: 14,
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: "#EF4444",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: isDeleting ? 0.75 : 1,
              transition: "opacity 0.1s",
            }}
          >
            {isDeleting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Delete QR
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QRPage() {
  const [qrName, setQrName]             = useState("")
  const [qrCodes, setQrCodes]           = useState<QRCodeRow[]>([])
  const [loading, setLoading]           = useState(false)
  const [toast, setToast]               = useState("")
  const [deleteTarget, setDeleteTarget] = useState<QRCodeRow | null>(null)
  const [isDeleting, setIsDeleting]     = useState(false)

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
    const slug = createdName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const { error } = await supabase.from("qr_codes").insert({ user_id: session.user.id, name: createdName, slug })
    if (!error) {
      setQrName("")
      fetchQRCodes()
      setToast(`QR code "${createdName}" created!`)
    }
    setLoading(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from("qr_codes").delete().eq("id", deleteTarget.id).eq("user_id", session.user.id)
      fetchQRCodes()
      setToast(`"${deleteTarget.name}" and its orders were deleted.`)
    }
    setIsDeleting(false)
    setDeleteTarget(null)
  }

  const downloadQR = (slug: string, name: string) => {
    const canvas = document.getElementById(`qr-${slug}`) as HTMLCanvasElement
    if (!canvas) return
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
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

      {deleteTarget && (
        <DeleteModal
          qrName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      <h2 className="text-2xl font-bold text-black-500">QR Codes</h2>

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qr) => {
          const menuUrl = typeof window !== "undefined" ? `${window.location.origin}/menu/${qr.slug}` : ""
          return (
            <div key={qr.id} className="bg-white p-4 rounded shadow space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-black-500">{qr.name}</h4>
                <button
                  onClick={() => setDeleteTarget(qr)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
              <QRCodeCanvas id={`qr-${qr.slug}`} value={menuUrl} size={200} />
              <p className="text-xs break-all text-red-400">{menuUrl}</p>
              <div className="flex gap-3">
                <button onClick={() => downloadQR(qr.slug, qr.name)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Download</button>
                <button onClick={() => copyLink(menuUrl)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Copy Link</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}