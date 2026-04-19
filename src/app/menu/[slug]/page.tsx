"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

// ── Types ─────────────────────────────────────────────────────────────────────
type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  description?: string
  price: number
  category_id: string
  is_available?: boolean
  image_url?: string
}

type CartItem = {
  product: Product
  quantity: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function isRestaurantOpen(openTime: string, closeTime: string): boolean {
  const now = new Date()
  const [openH, openM] = openTime.split(":").map(Number)
  const [closeH, closeM] = closeTime.split(":").map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM
  if (closeMinutes < openMinutes) return nowMinutes >= openMinutes || nowMinutes < closeMinutes
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
}

function getGreeting(): { emoji: string; text: string } {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { emoji: "☀️", text: "Good Morning!" }
  if (h >= 12 && h < 17) return { emoji: "🌤️", text: "Good Afternoon!" }
  if (h >= 17 && h < 21) return { emoji: "🌆", text: "Good Evening!" }
  return { emoji: "🌙", text: "Good Night!" }
}

// ── MakeMenu Logo — hardcoded, same for every restaurant ─────────────────────
// This is the app branding. It is NOT stored in the database.
function MakeMenuLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      </svg>
      <span style={{
        fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700,
        color: "#E8192C", letterSpacing: "-0.3px",
      }}>
      </span>
    </div>
  )
}

// ── Closed Screen ─────────────────────────────────────────────────────────────
function ClosedScreen({ openTime, closeTime }: { openTime: string; closeTime: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', -apple-system, sans-serif", padding: "24px", textAlign: "center",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", background: "#FFF1F2",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#E8192C" strokeWidth="1.8" />
          <path d="M12 7v5l3 3" stroke="#E8192C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 800, color: "#111" }}>We're Closed Right Now</h1>
      <p style={{ margin: "0 0 24px", fontSize: 15, color: "#888", maxWidth: 280 }}>
        Sorry, the restaurant is currently not accepting orders.
      </p>
      <div style={{
        background: "#FFF1F2", border: "1.5px solid #FECDD3", borderRadius: 12,
        padding: "14px 28px", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#E8192C", letterSpacing: 0.5, textTransform: "uppercase" }}>
          Opening Hours
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
          {formatTime(openTime)} – {formatTime(closeTime)}
        </span>
      </div>
      <p style={{ marginTop: 20, fontSize: 13, color: "#bbb" }}>Please come back during opening hours 🙏</p>
    </div>
  )
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ message = "Loading menu..." }: { message?: string }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", background: "#f5f5f5",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 48, height: 48, border: "3px solid #f0f0f0", borderTop: "3px solid #E8192C",
          borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: "#777", fontSize: 14 }}>{message}</p>
      </div>
    </div>
  )
}

