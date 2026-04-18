"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

type Order = {
  id: string
  customer_name: string
  total_amount: number
  created_at: string
  user_id: string
}

type OrderItem = {
  id: string
  product_name: string
  quantity: number
  price: number
}

type ReceiptSettings = {
  restaurant_name: string
  header_text: string
  footer_text: string
  show_date: boolean
  show_order_number: boolean
  paper_size: string
}

export default function ReceiptPage() {

  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [settings, setSettings] = useState<ReceiptSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // ================= LOAD DATA =================
  useEffect(() => {

    const loadReceipt = async () => {

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (!orderData) return

      setOrder(orderData)

      const { data: itemData } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)

      setItems(itemData || [])

      const { data: settingsData } = await supabase
        .from("receipt_settings")
        .select("*")
        .eq("user_id", orderData.user_id)
        .maybeSingle()

      setSettings(settingsData)

      setLoading(false)
    }

    if (orderId) loadReceipt()

  }, [orderId])

  // ================= SAFE PRINT =================
  useEffect(() => {
    if (!loading && order && settings) {
      const timer = setTimeout(() => {
        window.print()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [loading, order, settings])

  // ================= AUTO CLOSE =================
  useEffect(() => {
    const handleAfterPrint = () => {
      window.close()
    }

    window.addEventListener("afterprint", handleAfterPrint)

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint)
    }
  }, [])

  if (loading || !order) {
    return <div className="p-6">Preparing receipt...</div>
  }

  const width = settings?.paper_size === "80mm" ? "300px" : "220px"

  const formatCurrency = (amount: number) =>
    `₹${amount.toFixed(2)}`

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: monospace;
        }

        .receipt {
          width: ${width};
          margin: auto;
          padding: 8px;
          font-size: 12px;
        }

        .center {
          text-align: center;
        }

        hr {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }

        .row {
          display: flex;
          justify-content: space-between;
        }

        .item-name {
          max-width: 70%;
          word-break: break-word;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .receipt, .receipt * {
            visibility: visible;
          }

          .receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: ${settings?.paper_size === "80mm" ? "80mm" : "58mm"};
          }
        }
      `}</style>

      <div className="receipt">

        {/* HEADER */}
        <div className="center" style={{ fontWeight: "bold" }}>
          {settings?.restaurant_name || "Restaurant"}
        </div>

        {settings?.header_text && (
          <div className="center">
            {settings.header_text}
          </div>
        )}

        <hr />

        {/* ORDER NUMBER */}
        {settings?.show_order_number !== false && (
          <div className="center">
            Order #{order.id.slice(0,6)}
          </div>
        )}

        {/* DATE BELOW ORDER */}
        {settings?.show_date !== false && (
          <div className="center" style={{ fontSize: "10px" }}>
            {formatDate(order.created_at)}
          </div>
        )}

        {/* CUSTOMER NAME INLINE */}
        <div>
          <strong>Name:</strong> {order.customer_name}
        </div>

        <hr />

        {/* ITEMS */}
        {items.map(item => (
          <div key={item.id} className="row">
            <span className="item-name">
              {item.product_name} x {item.quantity}
            </span>
            <span>
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}

        <hr />

        {/* TOTAL */}
        <div className="row" style={{ fontWeight: "bold" }}>
          <span>Total</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>

        <hr />

        {/* FOOTER */}
        <div className="center" style={{ marginTop: "6px" }}>
          {settings?.footer_text || "Thank you!"}
        </div>

      </div>
    </>
  )
}