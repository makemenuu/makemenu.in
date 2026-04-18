"use client"

import { supabase } from "@/lib/supabase"
import Topbar from "@/components/Topbar"
import { useEffect, useState, useRef, useMemo } from "react"

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "Today" | "Yesterday" | "7d">("all")
  const [orderType, setOrderType] = useState<"all" | "dine_in" | "takeaway">("all")
  const [userId, setUserId] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<any | null>(null)
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ================= FETCH =================
  const fetchData = async () => {
    setLoading(true)

    const { data: orderData } = await supabase
      .from("orders")
.select(`
  *,
  qr_codes ( name )
`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    const orderIds = orderData?.map(o => o.id) || []

    const { data: itemData } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds)

    setOrders(orderData || [])
    setItems(itemData || [])
    setLoading(false)
  }

  useEffect(() => {
  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUserId(data.user?.id || null)
  }

  getUser()
}, [])

  useEffect(() => {
  if (!userId) return

  fetchData()

  audioRef.current = new Audio("/sounds/order.mp3")

  const channel = supabase
    .channel("orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${userId}`, // ✅ ONLY THIS CHANGE
      },
      async (payload) => {
        const newOrder = payload.new

        audioRef.current?.play().catch(() => {})
        setOrders(prev => [newOrder, ...prev])

        const { data } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", newOrder.id)

        if (data) setItems(prev => [...prev, ...data])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId])

  // ================= ACTIONS =================
  const updateStatus = async (id: string, status: string) => {
  await supabase.from("orders").update({ status }).eq("id", id)

  setOrders(prev =>
    prev.map(o => (o.id === id ? { ...o, status } : o))
  )
}

  const printBill = (id: string) => {
    window.open(`/receipt/${id}`, "_blank")
  }

  const deleteOrder = (id: string) => {
  setDeleteOrderId(id)
}

  const confirmDeleteOrder = async () => {
  if (!deleteOrderId) return

  await supabase
    .from("orders")
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq("id", deleteOrderId)

  setOrders(prev =>
    prev.map(o =>
      o.id === deleteOrderId
        ? { ...o, is_deleted: true }
        : o
    )
  )



  setDeleteOrderId(null)
}

  const startEdit = (order: any) => {
    setEditingOrder({
      ...order,
      editedItems: items
        .filter(i => i.order_id === order.id)
        .map(i => ({ ...i })),
    })
  }

  const saveEdit = async () => {
    if (!editingOrder) return

    const originalItems = items.filter(i => i.order_id === editingOrder.id)
    const editedIds = editingOrder.editedItems.map((i: any) => i.id)

    // Find deleted items (in original but not in editedItems)
    const deletedItems = originalItems.filter(i => !editedIds.includes(i.id))

    // Delete removed items from Supabase
    await Promise.all(
      deletedItems.map((item: any) =>
        supabase.from("order_items").delete().eq("id", item.id)
      )
    )

    // Update remaining items
    await Promise.all(
      editingOrder.editedItems.map((item: any) =>
        supabase
          .from("order_items")
          .update({
            product_name: item.product_name,
            quantity: item.quantity,
          })
          .eq("id", item.id)
      )
    )

    const newTotal = editingOrder.editedItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    )

    await supabase
      .from("orders")
      .update({ total_amount: newTotal })
      .eq("id", editingOrder.id)

    // Remove deleted items and update changed items in local state
    setItems(prev => {
      const withoutDeleted = prev.filter(
        i => !deletedItems.find((d: any) => d.id === i.id)
      )
      return withoutDeleted.map(item => {
        const edited = editingOrder.editedItems.find((e: any) => e.id === item.id)
        return edited
          ? { ...item, quantity: edited.quantity, product_name: edited.product_name }
          : item
      })
    })

    setOrders(prev =>
      prev.map(o =>
        o.id === editingOrder.id ? { ...o, total_amount: newTotal } : o
      )
    )

    setEditingOrder(null)
  }

  // ================= FILTER =================
  const validOrders = orders.filter(o => !o.is_deleted && o.status !== "cancelled")

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfToday.getDate() - 1)

  const startOf7Days = new Date()
  startOf7Days.setDate(now.getDate() - 7)

  const filteredOrders = useMemo(() => {
  return validOrders
    .filter(o => {
      const d = new Date(o.created_at)
      if (filter === "Today") return d >= startOfToday
      if (filter === "Yesterday") return d >= startOfYesterday && d < startOfToday
      if (filter === "7d") return d >= startOf7Days
      return true
    })
    .filter(o => orderType === "all" || o.order_type === orderType)
    .filter(o => o.status !== "completed")
    .filter(o =>
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    )
}, [validOrders, filter, orderType, search])

  const revenue = validOrders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => sum + o.total_amount, 0)

  if (loading) {
    return (
      <div className="p-6 text-center">
  <div className="animate-pulse text-gray-400">Loading dashboard...</div>
</div>
    )
  }

  return (
    <div className="flex flex-col h-full pt-3 sm:pt-4">

  {/* ✅ ADD THIS LINE */}
  <Topbar />

  <div className="px-3 sm:px-6 pb-6 space-y-4">

        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
  Orders
</h1>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat title="Revenue" value={`₹${revenue}`} />
          <Stat title="Orders" value={validOrders.length} />
          <Stat title="Completed" value={validOrders.filter(o => o.status === "completed").length} />
        </div>

        {/* FILTERS */}
        <div className="space-y-2">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-full border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="px-4 py-2 rounded-full border bg-white text-sm"
            >
              <option value="all">All</option>
              <option value="dine_in">Dine-in</option>
              <option value="takeaway">Takeaway</option>
            </select>

            {["Today", "Yesterday", "7d"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                  filter === f ? "bg-red-500 text-white" : "bg-white border"
                }`}
              >
                {f}
              </button>
            ))}

            <button
              onClick={() => {
                setSearch("")
                setFilter("all")
                setOrderType("all")
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-full whitespace-nowrap text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        {/* EDIT MODAL */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl">

              <p className="text-gray-800 font-semibold text-base">Edit Order</p>

              <div className="space-y-3 max-h-72 overflow-y-auto">
                {editingOrder.editedItems.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center gap-2">

                    <input
                      value={item.product_name}
                      onChange={(e) => {
                        const updated = [...editingOrder.editedItems]
                        updated[index].product_name = e.target.value
                        setEditingOrder({ ...editingOrder, editedItems: updated })
                      }}
                      className="flex-1 px-3 py-1.5 rounded-full text-sm border border-gray-200 outline-none focus:border-red-400"
                      placeholder="Item name"
                    />

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const updated = [...editingOrder.editedItems]
                          if (updated[index].quantity > 1) {
                            updated[index].quantity -= 1
                            setEditingOrder({ ...editingOrder, editedItems: updated })
                          }
                        }}
                        className="w-7 h-7 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center hover:bg-red-600"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          const updated = [...editingOrder.editedItems]
                          updated[index].quantity += 1
                          setEditingOrder({ ...editingOrder, editedItems: updated })
                        }}
                        className="w-7 h-7 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center hover:bg-red-600"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const updated = editingOrder.editedItems.filter(
                          (_: any, i: number) => i !== index
                        )
                        setEditingOrder({ ...editingOrder, editedItems: updated })
                      }}
                      className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 text-sm flex items-center justify-center hover:bg-red-100 hover:text-red-500"
                    >
                      ✕
                    </button>

                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-semibold text-gray-700 border-t pt-2">
                <span>Total</span>
                <span>
                  ₹{editingOrder.editedItems.reduce(
                    (sum: number, i: any) => sum + i.price * i.quantity, 0
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="border border-red-500 text-red-500 px-4 py-1.5 rounded-full text-xs sm:text-base font-medium hover:bg-red-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-base font-medium hover:bg-red-600 transition-all"
                >
                  Save
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ORDERS */}
        <div className="space-y-3">
          {filteredOrders.length === 0 && (
            <p className="text-gray-500 text-center text-sm">No active orders 🚀</p>
          )}

          {filteredOrders.map(order => {
            const orderItems = items.filter(i => i.order_id === order.id)

            return (
              <div key={order.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">

                {/* Card Header */}
                <div className="flex justify-between items-start px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-gray-400 text-xs font-medium tracking-widest uppercase">
                      #{order.id.slice(0, 6)}
                    </p>
                   <div>
  <p className="text-gray-800 text-base font-semibold">
    {order.customer_name}
  </p>

  <p className="text-xs text-gray-500">
    {order.order_type === "dine_in" ? "Dine-in" : "Takeaway"}
     {order.qr_codes?.name && ` - (${order.qr_codes.name})`}
  </p>

<p className="text-xs text-gray-400">
  {new Date(order.created_at).toLocaleString()}
</p>

  {/* ✅ QR NAME */}
  {order.qr_codes?.name && (
    <p className="text-xs text-gray-400">
    </p>
  )}
</div>
                  </div>
                  <p className="text-gray-800 text-base font-semibold">₹{order.total_amount}</p>
                </div>

                {/* Line Items */}
                <div className="px-5 py-3 border-b border-gray-100 space-y-1">
                  {orderItems.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-gray-600 text-sm font-medium">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="text-gray-600 text-sm font-medium">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-4">
                  <button
                    onClick={() => printBill(order.id)}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-base font-medium hover:bg-red-600 transition-all"
                  >
                    Print
                  </button>
                  <button
                    onClick={() => startEdit(order)}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-base font-medium hover:bg-red-600 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, "completed")}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-base font-medium hover:bg-red-600 transition-all"
                  >
                    Complete
                  </button>
<button
  onClick={() => deleteOrder(order.id)}
  className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-base font-medium hover:bg-red-600 transition-all"
>
  Delete
</button>
                </div>

              </div>
            )
          })}
        </div>

      </div>
     {deleteOrderId && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-white rounded-[30px] p-10 w-[90%] max-w-md text-center space-y-8 transition-all duration-200 scale-100">

      {/* TEXT */}
      <h2 className="text-lg sm:text-xl font-medium leading-relaxed">
        “Are you sure you want to delete this order?”
      </h2>

      {/* BUTTONS */}
      <div className="flex justify-center gap-4">

        <button
          onClick={() => setDeleteOrderId(null)}
          className="px-6 py-2 rounded-full bg-gray-200 text-gray-800 font-medium"
        >
          Cancel
        </button>

        <button
          onClick={confirmDeleteOrder}
          className="px-6 py-2 rounded-full bg-red-600 text-white font-medium"
        >
          Delete
        </button>

      </div>

    </div>
  </div>
)}
    </div>
  )
}

function Stat({ title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
    </div>
  )
}