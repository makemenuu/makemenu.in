"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Order = {
  id: string
  customer_name: string
  order_type: string
  total_amount: number
  created_at: string
  qr_codes: {
    name: string
  }
}

type OrderItem = {
  id: string
  order_id: string
  product_name: string
  quantity: number
  price: number
}

function formatOrderDateTime(timestamp: string) {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}

export default function CompletedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // ✅ NEW STATE
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const fetchCompletedOrders = async () => {
  if (!userId) return

  const { data: orderData } = await supabase
    .from("orders")
    .select(`
      *,
      qr_codes ( name )
    `)
    .eq("user_id", userId) // ✅ THIS FIX
    .eq("status", "completed")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })

  const { data: itemData } = await supabase
    .from("order_items")
    .select("*")

  setOrders(orderData || [])
  setItems(itemData || [])
  setLoading(false)
}

  // ✅ SELECT LOGIC
  const toggleSelect = (id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(o => o.id))
    }
  }

  // ✅ DELETE SINGLE
  const deleteOrder = async (id: string) => {
    const confirmDelete = confirm("Delete this completed order?")
    if (!confirmDelete) return

    await supabase
      .from("orders")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id)

    fetchCompletedOrders()
  }

  // ✅ DELETE MULTIPLE
  const deleteSelected = async () => {
    if (selectedOrders.length === 0) {
      alert("No orders selected")
      return
    }

    const confirmDelete = confirm("Delete selected orders?")
    if (!confirmDelete) return

    await supabase
      .from("orders")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .in("id", selectedOrders)

    setSelectedOrders([])
    fetchCompletedOrders()
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

  fetchCompletedOrders()

  const channel = supabase
    .channel("completed-orders")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `user_id=eq.${userId}`, // ✅ FIX
      },
      () => {
        fetchCompletedOrders()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [userId])

  if (loading)
    return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen p-6 bg-gray-100 space-y-6">

      <h1 className="text-2xl font-bold">
        Completed Orders
      </h1>

      {/* ✅ TOP CONTROLS */}
      {orders.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded shadow">

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedOrders.length === orders.length}
              onChange={selectAll}
            />
            <span className="text-sm">
              Select All ({selectedOrders.length})
            </span>
          </div>

          <button
            onClick={deleteSelected}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete Selected
          </button>

        </div>
      )}

      {orders.length === 0 && (
        <p className="text-gray-500">
          No completed orders yet.
        </p>
      )}

      {orders.map((order) => {
        const orderItems = items.filter(
          (i) => i.order_id === order.id
        )

        return (
          <div
            key={order.id}
            className="bg-white p-4 rounded shadow space-y-3 flex gap-3"
          >

            {/* ✅ CHECKBOX */}
            <input
              type="checkbox"
              checked={selectedOrders.includes(order.id)}
              onChange={() => toggleSelect(order.id)}
            />

            <div className="flex-1">

              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {order.qr_codes?.name}
                  </p>

                  <p>
                    {order.customer_name} •{" "}
                    {order.order_type === "dine_in"
                      ? "Dine-in"
                      : "Takeaway"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    ₹{order.total_amount}
                  </p>

                  <p className="text-sm text-gray-500">
                    {formatOrderDateTime(order.created_at)}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between"
                  >
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>

                    <span>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* SINGLE DELETE */}
              <div className="flex justify-end">
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )
}