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

// ── Delete Confirmation Modal ──────────────────────────────────────────────────
function DeleteConfirmModal({
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
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 10000,
          animation: "backdropIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10001,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
          width: "90%",
          maxWidth: 420,
          padding: "28px 28px 24px",
          fontFamily: "'DM Sans', -apple-system, sans-serif",
          animation: "modalIn 0.22s ease",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "#FFF1F2",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
              stroke="#EF233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <path d="M10 11v6M14 11v6" stroke="#EF233C" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Heading */}
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111" }}>
          Delete QR Code?
        </h3>

        {/* Body */}
        <p style={{ margin: "0 0 16px", fontSize: 14, lineHeight: 1.6, color: "#555" }}>
          You're about to delete{" "}
          <span style={{ fontWeight: 700, color: "#111" }}>"{qrName}"</span>.
        </p>

        {/* Warning box */}
        <div style={{
          background: "#FFF8F0",
          border: "1.5px solid #FDDCAE",
          borderRadius: 10,
          padding: "12px 14px",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: 24,
        }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path
              d="M10 2L1.5 17h17L10 2z"
              stroke="#F59E0B" strokeWidth="1.8" strokeLinejoin="round"
            />
            <path d="M10 9v4" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="10" cy="14.5" r="0.75" fill="#F59E0B" />
          </svg>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#92400E", fontWeight: 500 }}>
            <strong>This will also permanently delete all orders</strong> placed through
            this QR code. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1.5px solid #E5E7EB",
              background: "#fff",
              fontSize: 14,
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: isDeleting ? "#F87171" : "#EF233C",
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: isDeleting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = "#D41C34" }}
            onMouseLeave={e => { if (!isDeleting) e.currentTarget.style.background = "#EF233C" }}
          >
            {isDeleting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
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
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QRPage() {
  const [qrName, setQrName]   = useState("")
  const [qrCodes, setQrCodes] = useState<QRCodeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState("")

  // Delete modal state
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

  // Opens the modal instead of native confirm()
  const promptDelete = (qr: QRCodeRow) => {
    setDeleteTarget(qr)
  }

  // Called when user confirms inside the modal
  const confirmDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      await supabase
        .from("qr_codes")
        .delete()
        .eq("id", deleteTarget.id)
        .eq("user_id", session.user.id)

      fetchQRCodes()
      setToast(`QR code "${deleteTarget.name}" and its orders were deleted.`)
    }

    setIsDeleting(false)
    setDeleteTarget(null)
  }

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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          qrName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

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
                  onClick={() => promptDelete(qr)}        // ← opens modal
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