"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { LogOut, Search } from "lucide-react"

type Payment = {
  id: string
  user_id: string
  client_name: string
  created_at: string
  plan_type: string
  utr: string
  amount: number
  status: string
}

type ManagedUser = {
  id: string
  shop_name: string
  email: string
  is_paid: boolean
  is_frozen: boolean
  subscription_end: string | null
}

type ActiveTab = "pending" | "account"

export default function AdminPayments() {
  const [authorized, setAuthorized] = useState(false) // ✅ page hidden until verified
  const [payments, setPayments] = useState<Payment[]>([])
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>("pending")
  const [search, setSearch] = useState("")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  // ── Admin auth check — MUST pass before anything renders ──
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      const { data: dbUser } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      if (!dbUser?.is_admin) {
        router.replace("/")  // not admin → send to home
        return
      }

      // ✅ confirmed admin — now show the page and load data
      setAuthorized(true)
      fetchPayments()
      fetchManagedUsers()
    }

    checkAdmin()
  }, [])

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
    if (error) { console.error("Fetch payments error:", error.message); return }
    setPayments(data || [])
  }

  const fetchManagedUsers = async () => {
    const res = await fetch("/api/get-managed-users")
    const data = await res.json()
    if (!res.ok) { console.error("Fetch users error:", data.error); return }
    setManagedUsers(data.users || [])
  }

  useEffect(() => {
    if (!authorized) return
    if (activeTab === "pending") fetchPayments()
    else fetchManagedUsers()
  }, [activeTab])

  const formatDate = (iso: string | null) => {
    if (!iso) return "—"
    const d = new Date(iso)
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  }

  const approve = async (paymentId: string) => {
    setLoadingId(paymentId)
    const res = await fetch("/api/approve-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    })
    const data = await res.json()
    setLoadingId(null)
    if (!res.ok) { alert(data.error || "Failed to approve"); return }
    alert("Approved ✅")
    fetchPayments()
  }

  const reject = async (paymentId: string) => {
    setLoadingId(paymentId)
    const { error } = await supabase
      .from("payments")
      .update({ status: "rejected" })
      .eq("id", paymentId)
    setLoadingId(null)
    if (error) { alert("Failed to reject: " + error.message); return }
    alert("Rejected ❌")
    fetchPayments()
  }

  const toggleFreeze = async (userId: string, currentlyFrozen: boolean) => {
    setLoadingId(userId)
    const res = await fetch("/api/toggle-freeze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, freeze: !currentlyFrozen }),
    })
    const data = await res.json()
    setLoadingId(null)
    if (!res.ok) { alert(data.error || "Failed to update account"); return }
    fetchManagedUsers()
  }

  const filteredPayments = payments.filter((p) =>
    (p.client_name ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = managedUsers.filter((u) =>
    (u.shop_name ?? u.email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  // ✅ Render nothing while checking auth — prevents any flash
  if (!authorized) return null

  return (
    <div style={styles.root}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h1 style={styles.brandTitle}>MakeMenu Admin</h1>
          <p style={styles.brandSub}>Subcrption &amp; Account Management</p>
        </div>

        <nav style={styles.nav}>
          <button
            style={{ ...styles.navItem, ...(activeTab === "pending" ? styles.navItemActive : {}) }}
            onClick={() => { setSearch(""); setActiveTab("pending") }}
          >
            Pending Request
          </button>
          <button
            style={{ ...styles.navItem, ...(activeTab === "account" ? styles.navItemActive : {}) }}
            onClick={() => { setSearch(""); setActiveTab("account") }}
          >
            Account Management
          </button>
        </nav>

        <button
          style={styles.logout}
          onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
        >
          <LogOut size={18} color="#333" strokeWidth={1.8} />
          <span style={styles.logoutText}>Logout</span>
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.filtersWrapper}>
          <div style={styles.searchBox}>
            <Search size={18} color="#999" />
            <input
              style={styles.searchInput}
              placeholder="Search by client name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {activeTab === "pending" && (
          <div style={styles.cardsArea}>
            {filteredPayments.length === 0 ? (
              <p style={styles.empty}>No pending requests found.</p>
            ) : (
              filteredPayments.map((p) => (
                <div key={p.id} style={styles.card}>
                  <div style={styles.cardGrid}>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>CLIENT NAME</span>
                      <span style={styles.fieldValue}>{p.client_name ?? "—"}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>REQUEST DATE</span>
                      <span style={styles.fieldValue}>{formatDate(p.created_at)}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>PLAN TYPE</span>
                      <span style={{ ...styles.fieldValue, color: "#e53935" }}>{p.plan_type ?? "—"}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>UTR ID</span>
                      <span style={{ ...styles.fieldValue, color: "#e53935" }}>{p.utr ?? "—"}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>AMOUNT</span>
                      <span style={styles.fieldValue}>₹{p.amount ?? "—"}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>USER ID</span>
                      <span style={{ ...styles.fieldValue, fontSize: 11, color: "#888", wordBreak: "break-all" }}>
                        {p.user_id ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={{ ...styles.acceptBtn, opacity: loadingId === p.id ? 0.6 : 1 }}
                      onClick={() => approve(p.id)}
                      disabled={loadingId === p.id}
                    >
                      {loadingId === p.id ? "Processing..." : "Accept"}
                    </button>
                    <button
                      style={{ ...styles.rejectBtn, opacity: loadingId === p.id ? 0.6 : 1 }}
                      onClick={() => reject(p.id)}
                      disabled={loadingId === p.id}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "account" && (
          <div style={styles.cardsArea}>
            {filteredUsers.length === 0 ? (
              <p style={styles.empty}>No active accounts found.</p>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    ...styles.card,
                    borderLeft: u.is_frozen ? "4px solid #f59e0b" : "4px solid #22c55e",
                  }}
                >
                  <div style={styles.cardGrid}>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>CLIENT NAME</span>
                      <span style={styles.fieldValue}>{u.shop_name || "—"}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>EMAIL</span>
                      <span style={{ ...styles.fieldValue, fontSize: 13, color: "#555" }}>{u.email || "—"}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>PLAN TYPE</span>
                      <span style={{ ...styles.fieldValue, color: "#e53935" }}>Growth</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>SUBSCRIPTION END</span>
                      <span style={styles.fieldValue}>{formatDate(u.subscription_end)}</span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>STATUS</span>
                      <span style={{ ...styles.fieldValue, color: u.is_frozen ? "#f59e0b" : "#22c55e" }}>
                        {u.is_frozen ? "🔒 Frozen" : "✅ Active"}
                      </span>
                    </div>
                    <div style={styles.fieldBlock}>
                      <span style={styles.fieldLabel}>USER ID</span>
                      <span style={{ ...styles.fieldValue, fontSize: 11, color: "#888", wordBreak: "break-all" }}>
                        {u.id}
                      </span>
                    </div>
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={{
                        ...styles.freezeBtn,
                        background: u.is_frozen ? "#22c55e" : "#e53935",
                        opacity: loadingId === u.id ? 0.6 : 1,
                      }}
                      onClick={() => toggleFreeze(u.id, u.is_frozen)}
                      disabled={loadingId === u.id}
                    >
                      {loadingId === u.id
                        ? "Processing..."
                        : u.is_frozen
                        ? "Unfreeze Account"
                        : "Freeze Account"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f0f0f0" },
  sidebar: { width: 200, minWidth: 200, background: "#e5e5e5", display: "flex", flexDirection: "column" },
  sidebarHeader: { background: "#e53935", padding: "20px 16px 18px" },
  brandTitle: { margin: 0, color: "#fff", fontSize: 22, fontWeight: 800, lineHeight: 1.2 },
  brandSub: { margin: "4px 0 0", color: "#fff", fontSize: 12, fontWeight: 400 },
  nav: { display: "flex", flexDirection: "column" },
  navItem: { padding: "18px 16px", textAlign: "left", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#333", fontFamily: "inherit", lineHeight: 1.3 },
  navItemActive: { background: "#e53935", color: "#fff", borderRadius: 8, margin: "4px 8px", padding: "14px 12px" },
  logout: { display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", border: "none", background: "none", cursor: "pointer", marginTop: "auto", marginBottom: 16 },
  logoutText: { fontSize: 14, color: "#333", fontFamily: "inherit" },
  main: { flex: 1, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 },
  filtersWrapper: { maxWidth: 720 },
  searchBox: { display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 14px" },
  searchInput: { border: "none", outline: "none", fontSize: 14, color: "#333", flex: 1, fontFamily: "inherit", background: "transparent" },
  cardsArea: { display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 },
  card: { background: "#fff", borderRadius: 12, padding: "24px 28px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  cardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 32px", marginBottom: 22 },
  fieldBlock: { display: "flex", flexDirection: "column", gap: 2 },
  fieldLabel: { fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const },
  fieldValue: { fontSize: 17, fontWeight: 700, color: "#111", marginTop: 2 },
  actions: { display: "flex", gap: 14 },
  acceptBtn: { background: "#e53935", color: "#fff", border: "none", borderRadius: 8, padding: "13px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  rejectBtn: { background: "#fff", color: "#111", border: "2px solid #ccc", borderRadius: 8, padding: "13px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  freezeBtn: { color: "#fff", border: "none", borderRadius: 8, padding: "13px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  empty: { color: "#999", fontSize: 14, padding: "20px 0" },
}