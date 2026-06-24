"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type Category = {
  id: string
  name: string
  takeaway_charge?: number
}

type Product = {
  id: string
  name: string
  description?: string
  price: number
  category_id: string
  is_available?: boolean
  image_url?: string
  type?: string
}

type AddonItem = {
  id: string
  group_id: string
  name: string
  price: number
}

type AddonGroup = {
  id: string
  product_id: string
  name: string
  max_selections: number
  is_required: boolean
  items: AddonItem[]
}

type SelectedAddons = Record<string, string[]> // group_id → item_id[]

type CartItem = {
  product: Product
  quantity: number
  selectedAddons: SelectedAddons
  addonGroups: AddonGroup[]
  addonTotal: number
}

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

function MakeMenuLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" />
      <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#E8192C", letterSpacing: "-0.3px" }} />
    </div>
  )
}

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

// ── Addon Selection Modal (Swiggy-style) ─────────────────────────────────────
function AddonModal({
  product,
  groups,
  onClose,
  onConfirm,
}: {
  product: Product
  groups: AddonGroup[]
  onClose: () => void
  onConfirm: (selected: SelectedAddons, addonTotal: number) => void
}) {
  const [selected, setSelected] = useState<SelectedAddons>({})
  const [qty, setQty] = useState(1)

  const toggleItem = (group: AddonGroup, itemId: string) => {
    setSelected(prev => {
      const current = prev[group.id] || []
      if (current.includes(itemId)) {
        // Deselect
        return { ...prev, [group.id]: current.filter(id => id !== itemId) }
      }
      // Enforce max
      if (current.length >= group.max_selections) {
        if (group.max_selections === 1) {
          // Replace single selection
          return { ...prev, [group.id]: [itemId] }
        }
        return prev // at max, ignore
      }
      return { ...prev, [group.id]: [...current, itemId] }
    })
  }

  const addonTotal = groups.reduce((sum, group) => {
    const sel = selected[group.id] || []
    return sum + sel.reduce((s, itemId) => {
      const item = group.items.find(i => i.id === itemId)
      return s + (item?.price || 0)
    }, 0)
  }, 0)

  const itemTotal = (product.price + addonTotal) * qty

  const canConfirm = groups
    .filter(g => g.is_required)
    .every(g => (selected[g.id] || []).length > 0)

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <>
      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .addon-item-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;
          transition: background 0.1s;
        }
        .addon-item-row:last-child { border-bottom: none; }
        .addon-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #d1d5db; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .addon-radio.selected { border-color: #E8192C; background: #E8192C; }
        .addon-checkbox {
          width: 20px; height: 20px; border-radius: 5px;
          border: 2px solid #d1d5db; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s;
        }
        .addon-checkbox.selected { border-color: #E8192C; background: #E8192C; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 500, animation: "overlayFadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 510,
        background: "#fff", borderRadius: "20px 20px 0 0",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        animation: "modalSlideUp 0.3s ease",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e0e0e0" }} />
        </div>

        {/* Product header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 20px 16px", borderBottom: "1px solid #f0f0f0",
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 12, overflow: "hidden",
            background: "#f5f5f5", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>
            {product.image_url
              ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : "🍽️"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>{product.name}</div>
            <div style={{ fontSize: 14, color: "#E8192C", fontWeight: 700, marginTop: 2 }}>₹{product.price}</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "#555", flexShrink: 0,
          }}>×</button>
        </div>

        {/* Scrollable groups */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
          {groups.map(group => (
            <div key={group.id} style={{ paddingTop: 20, paddingBottom: 4 }}>
              {/* Group label */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{group.name}</span>
                  {group.is_required && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, background: "#FFF1F2",
                      color: "#E8192C", border: "1px solid #FECDD3",
                      borderRadius: 20, padding: "2px 8px", letterSpacing: 0.3,
                    }}>REQUIRED</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>
                  {group.max_selections === 1
                    ? "Select 1"
                    : `Select up to ${group.max_selections}`}
                  {(selected[group.id] || []).length > 0 && (
                    <span style={{ color: "#E8192C", fontWeight: 700 }}>
                      {" "}· {(selected[group.id] || []).length} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Items */}
              <div style={{ background: "#fff", border: "1px solid #f0f0f0", borderRadius: 14, overflow: "hidden" }}>
                {group.items.map(item => {
                  const isSel = (selected[group.id] || []).includes(item.id)
                  const isRadio = group.max_selections === 1
                  return (
                    <div
                      key={item.id}
                      className="addon-item-row"
                      style={{ padding: "13px 16px" }}
                      onClick={() => toggleItem(group, item.id)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className={isRadio ? `addon-radio ${isSel ? "selected" : ""}` : `addon-checkbox ${isSel ? "selected" : ""}`}>
                          {isSel && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d={isRadio ? "M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" : "M1.5 5l2.5 2.5 4.5-4.5"} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={isRadio ? "#fff" : "none"} />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>{item.name}</span>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: item.price > 0 ? "#E8192C" : "#22c55e",
                      }}>
                        {item.price > 0 ? `+₹${item.price}` : "Free"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          <div style={{ height: 16 }} />
        </div>

        {/* Footer: qty + add button */}
        <div style={{
          padding: "16px 20px 28px",
          borderTop: "1px solid #f0f0f0",
          background: "#fff",
        }}>
          {/* Required group warning */}
          {!canConfirm && (
            <div style={{ fontSize: 12, color: "#E8192C", fontWeight: 600, marginBottom: 10, textAlign: "center" }}>
              Please select from all required groups
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Qty stepper */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              border: "1.5px solid #e5e7eb", borderRadius: 50,
              padding: "8px 14px", flexShrink: 0,
            }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "1.5px solid #d1d5db", background: "#fff",
                  cursor: "pointer", fontSize: 16, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1, color: "#333",
                }}
              >−</button>
              <span style={{ fontSize: 15, fontWeight: 800, minWidth: 16, textAlign: "center" }}>{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "1.5px solid #E8192C", background: "#E8192C",
                  cursor: "pointer", fontSize: 16, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1, color: "#fff",
                }}
              >+</button>
            </div>

            {/* Add item button */}
            <button
              disabled={!canConfirm}
              onClick={() => onConfirm(selected, addonTotal)}
              style={{
                flex: 1, background: canConfirm ? "#E8192C" : "#e5e7eb",
                color: canConfirm ? "#fff" : "#aaa",
                border: "none", borderRadius: 50,
                padding: "13px 20px", fontSize: 14, fontWeight: 800,
                cursor: canConfirm ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.15s",
              }}
            >
              <span>Add Item</span>
              <span>₹{itemTotal}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Cart key: unique per product+addons combo ─────────────────────────────────
function cartKey(productId: string, selected: SelectedAddons): string {
  const sorted = Object.keys(selected).sort().map(k => `${k}:${[...(selected[k] || [])].sort().join(",")}`).join("|")
  return `${productId}__${sorted}`
}

export default function MenuPage() {
  const params = useParams()
  const slug = String(params.slug)

  const [loading, setLoading]                   = useState(true)
  const [restaurantOpen, setRestaurantOpen]     = useState<boolean | null>(null)
  const [openTime, setOpenTime]                 = useState("")
  const [closeTime, setCloseTime]               = useState("")
  const [restaurantName, setRestaurantName]     = useState("Restaurant")
  const [locationStatus, setLocationStatus]     = useState<"checking" | "allowed" | "denied" | "error">("checking")
  const [locationError, setLocationError]       = useState("")
  const [qrId, setQrId]                         = useState<string | null>(null)
  const [restaurantId, setRestaurantId]         = useState<string | null>(null)
  const [restaurantLocation, setRestaurantLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [categories, setCategories]             = useState<Category[]>([])
  const [products, setProducts]                 = useState<Product[]>([])
  const [allAddonGroups, setAllAddonGroups]     = useState<AddonGroup[]>([])
  const [cart, setCart]                         = useState<CartItem[]>([])
  const [customerName, setCustomerName]         = useState("")
  const [orderType, setOrderType]               = useState<"dine_in" | "takeaway" | "">("")
  const [placingOrder, setPlacingOrder]         = useState(false)
  const [orderSuccess, setOrderSuccess]         = useState(false)
  const [activeCategory, setActiveCategory]     = useState<string>("all")
  const [searchQuery, setSearchQuery]           = useState("")
  const [cartOpen, setCartOpen]                 = useState(false)
  const [expandedDesc, setExpandedDesc]         = useState<Record<string, boolean>>({})
  const [addonModal, setAddonModal]             = useState<{ product: Product; groups: AddonGroup[] } | null>(null)

  const toggleDesc = (id: string) => setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }))
  const catScrollRef = useRef<HTMLDivElement>(null)
  const greeting = getGreeting()

  useEffect(() => {
    const fetchMenu = async () => {
      const { data: qr, error } = await supabase
        .from("qr_codes").select("*").eq("slug", slug).single()
      if (error || !qr) { alert("Invalid QR"); return }
      setQrId(qr.id)
      setRestaurantId(qr.restaurant_id || null)
      const userId = qr.user_id

      const [
        { data: restSettings },
        { data: receiptSettings, error: receiptError },
        { data: catData },
        { data: prodData },
        { data: addonGroupData },
      ] = await Promise.all([
        supabase.from("restaurant_settings").select("latitude, longitude, open_time, close_time").eq("user_id", userId).maybeSingle(),
        supabase.from("receipt_settings").select("restaurant_name").eq("user_id", userId).maybeSingle(),
        supabase.from("categories").select("*").eq("user_id", userId),
        supabase.from("products").select("*").eq("user_id", userId),
        supabase.from("addon_groups").select("*, addon_items(*)").eq("user_id", userId).order("created_at", { ascending: true }),
      ])

      if (receiptError) console.error("[MenuPage] receipt_settings error:", receiptError.message)
      if (receiptSettings?.restaurant_name?.trim()) setRestaurantName(receiptSettings.restaurant_name.trim())

      if (restSettings?.open_time && restSettings?.close_time) {
        setOpenTime(restSettings.open_time)
        setCloseTime(restSettings.close_time)
        setRestaurantOpen(isRestaurantOpen(restSettings.open_time, restSettings.close_time))
      } else {
        setRestaurantOpen(true)
      }

      if (restSettings?.latitude && restSettings?.longitude) {
        setRestaurantLocation({ lat: parseFloat(restSettings.latitude), lng: parseFloat(restSettings.longitude) })
      } else {
        setLocationStatus("allowed")
      }

      setCategories(catData || [])
      setProducts(prodData || [])
      setAllAddonGroups(
        (addonGroupData || []).map((g: any) => ({ ...g, items: g.addon_items || [] }))
      )
      setLoading(false)
    }
    fetchMenu()
  }, [slug])

  useEffect(() => {
    if (!restaurantLocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = getDistanceInMeters(pos.coords.latitude, pos.coords.longitude, restaurantLocation.lat, restaurantLocation.lng)
        if (d <= 100) setLocationStatus("allowed")
        else { setLocationStatus("denied"); setLocationError(`You are ${Math.round(d)}m away from the restaurant.`) }
      },
      () => { setLocationStatus("error"); setLocationError("Location permission denied. Please allow location access.") }
    )
  }, [restaurantLocation])

  // ── When "Add" is tapped on a product ──────────────────────────────────────
  const handleAddTap = (product: Product) => {
    const groups = allAddonGroups.filter(g => g.product_id === product.id)
    if (groups.length === 0) {
      // No addons — add directly
      addDirectToCart(product)
    } else {
      setAddonModal({ product, groups })
    }
  }

  const addDirectToCart = (product: Product) => {
    setCart(prev => {
      const key = cartKey(product.id, {})
      const existing = prev.find(i => cartKey(i.product.id, i.selectedAddons) === key)
      if (existing) return prev.map(i => cartKey(i.product.id, i.selectedAddons) === key ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1, selectedAddons: {}, addonGroups: [], addonTotal: 0 }]
    })
  }

  const handleAddonConfirm = (selected: SelectedAddons, addonTotal: number) => {
    if (!addonModal) return
    const { product, groups } = addonModal
    const key = cartKey(product.id, selected)
    setCart(prev => {
      const existing = prev.find(i => cartKey(i.product.id, i.selectedAddons) === key)
      if (existing) return prev.map(i => cartKey(i.product.id, i.selectedAddons) === key ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1, selectedAddons: selected, addonGroups: groups, addonTotal }]
    })
    setAddonModal(null)
  }

  const removeFromCart = (key: string) => {
    setCart(prev =>
      prev.map(i => cartKey(i.product.id, i.selectedAddons) === key ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    )
  }

  const addToCartByKey = (item: CartItem) => {
    const key = cartKey(item.product.id, item.selectedAddons)
    setCart(prev => prev.map(i => cartKey(i.product.id, i.selectedAddons) === key ? { ...i, quantity: i.quantity + 1 } : i))
  }

  const getQty = (productId: string) => {
    return cart.filter(i => i.product.id === productId).reduce((sum, i) => sum + i.quantity, 0)
  }

  const isValidName = (name: string) => /^[A-Za-z\s]{3,}$/.test(name.trim())
  const scrollCats = (dir: "left" | "right") => {
    catScrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" })
  }

  const totalItems  = cart.reduce((sum, i) => sum + i.quantity, 0)
  const totalFood   = cart.reduce((sum, i) => sum + (i.product.price + i.addonTotal) * i.quantity, 0)
  const totalTakeaway = orderType === "takeaway"
    ? cart.reduce((sum, i) => {
        const cat = categories.find(c => c.id === i.product.category_id)
        return sum + (cat?.takeaway_charge ?? 0) * i.quantity
      }, 0)
    : 0
  const totalAmount = totalFood + totalTakeaway

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
        .select("id").single()

      if (orderError || !order) throw new Error(orderError?.message || "Order failed")

      const { error: itemError } = await supabase.from("order_items").insert(
        cart.map(i => ({
          order_id: order.id, product_id: i.product.id,
          product_name: i.product.name,
          price: i.product.price + i.addonTotal,
          quantity: i.quantity,
          addons: Object.keys(i.selectedAddons).length > 0
            ? i.addonGroups.map(g => ({
                group: g.name,
                items: (i.selectedAddons[g.id] || [])
                  .map(itemId => g.items.find(it => it.id === itemId))
                  .filter(Boolean)
                  .map(it => ({ name: it!.name, price: it!.price })),
              }))
            : null,
        }))
      )
      if (itemError) throw new Error(itemError.message)

      setOrderSuccess(true)
      setCart([]); setCustomerName(""); setOrderType(""); setCartOpen(false)
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

  if (loading) return <LoadingScreen message="Loading menu..." />
  if (restaurantOpen === false) return <ClosedScreen openTime={openTime} closeTime={closeTime} />
  if (locationStatus === "checking") return <LoadingScreen message="Verifying your location..." />
  if (locationStatus === "denied" || locationStatus === "error") return <LocationDeniedScreen message={locationError} />

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
          transition: background 0.15s; white-space: nowrap;
        }
        .add-btn:hover { background: var(--red-dark); }
        .customise-tag {
          font-size: 10px; color: var(--muted); text-align: right;
          margin-top: 2px; font-weight: 600; letter-spacing: 0.2px;
        }
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

      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff", borderBottom: "1px solid var(--border)",
        padding: "0 20px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontSize: 18, fontWeight: 800, letterSpacing: "-0.4px", color: "#111",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%",
        }}>
          {restaurantName}
        </div>
        <MakeMenuLogo />
      </header>

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

      <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ flex: 1, padding: "20px 20px 60px", minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", color: "var(--muted)", marginBottom: 12 }}>
            BROWSE BY CATEGORY
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button className="cat-arrow" onClick={() => scrollCats("left")}>‹</button>
            <div ref={catScrollRef} className="hide-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, flex: 1 }}>
              <button className={`cat-pill ${activeCategory === "all" ? "active" : ""}`} onClick={() => setActiveCategory("all")}>
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
            <button className="cat-arrow" onClick={() => scrollCats("right")}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginTop: 20 }}>
            {filteredProducts.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 14 }}>
                No items found
              </div>
            )}
            {filteredProducts.map(p => {
              const qty = getQty(p.id)
              const available = p.is_available !== false
              const hasAddons = allAddonGroups.some(g => g.product_id === p.id)
              return (
                <div key={p.id} className="prod-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 130, objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{
                      width: "100%", height: 130,
                      background: "linear-gradient(135deg, #f5f5f5, #e8e8e8)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40,
                    }}>🍽️</div>
                  )}
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{p.name}</div>
                    {p.description && (
                      <div style={{ marginBottom: 8 }}>
                        <div style={{
                          fontSize: 12, color: "var(--muted)", lineHeight: 1.4,
                          wordBreak: "break-word", overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: expandedDesc[p.id] ? 999 : 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {p.description}
                        </div>
                        {p.description.length > 60 && (
                          <button
                            onClick={e => { e.stopPropagation(); toggleDesc(p.id) }}
                            style={{
                              background: "none", border: "none", padding: 0,
                              fontSize: 11, fontWeight: 700, color: "var(--red)",
                              cursor: "pointer", fontFamily: "var(--font)", marginTop: 2,
                            }}
                          >
                            {expandedDesc[p.id] ? "less ▲" : "more ▼"}
                          </button>
                        )}
                      </div>
                    )}
                    {!available && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>Out of stock</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>₹{p.price}</div>
                      {!available ? (
                        <button disabled style={{ background: "#ddd", color: "#999", border: "none", borderRadius: 50, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "not-allowed" }}>Out</button>
                      ) : qty > 0 && !hasAddons ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button className="qty-minus" onClick={() => removeFromCart(cartKey(p.id, {}))}>−</button>
                          <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{qty}</span>
                          <button className="qty-plus" onClick={() => addDirectToCart(p)}>+</button>
                        </div>
                      ) : (
                        <div>
                          <button className="add-btn" onClick={() => handleAddTap(p)}>
                            {qty > 0 ? `${qty} added` : "Add"}
                          </button>
                          {hasAddons && <div className="customise-tag">Customisable</div>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="desktop-cart" style={{
          width: 300, flexShrink: 0, position: "sticky", top: 56,
          height: "calc(100vh - 56px)", overflowY: "auto",
          background: "#fff", borderLeft: "1px solid var(--border)",
          padding: "20px 20px 32px",
        }}>
          <OrderPanel
            cart={cart} customerName={customerName} setCustomerName={setCustomerName}
            orderType={orderType} setOrderType={setOrderType}
            totalFood={totalFood} totalTakeaway={totalTakeaway} totalAmount={totalAmount} totalItems={totalItems}
            addToCartByKey={addToCartByKey} removeFromCart={removeFromCart}
            placingOrder={placingOrder} placeOrder={placeOrder}
          />
        </div>
      </div>

      {totalItems > 0 && !cartOpen && (
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          <span>🛍</span>
          <span>{totalItems} {totalItems === 1 ? "item" : "items"} · ₹{totalAmount}</span>
          <span style={{ marginLeft: 4 }}>›</span>
        </button>
      )}

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
          totalFood={totalFood} totalTakeaway={totalTakeaway} totalAmount={totalAmount} totalItems={totalItems}
          addToCartByKey={addToCartByKey} removeFromCart={removeFromCart}
          placingOrder={placingOrder} placeOrder={placeOrder}
          hideTitle
        />
      </div>

      {/* Addon Modal */}
      {addonModal && (
        <AddonModal
          product={addonModal.product}
          groups={addonModal.groups}
          onClose={() => setAddonModal(null)}
          onConfirm={handleAddonConfirm}
        />
      )}

      {orderSuccess && <div className="toast">🎉 Order placed successfully!</div>}
    </>
  )
}

function OrderPanel({
  cart, customerName, setCustomerName, orderType, setOrderType,
  totalFood, totalTakeaway, totalAmount, totalItems,
  addToCartByKey, removeFromCart, placingOrder, placeOrder, hideTitle,
}: {
  cart: CartItem[]
  customerName: string
  setCustomerName: (v: string) => void
  orderType: "dine_in" | "takeaway" | ""
  setOrderType: (v: "dine_in" | "takeaway") => void
  totalFood: number
  totalTakeaway: number
  totalAmount: number
  totalItems: number
  addToCartByKey: (item: CartItem) => void
  removeFromCart: (key: string) => void
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
        ) : cart.map(item => {
          const key = cartKey(item.product.id, item.selectedAddons)
          const addonLabels = item.addonGroups.flatMap(g =>
            (item.selectedAddons[g.id] || []).map(iid => g.items.find(it => it.id === iid)?.name).filter(Boolean)
          )
          return (
            <div key={key} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, overflow: "hidden",
                  background: "#f0f0f0", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>
                  {item.product.image_url
                    ? <img src={item.product.image_url} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : "🍽️"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.product.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    ₹{item.product.price + item.addonTotal}
                    {item.addonTotal > 0 && (
                      <span style={{ color: "#E8192C", fontSize: 11 }}> (+₹{item.addonTotal} addons)</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => removeFromCart(key)} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    border: "1.5px solid var(--border)", background: "#fff",
                    fontSize: 16, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                  <button onClick={() => addToCartByKey(item)} style={{
                    width: 26, height: 26, borderRadius: "50%",
                    border: "1.5px solid var(--red)", background: "var(--red)", color: "#fff",
                    fontSize: 16, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>+</button>
                </div>
              </div>
              {/* Addon tags */}
              {addonLabels.length > 0 && (
                <div style={{ marginTop: 5, marginLeft: 52, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {addonLabels.map((label, i) => (
                    <span key={i} style={{
                      fontSize: 10, fontWeight: 600, background: "#f3f4f6",
                      color: "#555", borderRadius: 20, padding: "2px 8px",
                    }}>{label}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
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

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 6 }}>
          <span>Subtotal</span>
          <span>₹{totalFood}</span>
        </div>
        {totalTakeaway > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#E8192C", marginBottom: 6 }}>
            <span>Takeaway charges</span>
            <span>+₹{totalTakeaway}</span>
          </div>
        )}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4,
        }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 800 }}>₹{totalAmount}</span>
        </div>
      </div>

      <button className="place-btn" disabled={placingOrder || cart.length === 0} onClick={placeOrder}>
        {placingOrder ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  )
}