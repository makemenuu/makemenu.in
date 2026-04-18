"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts"

/* ─── Types ─── */
type Filter = "all" | "today" | "7d" | "30d"

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label, prefix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <p className="text-[#aaa] mb-0.5">{label}</p>
        <p className="font-semibold font-mono">
          {prefix}{typeof payload[0].value === "number"
            ? payload[0].value.toLocaleString("en-IN")
            : payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

/* ─── KPI Card ─── */
function KpiCard({
  label,
  value,
  badge,
  icon,
  delay = 0,
}: {
  label: string
  value: string
  badge: string
  icon: React.ReactNode
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
      }}
    >
      {/* Red top accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#E8304A] rounded-t-2xl" />

      <div className="w-9 h-9 rounded-xl bg-[#fff0f2] flex items-center justify-center mb-3">
        {icon}
      </div>

      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-[28px] font-semibold text-gray-900 tracking-tight font-mono leading-none mb-2">
        {value}
      </p>
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1">
        {badge}
      </span>
    </div>
  )
}

/* ─── Chart Card ─── */
function ChartCard({
  title,
  tag,
  delay = 0,
  children,
  className = "",
}: {
  title: string
  tag?: string
  delay?: number
  children: React.ReactNode
  className?: string
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-500 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {tag && (
          <span className="text-[11px] font-medium text-[#E8304A] bg-[#fff0f2] rounded-full px-3 py-1">
            {tag}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

/* ─── Top Item Row ─── */
function TopItemRow({
  rank,
  name,
  qty,
  maxQty,
}: {
  rank: number
  name: string
  qty: number
  maxQty: number
}) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth((qty / maxQty) * 100), 300 + rank * 80)
    return () => clearTimeout(t)
  }, [qty, maxQty, rank])

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-none">
      <span className="text-[11px] font-bold text-[#E8304A] font-mono w-5 shrink-0">
        #{rank}
      </span>
      <span className="text-[13px] font-medium text-gray-800 flex-1 truncate">{name}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#E8304A] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-[12px] font-semibold text-gray-600 font-mono w-6 text-right shrink-0">
        {qty}
      </span>
    </div>
  )
}

/* ─── Icons ─── */
const IconOrders = () => (
  <svg className="w-4 h-4 stroke-[#E8304A]" viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
)

const IconRevenue = () => (
  <svg className="w-4 h-4 stroke-[#E8304A]" viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)

const IconAvg = () => (
  <svg className="w-4 h-4 stroke-[#E8304A]" viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

/* ─── Main Page ─── */
export default function StatsPage() {
  const [totalOrders, setTotalOrders] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [avgOrder, setAvgOrder] = useState(0)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [topItems, setTopItems] = useState<any[]>([])
  const [hourlyData, setHourlyData] = useState<any[]>([])
  const [orderTypeData, setOrderTypeData] = useState<any[]>([])
  const [dateFilter, setDateFilter] = useState<Filter>("all")
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: resetData } = await supabase
      .from("analytics_reset")
      .select("reset_at")
      .order("reset_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastReset = resetData?.reset_at

    let query = supabase
      .from("orders")
      .select("id,total_amount,created_at,order_type")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .eq("is_deleted", false)

    if (lastReset) query = query.gt("created_at", lastReset)

    const now = new Date()
    if (dateFilter === "today") {
      const start = new Date(); start.setHours(0, 0, 0, 0)
      query = query.gt("created_at", start.toISOString())
    }
    if (dateFilter === "7d") {
      const start = new Date(); start.setDate(now.getDate() - 7)
      query = query.gt("created_at", start.toISOString())
    }
    if (dateFilter === "30d") {
      const start = new Date(); start.setDate(now.getDate() - 30)
      query = query.gt("created_at", start.toISOString())
    }

    const { data: orders } = await query
    if (!orders) { setLoading(false); return }

    /* KPI */
    const count = orders.length
    const totalRev = orders.reduce((s, o) => s + Number(o.total_amount), 0)
    setTotalOrders(count)
    setRevenue(totalRev)
    setAvgOrder(count > 0 ? totalRev / count : 0)

    /* Daily */
    const dailyMap: any = {}
    orders.forEach(o => {
      const day = new Date(o.created_at).toISOString().split("T")[0]
      dailyMap[day] = (dailyMap[day] || 0) + Number(o.total_amount)
    })
    setDailyData(
      Object.keys(dailyMap)
        .sort()
        .map(day => ({
          day: day.slice(5),   // "MM-DD"
          revenue: dailyMap[day],
        }))
    )

    /* Monthly */
    const monthMap: any = {}
    orders.forEach(o => {
      const d = new Date(o.created_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      monthMap[key] = (monthMap[key] || 0) + Number(o.total_amount)
    })
    setMonthlyData(
      Object.keys(monthMap).sort().map(m => ({ month: m, revenue: monthMap[m] }))
    )

    /* Hourly */
    const hourMap: any = {}
    orders.forEach(o => {
      const h = new Date(o.created_at).getHours()
      hourMap[h] = (hourMap[h] || 0) + 1
    })
    setHourlyData(
      Object.keys(hourMap)
        .sort((a, b) => Number(a) - Number(b))
        .map(h => ({ hour: `${h}:00`, orders: hourMap[h] }))
    )

    /* Order Type */
    const typeMap: any = { dine_in: 0, takeaway: 0 }
    orders.forEach(o => { if (o.order_type) typeMap[o.order_type]++ })
    setOrderTypeData([
      { name: "Dine-in", value: typeMap.dine_in },
      { name: "Takeaway", value: typeMap.takeaway },
    ])

    /* Top Items */
    const orderIds = orders.map(o => o.id)
    if (orderIds.length > 0) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name,quantity,order_id")

      const filtered = items?.filter(i => orderIds.includes(i.order_id)) || []
      const itemMap: any = {}
      filtered.forEach(i => {
        itemMap[i.product_name] = (itemMap[i.product_name] || 0) + i.quantity
      })
      setTopItems(
        Object.keys(itemMap)
          .map(name => ({ name, quantity: itemMap[name] }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
      )
    }

    setLoading(false)
  }

  const resetAnalytics = async () => {
    if (!confirm("Reset analytics? This cannot be undone.")) return
    await supabase.from("analytics_reset").insert({})
    alert("Analytics reset successfully.")
    loadStats()
  }

  useEffect(() => { loadStats() }, [dateFilter])

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f2] p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
          </div>
          <div className="h-56 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-52 bg-gray-200 rounded-2xl" />
            <div className="h-52 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const maxItemQty = topItems[0]?.quantity || 1
  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "All time" },
    { key: "today", label: "Today" },
    { key: "7d", label: "Last 7 Days" },
    { key: "30d", label: "Last 30 Days" },
  ]

  return (
    <div className="min-h-screen bg-[#f4f4f2] p-6 md:p-8 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={resetAnalytics}
          className="text-[13px] font-medium text-[#E8304A] bg-[#fff0f2] border border-[#fccad0] rounded-xl px-4 py-2 hover:bg-[#ffe0e5] transition-colors"
        >
          Reset Analytics
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setDateFilter(f.key)}
            className={`text-[13px] font-medium rounded-full px-4 py-1.5 border transition-all duration-200 ${
              dateFilter === f.key
                ? "bg-[#E8304A] border-[#E8304A] text-white shadow-sm shadow-red-200"
                : "bg-white border-gray-200 text-gray-500 hover:border-[#E8304A] hover:text-[#E8304A]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          label="Total Orders"
          value={totalOrders.toString()}
          badge="↑ 100% completed"
          icon={<IconOrders />}
          delay={0}
        />
        <KpiCard
          label="Total Revenue"
          value={`₹${revenue.toLocaleString("en-IN")}`}
          badge="All completed orders"
          icon={<IconRevenue />}
          delay={70}
        />
        <KpiCard
          label="Avg Order Value"
          value={`₹${avgOrder.toFixed(0)}`}
          badge="Per completed order"
          icon={<IconAvg />}
          delay={140}
        />
      </div>

      {/* ── Daily Revenue (full width) ── */}
      <ChartCard title="Daily Revenue" tag="By day" delay={200}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData} barCategoryGap="35%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: "#f9f0f1" }} />
            <Bar
              dataKey="revenue"
              radius={[6, 6, 0, 0]}
              fill="#f5b8c0"
            >
              {dailyData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === dailyData.length - 1 ? "#E8304A" : "#f5b8c0"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Peak Hours + Order Type ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Peak Hours" tag="Orders by hour" delay={260}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8304A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E8304A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "#aaa", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#aaa", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E8304A", strokeWidth: 1, strokeDasharray: "4 2" }} />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#E8304A"
                strokeWidth={2}
                fill="url(#hourGrad)"
                dot={{ r: 3, fill: "#E8304A", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#E8304A", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order Type" tag="Split" delay={320}>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={orderTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  <Cell fill="#E8304A" />
                  <Cell fill="#f5b8c0" />
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <div className="bg-[#1a1a1a] text-white text-xs rounded-xl px-3 py-2">
                        <p className="text-[#aaa]">{payload[0].name}</p>
                        <p className="font-semibold">{payload[0].value} orders</p>
                      </div>
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 mt-1">
            {orderTypeData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[12px] text-gray-500">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: i === 0 ? "#E8304A" : "#f5b8c0" }}
                />
                {d.name}
                <span className="font-semibold text-gray-700">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Monthly Revenue + Top Items ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Monthly Revenue" tag="Trend" delay={380}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barCategoryGap="40%">
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `₹${v}`}
              />
              <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ fill: "#f9f0f1" }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {monthlyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === monthlyData.length - 1 ? "#E8304A" : "#f5b8c0"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Items" tag="By quantity" delay={440}>
          {topItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-0">
              {topItems.map((item, i) => (
                <TopItemRow
                  key={i}
                  rank={i + 1}
                  name={item.name}
                  qty={item.quantity}
                  maxQty={maxItemQty}
                />
              ))}
            </div>
          )}
        </ChartCard>
      </div>

    </div>
  )
}