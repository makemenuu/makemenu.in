"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import { QRCodeCanvas } from "qrcode.react"

type CardStyle = "minimal" | "bold" | "frame" | "dark"
type FontStyle = "serif" | "sans" | "mono"

type QRCodeRow = {
  id: string
  name: string
  slug: string
  caption: string | null
  tagline: string | null
  card_style: CardStyle | null
  accent_color: string | null
  font_style: FontStyle | null
}

const ACCENTS = [
  "#E24B4A", "#1D9E75", "#378ADD", "#7F77DD",
  "#D85A30", "#BA7517", "#444441", "#D4537E",
]
const CARD_STYLES: { value: CardStyle; label: string }[] = [
  { value: "minimal", label: "Minimal"     },
  { value: "bold",    label: "Bold banner" },
  { value: "frame",   label: "Framed"      },
  { value: "dark",    label: "Dark mode"   },
]
const FONT_STYLES: { value: FontStyle; label: string }[] = [
  { value: "serif", label: "Serif"      },
  { value: "sans",  label: "Sans-serif" },
  { value: "mono",  label: "Monospace"  },
]

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function getFonts(f: FontStyle, s: number) {
  if (f === "serif") return { title: `bold ${28*s}px Georgia,serif`, caption: `bold ${20*s}px Georgia,serif`, tag: `${13*s}px Georgia,serif`, url: `${10*s}px Georgia,serif` }
  if (f === "mono")  return { title: `bold ${22*s}px "Courier New",monospace`, caption: `bold ${17*s}px "Courier New",monospace`, tag: `${11*s}px "Courier New",monospace`, url: `${9*s}px "Courier New",monospace` }
  return                    { title: `bold ${26*s}px system-ui,sans-serif`, caption: `bold ${19*s}px system-ui,sans-serif`, tag: `${12*s}px system-ui,sans-serif`, url: `${10*s}px system-ui,sans-serif` }
}

function drawCardBase(
  ctx: CanvasRenderingContext2D, W: number, H: number, s: number,
  o: { title: string; caption: string; tagline: string; style: CardStyle; accent: string; font: FontStyle; url: string }
) {
  const dark = o.style === "dark"
  const bg   = dark ? "#111" : "#fff"
  const fg   = dark ? "#fff" : "#111"
  const sub  = dark ? "#999" : "#666"
  const bdr  = dark ? "#333" : "#e5e7eb"
  const f    = getFonts(o.font, s)

  // ── helper: draw text shrunk to fit within maxWidth ──────────────────────
  const fitText = (text: string, baseFont: string, maxWidth: number, x: number, y: number) => {
    let fontSize = parseFloat(baseFont.match(/(\d+(\.\d+)?)px/)?.[1] ?? "26")
    const fontFamily = baseFont.replace(/[\d.]+px/, "").replace("bold ", "").trim()
    const isBold = baseFont.startsWith("bold")
    let tries = 0
    while (tries < 20) {
      ctx.font = `${isBold ? "bold " : ""}${fontSize}px ${fontFamily}`
      if (ctx.measureText(text).width <= maxWidth || fontSize <= 10) break
      fontSize -= 1
      tries++
    }
    ctx.fillText(text, x, y)
  }

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  const maxTitleW = W - 40 * s  // 20px padding each side

  if (o.style === "bold") {
    ctx.fillStyle = o.accent; ctx.fillRect(0, 0, W, 88 * s)
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"
    fitText(o.title, f.title, maxTitleW, W / 2, 54 * s)
    ctx.font = `${12*s}px system-ui,sans-serif`; ctx.fillStyle = "rgba(255,255,255,.78)"
    ctx.fillText(o.caption.toLowerCase(), W / 2, 74 * s)
  } else if (o.style === "frame") {
    ctx.strokeStyle = o.accent; ctx.lineWidth = 4 * s
    rrect(ctx, 12*s, 12*s, W - 24*s, H - 24*s, 14*s); ctx.stroke()
    ctx.lineWidth = 1.5 * s; rrect(ctx, 19*s, 19*s, W - 38*s, H - 38*s, 10*s); ctx.stroke()
    ctx.fillStyle = fg; ctx.textAlign = "center"
    fitText(o.title, f.title, maxTitleW, W / 2, 58 * s)
    ctx.fillStyle = o.accent; ctx.fillRect(W / 2 - 22*s, 68*s, 44*s, 2*s)
    ctx.fillStyle = sub; ctx.font = `${12*s}px system-ui,sans-serif`; ctx.fillText(o.caption, W / 2, 84 * s)
  } else {
    ctx.fillStyle = o.accent; ctx.fillRect(0, 0, W, 5 * s)
    ctx.fillStyle = fg; ctx.textAlign = "center"
    fitText(o.title, f.title, maxTitleW, W / 2, 54 * s)
    ctx.fillStyle = sub; ctx.font = `${12*s}px system-ui,sans-serif`; ctx.fillText(o.caption, W / 2, 72 * s)
  }

  const qrSz = 200 * s, qrX = (W - qrSz) / 2, qrY = 96 * s
  if (!dark) { ctx.fillStyle = "#fff"; ctx.fillRect(qrX - 8*s, qrY - 8*s, qrSz + 16*s, qrSz + 16*s) }

  const by = 312 * s
  ctx.fillStyle = dark ? "#fff" : o.accent; ctx.font = f.caption; ctx.textAlign = "center"
  ctx.fillText(o.caption, W / 2, by + 10*s)
  if (o.tagline) { ctx.fillStyle = sub; ctx.font = f.tag; ctx.fillText(o.tagline, W / 2, by + 32*s) }
  ctx.strokeStyle = bdr
  ctx.lineWidth = s
  ctx.beginPath()
  ctx.moveTo(40*s, by + 50*s)
  ctx.lineTo(W - 40*s, by + 50*s)
  ctx.stroke()

  return (qrImg: HTMLImageElement) => {
    ctx.drawImage(qrImg, qrX, qrY, qrSz, qrSz)
  }
}