// ── Location Denied Screen ────────────────────────────────────────────────────
function LocationDeniedScreen({ message }: { message: string }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#fff", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', -apple-system, sans-serif", padding: "24px", textAlign: "center",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%", background: "#FFF1F2",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#E8192C" strokeWidth="1.8" />
          <circle cx="12" cy="9" r="2.5" stroke="#E8192C" strokeWidth="1.8" />
          <line x1="4" y1="4" x2="20" y2="20" stroke="#E8192C" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
      <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#111" }}>Location Required</h1>
      <p style={{ margin: 0, fontSize: 15, color: "#888", maxWidth: 300 }}>{message}</p>
      <p style={{ marginTop: 16, fontSize: 13, color: "#bbb" }}>
        Please visit the restaurant and scan the QR code there.
      </p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const params = useParams()
  const slug = String(params.slug)

  const [loading, setLoading] = useState(true)
  const [restaurantOpen, setRestaurantOpen] = useState<boolean | null>(null)
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")

  // Comes from receipt_settings.restaurant_name — the field the owner fills in at
  // Settings → Receipt Settings → "Restaurant Name on Receipt"
  const [restaurantName, setRestaurantName] = useState("Restaurant")

  const [locationStatus, setLocationStatus] = useState<"checking" | "allowed" | "denied" | "error">("checking")
  const [locationError, setLocationError] = useState("")

  const [qrId, setQrId] = useState<string | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [restaurantLocation, setRestaurantLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway" | "">("")
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cartOpen, setCartOpen] = useState(false)

  const catScrollRef = useRef<HTMLDivElement>(null)
  const greeting = getGreeting()

  // ── Fetch menu data ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMenu = async () => {
      // 1. Resolve QR slug → get the owner's user_id
      const { data: qr, error } = await supabase
        .from("qr_codes")
        .select("*")
        .eq("slug", slug)
        .single()

      if (error || !qr) { alert("Invalid QR"); return }

      setQrId(qr.id)
      setRestaurantId(qr.restaurant_id || null)

      const userId = qr.user_id

      // 2. Fire all queries in parallel — avoids sequential waterfall on slow mobile networks
      const [
        { data: restSettings },
        { data: receiptSettings, error: receiptError },
        { data: catData },
        { data: prodData },
      ] = await Promise.all([
        supabase
          .from("restaurant_settings")
          .select("latitude, longitude, open_time, close_time")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("receipt_settings")
          .select("restaurant_name")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase.from("categories").select("*").eq("user_id", userId),
        supabase.from("products").select("*").eq("user_id", userId),
      ])

      // 3. Restaurant name — receipt_settings.restaurant_name
      //    (set by owner in Settings → Receipt Settings → "Restaurant Name on Receipt")
      //    Log to diagnose any RLS issue on unauthenticated mobile sessions
      if (receiptError) {
        console.error("[MenuPage] receipt_settings error:", receiptError.message, "code:", receiptError.code)
      }
      console.log("[MenuPage] receipt_settings data:", receiptSettings)

      if (receiptSettings?.restaurant_name?.trim()) {
        setRestaurantName(receiptSettings.restaurant_name.trim())
      }

      // 4. Open/close + geofence
      if (restSettings?.open_time && restSettings?.close_time) {
        setOpenTime(restSettings.open_time)
        setCloseTime(restSettings.close_time)
        setRestaurantOpen(isRestaurantOpen(restSettings.open_time, restSettings.close_time))
      } else {
        setRestaurantOpen(true)
      }

      if (restSettings?.latitude && restSettings?.longitude) {
        setRestaurantLocation({
          lat: parseFloat(restSettings.latitude),
          lng: parseFloat(restSettings.longitude),
        })
      } else {
        setLocationStatus("allowed")
      }

      // 5. Menu data
      setCategories(catData || [])
      setProducts(prodData || [])
      setLoading(false)
    }

    fetchMenu()
  }, [slug])

  // ── Location check ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!restaurantLocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = getDistanceInMeters(
          pos.coords.latitude, pos.coords.longitude,
          restaurantLocation.lat, restaurantLocation.lng
        )
        if (d <= 100) setLocationStatus("allowed")
        else { setLocationStatus("denied"); setLocationError(`You are ${Math.round(d)}m away from the restaurant.`) }
      },
      () => { setLocationStatus("error"); setLocationError("Location permission denied. Please allow location access.") }
    )
  }, [restaurantLocation])

  // ── Cart helpers ────────────────────────────────────────────────────────────
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0)
    )
  }

  const getQty = (productId: string) => cart.find(i => i.product.id === productId)?.quantity || 0
  const totalAmount = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const totalItems  = cart.reduce((sum, i) => sum + i.quantity, 0)
  const isValidName = (name: string) => /^[A-Za-z\s]{3,}$/.test(name.trim())

  const scrollCats = (dir: "left" | "right") => {
    catScrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
  }

  // ── Place order ─────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (!customerName.trim()) { alert("Enter your name"); return }
    if (!isValidName(customerName)) { alert("Name must contain only letters, minimum 3 characters"); return }
    if (!orderType) { alert("Select dine-in or takeaway"); return }

    setPlacingOrder(true)
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          qr_id: qrId, restaurant_id: restaurantId,
          customer_name: customerName.trim(), order_type: orderType,
          status: "pending", total_amount: totalAmount, total: totalAmount,
        })
        .select("id")
        .single()

      if (orderError || !order) throw new Error(orderError?.message || "Order failed")

      const { error: itemError } = await supabase.from("order_items").insert(
        cart.map(i => ({
          order_id: order.id, product_id: i.product.id,
          product_name: i.product.name, price: i.product.price, quantity: i.quantity,
        }))
      )
      if (itemError) throw new Error(itemError.message)

      setOrderSuccess(true)
      setCart([])
      setCustomerName("")
      setOrderType("")
      setCartOpen(false)
      setTimeout(() => setOrderSuccess(false), 4000)
    } catch (err: any) {
      alert(err.message || "Something went wrong")
    } finally {
      setPlacingOrder(false)
    }
  }

  const filteredProducts = products.filter(p => {
    const catOk = activeCategory === "all" || p.category_id === activeCategory
    const searchOk = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return catOk && searchOk
  })

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen message="Loading menu..." />
  if (restaurantOpen === false) return <ClosedScreen openTime={openTime} closeTime={closeTime} />
  // Block the menu from showing at all until location is confirmed.
  // "checking" means we're still waiting for the browser permission prompt + GPS response.
  if (locationStatus === "checking") return <LoadingScreen message="Verifying your location..." />
  if (locationStatus === "denied" || locationStatus === "error") return <LocationDeniedScreen message={locationError} />

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --red: #E8192C; --red-dark: #C1121F; --red-light: #FFF1F2;
          --gray-bg: #F4F4F4; --border: #EBEBEB;
          --text: #111; --muted: #888;
          --font: 'DM Sans', -apple-system, sans-serif;
        }
        body { font-family: var(--font); background: var(--gray-bg); color: var(--text); }
        .hide-scroll { scrollbar-width: none; }
        .hide-scroll::-webkit-scrollbar { display: none; }

        .cat-pill {
          flex-shrink: 0; padding: 9px 20px; border-radius: 50px;
          border: 1.5px solid var(--border); background: #fff;
          font-size: 13px; font-weight: 600; cursor: pointer;
          white-space: nowrap; color: var(--text); font-family: var(--font);
          transition: all 0.15s ease;
        }
        .cat-pill:hover { border-color: var(--red); color: var(--red); }
        .cat-pill.active { background: var(--red); border-color: var(--red); color: #fff; }

        .cat-arrow {
          flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid var(--border); background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 17px; color: #555; line-height: 1;
          transition: all 0.15s ease; box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .cat-arrow:hover { border-color: var(--red); color: var(--red); background: var(--red-light); }

        .prod-card {
          background: #fff; border-radius: 16px; overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .prod-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

        .add-btn {
          background: var(--red); color: #fff; border: none;
          border-radius: 50px; padding: 7px 16px; font-size: 13px;
          font-weight: 700; cursor: pointer; font-family: var(--font);
          transition: background 0.15s;
        }
        .add-btn:hover { background: var(--red-dark); }

        .qty-minus {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1.5px solid var(--border); background: #fff;
          font-size: 18px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font); transition: all 0.1s;
        }
        .qty-plus {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1.5px solid var(--red); background: var(--red); color: #fff;
          font-size: 18px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font); transition: all 0.1s;
        }
        .qty-minus:hover { border-color: var(--red); color: var(--red); }
        .qty-plus:hover { background: var(--red-dark); }

        .name-input {
          width: 100%; padding: 13px 16px; border-radius: 12px;
          border: 1.5px solid var(--border); background: #f9f9f9;
          font-size: 14px; font-family: var(--font); outline: none;
          transition: border-color 0.15s;
        }
        .name-input:focus { border-color: var(--red); background: #fff; }

        .ot-btn {
          flex: 1; padding: 11px; border-radius: 50px;
          border: 1.5px solid var(--border); background: #fff;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: var(--font); transition: all 0.15s;
        }
        .ot-btn:hover { border-color: var(--red); color: var(--red); }
        .ot-btn.active { background: var(--red); border-color: var(--red); color: #fff; }

        .place-btn {
          width: 100%; padding: 15px; border-radius: 50px;
          background: var(--red); color: #fff; border: none;
          font-size: 15px; font-weight: 800; cursor: pointer;
          font-family: var(--font); transition: background 0.15s, opacity 0.15s;
          letter-spacing: 0.2px;
        }
        .place-btn:not(:disabled):hover { background: var(--red-dark); }
        .place-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .cart-fab {
          display: none;
          position: fixed; bottom: 24px; right: 24px; z-index: 200;
          background: var(--red); color: #fff; border: none;
          border-radius: 50px; padding: 14px 22px;
          font-size: 14px; font-weight: 700; font-family: var(--font);
          cursor: pointer; box-shadow: 0 8px 28px rgba(232,25,44,0.4);
          align-items: center; gap: 8px;
        }
        .toast {
          position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
          background: #111; color: #fff; padding: 14px 28px; border-radius: 50px;
          font-size: 14px; font-weight: 600; z-index: 999;
          animation: slideUp 0.3s ease; white-space: nowrap;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .drawer-overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.4); z-index: 150;
        }
        .drawer {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 160;
          background: #fff; border-radius: 24px 24px 0 0;
          padding: 24px 20px 36px; max-height: 90vh; overflow-y: auto;
          transform: translateY(100%); transition: transform 0.3s ease;
        }
        .drawer.open { transform: translateY(0); }
        .search-bar {
          display: flex; align-items: center; gap: 10px;
          background: #fff; border-radius: 50px; padding: 13px 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }
        .search-bar input {
          border: none; outline: none; font-size: 14px; color: #333;
          width: 100%; font-family: var(--font); background: transparent;
        }
        .search-bar input::placeholder { color: #aaa; }

        @media (max-width: 768px) {
          .desktop-cart { display: none !important; }
          .cart-fab { display: flex !important; }
          .drawer-overlay.open { display: block !important; }
        }
        @media (min-width: 769px) {
          .drawer-overlay { display: none !important; }
          .drawer { display: none !important; }
          .cart-fab { display: none !important; }
        }
      `}</style>

      {/* ── STICKY HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff", borderBottom: "1px solid var(--border)",
        padding: "0 20px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/*
          TOP LEFT — restaurant name from receipt_settings.restaurant_name
          Owner sets this in: Settings → Receipt Settings → "Restaurant Name on Receipt"
        */}
        <div style={{
          fontSize: 18, fontWeight: 800, letterSpacing: "-0.4px", color: "#111",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%",
        }}>
          {restaurantName}
        </div>

        {/*
          TOP RIGHT — MakeMenu app logo, hardcoded, identical for all restaurants.
          Not fetched from DB. This is the platform branding.
        */}
        <MakeMenuLogo />
      </header>

      {/* ── HERO ── */}
      <div style={{ background: "var(--red)", padding: "28px 24px 56px", position: "relative", overflow: "hidden" }}>
        <svg style={{ position: "absolute", right: -20, top: -10, width: 320, height: 210, opacity: 0.1 }} viewBox="0 0 320 210" fill="none">
          <circle cx="60"  cy="60"  r="50" stroke="white" strokeWidth="1.5"/>
          <circle cx="60"  cy="60"  r="30" stroke="white" strokeWidth="1"/>
          <circle cx="200" cy="50"  r="42" stroke="white" strokeWidth="1.5"/>
          <circle cx="200" cy="50"  r="22" stroke="white" strokeWidth="1"/>
          <circle cx="290" cy="130" r="55" stroke="white" strokeWidth="1.5"/>
          <circle cx="290" cy="130" r="32" stroke="white" strokeWidth="1"/>
          <circle cx="110" cy="170" r="38" stroke="white" strokeWidth="1.5"/>
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>{greeting.emoji}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{greeting.text}</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: 4, maxWidth: 260 }}>
          What would you like<br />
          <span style={{ color: "rgba(255,255,255,0.72)" }}>to order today?</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 22 }}>Explore &amp; Order</p>
        <div className="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search for tea, coffee, sandwich..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto" }}>

        {/* ── LEFT: Categories + Products ── */}
        <div style={{ flex: 1, padding: "20px 20px 60px", minWidth: 0 }}>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", color: "var(--muted)", marginBottom: 12 }}>
            BROWSE BY CATEGORY
          </div>

          {/* Category row with scroll arrows */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="cat-arrow" onClick={() => scrollCats("left")} aria-label="Scroll left">‹</button>
            <div
              ref={catScrollRef}
              className="hide-scroll"
              style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, flex: 1 }}
            >
              <button
                className={`cat-pill ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}
              >
                All items
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-pill ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <button className="cat-arrow" onClick={() => scrollCats("right")} aria-label="Scroll right">›</button>
          </div>

          {/* Products grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginTop: 20 }}>
            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 14 }}>
                No items found
              </div>
            )}
            {filteredProducts.map(p => {
              const qty = getQty(p.id)
              const available = p.is_available !== false
              return (
                <div key={p.id} className="prod-card">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name}
                      style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{
                      width: "100%", height: 130,
                      background: "linear-gradient(135deg, #f5f5f5, #e8e8e8)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
                    }}>🍽️</div>
                  )}
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
                    {p.description && (
                      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8, lineHeight: 1.4 }}>
                        {p.description}
                      </div>
                    )}
                    {!available && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>Out of stock</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>₹{p.price}</div>
                      {!available ? (
                        <button disabled style={{
                          background: "#ddd", color: "#999", border: "none",
                          borderRadius: 50, padding: "7px 14px", fontSize: 12,
                          fontWeight: 700, cursor: "not-allowed",
                        }}>Out</button>
                      ) : qty > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button className="qty-minus" onClick={() => removeFromCart(p.id)}>−</button>
                          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{qty}</span>
                          <button className="qty-plus" onClick={() => addToCart(p)}>+</button>
                        </div>
                      ) : (
                        <button className="add-btn" onClick={() => addToCart(p)}>Add</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT: Order Panel (Desktop) ── */}
        <div className="desktop-cart" style={{
          width: 300, flexShrink: 0, position: "sticky", top: 56,
          height: "calc(100vh - 56px)", overflowY: "auto",
          background: "#fff", borderLeft: "1px solid var(--border)",
          padding: "20px 20px 32px",
        }}>
          <OrderPanel
            cart={cart} customerName={customerName} setCustomerName={setCustomerName}
            orderType={orderType} setOrderType={setOrderType}
            totalAmount={totalAmount} totalItems={totalItems}
            addToCart={addToCart} removeFromCart={removeFromCart}
            placingOrder={placingOrder} placeOrder={placeOrder}
          />
        </div>
      </div>

      {/* ── MOBILE FAB ── */}
      {totalItems > 0 && (
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          <span>🛍</span>
          <span>{totalItems} {totalItems === 1 ? "item" : "items"} · ₹{totalAmount}</span>
          <span style={{ marginLeft: 4 }}>›</span>
        </button>
      )}

      {/* ── MOBILE Drawer ── */}
      <div className={`drawer-overlay ${cartOpen ? "open" : ""}`} onClick={() => setCartOpen(false)} />
      <div className={`drawer ${cartOpen ? "open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Your Order</span>
          <button onClick={() => setCartOpen(false)} style={{
            background: "#f0f0f0", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        <OrderPanel
          cart={cart} customerName={customerName} setCustomerName={setCustomerName}
          orderType={orderType} setOrderType={setOrderType}
          totalAmount={totalAmount} totalItems={totalItems}
          addToCart={addToCart} removeFromCart={removeFromCart}
          placingOrder={placingOrder} placeOrder={placeOrder}
          hideTitle
        />
      </div>

      {orderSuccess && <div className="toast">🎉 Order placed successfully!</div>}
    </>
  )
}

// ── Order Panel ───────────────────────────────────────────────────────────────
function OrderPanel({
  cart, customerName, setCustomerName, orderType, setOrderType,
  totalAmount, totalItems, addToCart, removeFromCart, placingOrder, placeOrder, hideTitle,
}: {
  cart: CartItem[]
  customerName: string
  setCustomerName: (v: string) => void
  orderType: "dine_in" | "takeaway" | ""
  setOrderType: (v: "dine_in" | "takeaway") => void
  totalAmount: number
  totalItems: number
  addToCart: (p: Product) => void
  removeFromCart: (id: string) => void
  placingOrder: boolean
  placeOrder: () => void
  hideTitle?: boolean
}) {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {!hideTitle && <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Your Order</div>}

      <div style={{
        background: "var(--red)", color: "#fff", borderRadius: 50,
        padding: "6px 14px", fontSize: 12, fontWeight: 700,
        display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16,
      }}>
        🛍 {totalItems} {totalItems === 1 ? "item" : "items"}
      </div>

      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 16, minHeight: 60 }}>
        {cart.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>
            Your cart is empty
          </div>
        ) : cart.map(item => (
          <div key={item.product.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, overflow: "hidden",
              background: "#f0f0f0", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              {item.product.image_url
                ? <img src={item.product.image_url} alt={item.product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : "🍽️"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{item.product.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>₹{item.product.price}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => removeFromCart(item.product.id)} style={{
                width: 26, height: 26, borderRadius: "50%",
                border: "1.5px solid var(--border)", background: "#fff",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>−</button>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
              <button onClick={() => addToCart(item.product)} style={{
                width: 26, height: 26, borderRadius: "50%",
                border: "1.5px solid var(--red)", background: "var(--red)", color: "#fff",
                fontSize: 16, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>+</button>
            </div>
          </div>
        ))}
      </div>

      <input
        className="name-input"
        type="text"
        placeholder="Your name"
        value={customerName}
        onChange={e => { const v = e.target.value; if (/^[A-Za-z\s]*$/.test(v)) setCustomerName(v) }}
        style={{ marginBottom: 12 }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className={`ot-btn ${orderType === "dine_in" ? "active" : ""}`} onClick={() => setOrderType("dine_in")}>Dine-in</button>
        <button className={`ot-btn ${orderType === "takeaway" ? "active" : ""}`} onClick={() => setOrderType("takeaway")}>Take away</button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
        <span style={{ fontSize: 18, fontWeight: 800 }}>₹{totalAmount}</span>
      </div>

      <button className="place-btn" disabled={placingOrder || cart.length === 0} onClick={placeOrder}>
        {placingOrder ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  )
}