function renderCardToCanvas(
  canvas: HTMLCanvasElement,
  W: number, H: number, s: number,
  opts: { title: string; caption: string; tagline: string; style: CardStyle; accent: string; font: FontStyle; url: string },
  qrDataUrl: string
): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext("2d")!
    const stampQR = drawCardBase(ctx, W, H, s, opts)
    const img = new window.Image()
    img.onload = () => { stampQR(img); resolve() }
    img.onerror = () => { resolve() }
    img.src = qrDataUrl
  })
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 2600); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1px solid #E5E7EB",borderRadius:10,padding:"11px 16px",boxShadow:"0 4px 16px rgba(0,0,0,.10)",fontSize:14,fontWeight:500,color:"#111",whiteSpace:"nowrap",animation:"tpop .15s ease" }}>
      <style>{`@keyframes tpop{from{opacity:0;transform:translateX(-50%) scale(.96)}to{opacity:1;transform:translateX(-50%) scale(1)}}`}</style>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#22c55e"/><path d="M4.5 8l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      {msg}
      <button onClick={onClose} style={{ marginLeft:8,background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",fontSize:18,lineHeight:1,padding:0 }}>×</button>
    </div>
  )
}

function DeleteModal({ name, onConfirm, onCancel, busy }: { name: string; onConfirm: () => void; onCancel: () => void; busy: boolean }) {
  return (
    <>
      <style>{`@keyframes fIn{from{opacity:0}to{opacity:1}}@keyframes sUp{from{opacity:0;transform:translate(-50%,-48%) scale(.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}@keyframes dspin{to{transform:rotate(360deg)}}`}</style>
      <div onClick={!busy ? onCancel : undefined} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:10000,animation:"fIn .15s ease" }}/>
      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:10001,background:"#fff",borderRadius:14,border:"1px solid #E5E7EB",boxShadow:"0 20px 48px rgba(0,0,0,.15)",width:"calc(100vw - 48px)",maxWidth:400,padding:"24px 24px 20px",animation:"sUp .15s ease" }}>
        <div style={{ width:44,height:44,borderRadius:"50%",background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </div>
        <p style={{ margin:"0 0 6px",fontSize:16,fontWeight:600,color:"#111" }}>Delete QR code?</p>
        <p style={{ margin:"0 0 16px",fontSize:14,color:"#6B7280",lineHeight:1.6 }}>
          You&apos;re about to delete <strong style={{ color:"#111" }}>&quot;{name}&quot;</strong>.
        </p>
        <div style={{ background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:8,padding:"11px 13px",display:"flex",gap:10,alignItems:"flex-start",marginBottom:20 }}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink:0,marginTop:1 }}><path d="M10 2.5L1.5 17h17L10 2.5z" stroke="#D97706" strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 8.5v4" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round"/><circle cx="10" cy="14.5" r=".75" fill="#D97706"/></svg>
          <p style={{ margin:0,fontSize:13,lineHeight:1.6,color:"#92400E" }}><strong>All orders placed through this QR code will also be permanently deleted.</strong> This cannot be undone.</p>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
          <button onClick={onCancel} disabled={busy} style={{ padding:"9px 18px",borderRadius:8,border:"1px solid #E5E7EB",background:"#fff",fontSize:14,fontWeight:500,color:"#374151",cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={busy} style={{ padding:"9px 18px",borderRadius:8,border:"none",background:"#EF4444",fontSize:14,fontWeight:500,color:"#fff",cursor:busy?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,opacity:busy?0.75:1 }}>
            {busy ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation:"dspin .7s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Deleting...</> : "Delete QR"}
          </button>
        </div>
      </div>
    </>
  )
}

// ── DesignerModal now receives restaurantName prop ────────────────────────────
function DesignerModal({ qr, menuUrl, restaurantName, onClose, onSaved }: {
  qr: QRCodeRow
  menuUrl: string
  restaurantName: string   // ← NEW PROP
  onClose: () => void
  onSaved: (id: string, patch: Partial<QRCodeRow>) => Promise<void>
}) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenQrRef      = useRef<HTMLDivElement>(null)

  const [caption, setCaption] = useState(qr.caption      ?? "Scan to order")
  const [tagline, setTagline] = useState(qr.tagline      ?? "No waiting. Just good food.")
  const [style,   setStyle]   = useState<CardStyle>(qr.card_style  ?? "minimal")
  const [accent,  setAccent]  = useState(qr.accent_color ?? "#E24B4A")
  const [font,    setFont]    = useState<FontStyle>(qr.font_style  ?? "serif")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [downloading, setDownloading] = useState(false)

  const captureQR = useCallback(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = hiddenQrRef.current
        if (!el) return
        const canvas = el.querySelector("canvas") as HTMLCanvasElement | null
        if (!canvas) return
        try {
          const url = canvas.toDataURL("image/png")
          setQrDataUrl(url)
        } catch (e) {
          console.warn("QR capture failed", e)
        }
      }, 100)
    })
  }, [])

  useEffect(() => { captureQR() }, [accent, style, captureQR])

  useEffect(() => {
    const canvas = previewCanvasRef.current
    if (!canvas || !qrDataUrl) return
    const W = 300, H = 400, s = 300 / 360
    // ← CHANGED: title is now restaurantName (fallback to qr.name if not set)
    renderCardToCanvas(canvas, W, H, s, {
      title: restaurantName || qr.name,
      caption, tagline, style, accent, font, url: menuUrl
    }, qrDataUrl)
  }, [caption, tagline, style, accent, font, qrDataUrl, qr.name, restaurantName, menuUrl])

  const downloadCard = async () => {
    const qrUrl = qrDataUrl
    if (!qrUrl) { alert("QR not ready yet — please wait a moment and try again."); return }
    setDownloading(true)
    const W = 720, H = 960
    const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H
    // ← CHANGED: title is now restaurantName
    await renderCardToCanvas(canvas, W, H, 2, {
      title: restaurantName || qr.name,
      caption, tagline, style, accent, font, url: menuUrl
    }, qrUrl)
    const a = document.createElement("a")
    a.href = canvas.toDataURL("image/png")
    a.download = `${qr.slug}-card.png`
    a.click()
    setDownloading(false)
  }

  const downloadQROnly = () => {
    const el = hiddenQrRef.current
    if (!el) return
    const canvas = el.querySelector("canvas") as HTMLCanvasElement | null
    if (!canvas) return
    const a = document.createElement("a")
    a.href = canvas.toDataURL("image/png")
    a.download = `${qr.slug}.png`
    a.click()
  }

  const save = async () => {
    setSaving(true)
    await onSaved(qr.id, { caption, tagline, card_style: style, accent_color: accent, font_style: font })
    setSaving(false)
    onClose()
  }

  return (
    <>
      <style>{`
        @keyframes dfIn{from{opacity:0}to{opacity:1}}
        @keyframes dsUp{from{opacity:0;transform:translate(-50%,-46%) scale(.97)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .dl{font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px;display:block}
        .dsb{padding:7px 6px;border-radius:7px;border:1px solid #E5E7EB;background:#F9FAFB;color:#6B7280;font-size:12px;cursor:pointer;font-family:inherit;width:100%;transition:all .12s}
        .dsb:hover{border-color:#E24B4A;color:#E24B4A}
        .dsb.on{border-color:#111;background:#fff;color:#111;font-weight:600}
        .dsw{width:22px;height:22px;border-radius:50%;cursor:pointer;border:2.5px solid transparent;flex-shrink:0;transition:transform .1s,border-color .1s}
        .dsw.on{border-color:#111;transform:scale(1.2)}
        .dsi{border:1px solid #E5E7EB;border-radius:7px;padding:7px 10px;font-size:13px;color:#111;width:100%;outline:none;font-family:inherit;box-sizing:border-box;background:#F9FAFB}
        .dsi:focus{border-color:#9CA3AF;background:#fff}
        .dsse{border:1px solid #E5E7EB;border-radius:7px;padding:7px 10px;font-size:13px;color:#111;width:100%;outline:none;font-family:inherit;background:#fff;box-sizing:border-box}
        .dfb{padding:9px 16px;border-radius:8px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid #E5E7EB;background:#fff;color:#374151;font-family:inherit}
        .dfb:hover{background:#F9FAFB}
      `}</style>

      <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:10000,animation:"dfIn .15s ease" }}/>

      <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:10001,background:"#fff",borderRadius:16,border:"1px solid #E5E7EB",boxShadow:"0 24px 64px rgba(0,0,0,.18)",width:"min(96vw,820px)",maxHeight:"92vh",overflowY:"auto",animation:"dsUp .15s ease" }}>

        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px 0" }}>
          <div>
            <p style={{ margin:0,fontSize:17,fontWeight:700,color:"#111" }}>Design QR card</p>
            <p style={{ margin:"2px 0 0",fontSize:13,color:"#6B7280" }}>{qr.name}</p>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"1px solid #E5E7EB",borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18,color:"#6B7280",display:"flex",alignItems:"center",justifyContent:"center" }}>×</button>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"1fr 260px",padding:"20px 24px 8px",gap:0 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:16,paddingRight:24,borderRight:"1px solid #F3F4F6" }}>
            <div><span className="dl">Caption line</span><input className="dsi" value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Scan to order" maxLength={60}/></div>
            <div><span className="dl">Tagline</span><input className="dsi" value={tagline} onChange={e=>setTagline(e.target.value)} placeholder="No waiting. Just good food." maxLength={80}/></div>
            <hr style={{ border:"none",borderTop:"1px solid #F3F4F6",margin:0 }}/>
            <div>
              <span className="dl">Card style</span>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                {CARD_STYLES.map(s=>(<button key={s.value} className={`dsb${style===s.value?" on":""}`} onClick={()=>setStyle(s.value)}>{s.label}</button>))}
              </div>
            </div>
            <div>
              <span className="dl">Accent color</span>
              <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                {ACCENTS.map(h=>(<div key={h} className={`dsw${accent===h?" on":""}`} style={{ background:h }} onClick={()=>setAccent(h)}/>))}
              </div>
            </div>
            <div>
              <span className="dl">Font style</span>
              <select className="dsse" value={font} onChange={e=>setFont(e.target.value as FontStyle)}>
                {FONT_STYLES.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ paddingLeft:24,display:"flex",flexDirection:"column",gap:8 }}>
            <span className="dl">Live preview</span>
            <canvas
              ref={previewCanvasRef}
              width={300} height={400}
              style={{ width:"100%",borderRadius:10,border:"1px solid #E5E7EB",display:"block" }}
            />
            {!qrDataUrl && (
              <p style={{ margin:0,fontSize:11,color:"#E24B4A",textAlign:"center" }}>Rendering QR…</p>
            )}
            <p style={{ margin:0,fontSize:11,color:"#9CA3AF",textAlign:"center" }}>Exports at 720 × 960 px — A5 print ready</p>
          </div>
        </div>

        <div style={{ display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap",padding:"16px 24px 20px",borderTop:"1px solid #F3F4F6" }}>
          <button className="dfb" onClick={onClose}>Cancel</button>
          <button className="dfb" onClick={downloadQROnly}>QR only</button>
          <button
            onClick={downloadCard}
            disabled={downloading || !qrDataUrl}
            style={{ padding:"9px 16px",borderRadius:8,border:"none",background:"#111",fontSize:13,fontWeight:500,color:"#fff",cursor: downloading||!qrDataUrl?"not-allowed":"pointer",fontFamily:"inherit",opacity:downloading||!qrDataUrl?0.6:1,display:"flex",alignItems:"center",gap:6 }}
          >
            {downloading
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ animation:"dspin .7s linear infinite" }}><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>Preparing…</>
              : "Download card"
            }
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ padding:"9px 16px",borderRadius:8,border:"none",background:"#E24B4A",fontSize:13,fontWeight:500,color:"#fff",cursor:saving?"not-allowed":"pointer",opacity:saving?0.75:1,fontFamily:"inherit" }}
          >
            {saving ? "Saving…" : "Save design"}
          </button>
        </div>

        <div
          ref={hiddenQrRef}
          style={{ position:"fixed", left:-9999, top:-9999, pointerEvents:"none" }}
        >
          <QRCodeCanvas
            id={`hqr-${qr.id}`}
            value={menuUrl}
            size={400}
            fgColor={style === "dark" ? "#ffffff" : accent}
            bgColor={style === "dark" ? "#1a1a1a" : "#ffffff"}
            level="H"
          />
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function QRPage() {
  const [qrName,         setQrName]         = useState("")
  const [qrCodes,        setQrCodes]        = useState<QRCodeRow[]>([])
  const [creating,       setCreating]       = useState(false)
  const [toast,          setToast]          = useState("")
  const [deleteTarget,   setDeleteTarget]   = useState<QRCodeRow | null>(null)
  const [deleting,       setDeleting]       = useState(false)
  const [designTarget,   setDesignTarget]   = useState<QRCodeRow | null>(null)
  const [restaurantName, setRestaurantName] = useState("")  // ← restaurant name from receipt_settings

  const fetchQRCodes = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
    if (!error) setQrCodes((data as QRCodeRow[]) ?? [])
  }, [])

  useEffect(() => {
    fetchQRCodes()

    // fetch restaurant name from receipt_settings
    const loadRestaurantName = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data } = await supabase
        .from("receipt_settings")
        .select("restaurant_name")
        .eq("user_id", session.user.id)
        .maybeSingle()
      if (data?.restaurant_name) setRestaurantName(data.restaurant_name)
    }
    loadRestaurantName()
  }, [fetchQRCodes])

  const createQRCode = async () => {
    const name = qrName.trim()
    if (!name) return
    setCreating(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCreating(false); return }
    const baseSlug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
    const slug = `${baseSlug}-${session.user.id.slice(0, 8)}`
    const { error } = await supabase.from("qr_codes").insert({
      user_id: session.user.id, name, slug,
      caption: "Scan to order", tagline: "No waiting. Just good food.",
      card_style: "minimal", accent_color: "#E24B4A", font_style: "serif",
    })
    if (error) { setToast("Error: " + error.message) }
    else { setQrName(""); setToast(`"${name}" created!`); await fetchQRCodes() }
    setCreating(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from("qr_codes").delete().eq("id", deleteTarget.id).eq("user_id", session.user.id)
      setToast(`"${deleteTarget.name}" deleted.`)
      await fetchQRCodes()
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const saveDesign = async (id: string, patch: Partial<QRCodeRow>) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from("qr_codes").update(patch).eq("id", id).eq("user_id", session.user.id)
    if (!error) { setToast("Design saved!"); await fetchQRCodes() }
  }

  const downloadQR = (slug: string, name: string) => {
    const canvas = document.getElementById(`qr-${slug}`) as HTMLCanvasElement | null
    if (!canvas) return
    const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = `${slug}.png`; a.click()
    setToast(`"${name}" downloaded!`)
  }

  const copyLink = (url: string) => { navigator.clipboard.writeText(url); setToast("Link copied!") }

  const menuUrl = (slug: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/menu/${slug}` : `/menu/${slug}`

  return (
    <div className="space-y-8">
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}

      {deleteTarget && (
        <DeleteModal name={deleteTarget.name} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} busy={deleting}/>
      )}

      {designTarget && (
        <DesignerModal
          qr={designTarget}
          menuUrl={menuUrl(designTarget.slug)}
          restaurantName={restaurantName}   // ← PASS DOWN
          onClose={() => setDesignTarget(null)}
          onSaved={saveDesign}
        />
      )}

      <h2 className="text-2xl font-bold">QR Codes</h2>

      {/* create */}
      <div className="bg-white p-4 rounded-lg shadow max-w-md space-y-3">
        <h3 className="font-semibold">Create QR code</h3>
        <input
          className="border p-2 w-full rounded-lg text-sm"
          placeholder="QR name  (e.g. Table 1, Counter, Bar…)"
          value={qrName}
          onChange={e => setQrName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !creating) createQRCode() }}
        />
        <button
          onClick={createQRCode}
          disabled={creating || !qrName.trim()}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          {creating ? "Creating…" : "Create QR"}
        </button>
      </div>

      {qrCodes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🔲</div>
          <p className="font-medium">No QR codes yet</p>
          <p className="text-sm mt-1">Create one above to get started</p>
        </div>
      )}

      {/* grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map(qr => {
          const url    = menuUrl(qr.slug)
          const accent = qr.accent_color ?? "#E24B4A"
          const isDark = qr.card_style   === "dark"
          return (
            <div key={qr.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div style={{ height:4, background:accent }}/>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  {/* Front card: show qr.name (Table 1, Counter, etc.) on the outside label */}
                  <h4 className="font-semibold text-sm">{qr.name}</h4>
                  <button onClick={() => setDeleteTarget(qr)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                </div>
                <div style={{ background:isDark?"#111":"#fafafa", border:`1px solid ${isDark?"#333":"#F3F4F6"}`, borderRadius:10, padding:12, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                  <QRCodeCanvas
                    id={`qr-${qr.slug}`}
                    value={url}
                    size={160}
                    fgColor={isDark?"#ffffff":accent}
                    bgColor={isDark?"#111111":"#ffffff"}
                    level="H"
                  />
                  {/* Inside QR box: show restaurant name from receipt settings */}
                  <p style={{ margin:0,fontSize:12,color:isDark?"#fff":"#111",fontWeight:600,textAlign:"center" }}>
                    {restaurantName || qr.name}
                  </p>
                  {qr.caption && (
                    <p style={{ margin:0,fontSize:11,color:isDark?"#aaa":"#777",fontStyle:"italic",textAlign:"center" }}>{qr.caption}</p>
                  )}
                </div>
                {/* URL line removed */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setDesignTarget(qr)} style={{ display:"flex",alignItems:"center",gap:5,background:"#E24B4A",color:"#fff",border:"none",padding:"7px 13px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Design card
                  </button>
                  <button onClick={() => downloadQR(qr.slug, qr.name)} style={{ display:"flex",alignItems:"center",gap:5,background:"#F3F4F6",color:"#374151",border:"none",padding:"7px 13px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 15V3M6 9l6 6 6-6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 20h16" stroke="#374151" strokeWidth="2" strokeLinecap="round"/></svg>
                    Download
                  </button>
                  <button onClick={() => copyLink(url)} style={{ display:"flex",alignItems:"center",gap:5,background:"#F3F4F6",color:"#374151",border:"none",padding:"7px 13px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="#374151" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#374151" strokeWidth="2"/></svg>
                    Copy link
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}