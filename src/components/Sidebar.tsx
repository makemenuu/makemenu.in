"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

import {
  LayoutDashboard,
  Plus,
  BarChart3,
  CreditCard,
  QrCode,
  CheckCircle,
  Settings,
  LogOut
} from "lucide-react"

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
      pathname === path
        ? "bg-gray-200 text-black font-semibold"
        : "text-gray-600 hover:bg-gray-100"
    }`

  return (
    <div className="w-64 bg-white border-r flex flex-col justify-between min-h-full px-6 py-6">
      
      {/* TOP */}
      <div>
        
        {/* LOGO */}
        <div className="mb-10 flex justify-center">
          <Link href="/dashboard">
            <Image
              src="/logo.png"
              alt="MakeMenu Logo"
              width={150}
              height={40}
              className="object-contain cursor-pointer"
              priority
            />
          </Link>
        </div>

        {/* NAV */}
        <nav className="space-y-2 text-[15px]">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>

          <Link href="/dashboard/products" className={linkClass("/dashboard/products")}>
            <Plus size={18} /> Add items
          </Link>

          <Link href="/dashboard/stats" className={linkClass("/dashboard/stats")}>
            <BarChart3 size={18} /> Analytics
          </Link>

          <Link href="/dashboard/subscription" className={linkClass("/dashboard/subscription")}>
            <CreditCard size={18} /> Payment
          </Link>

          <Link href="/dashboard/qr" className={linkClass("/dashboard/qr")}>
            <QrCode size={18} /> Add QR
          </Link>

          <Link href="/dashboard/completed" className={linkClass("/dashboard/completed")}>
            <CheckCircle size={18} /> Completed
          </Link>
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="space-y-2 text-[15px]">
        <Link href="/dashboard/settings" className={linkClass("/dashboard/settings")}>
          <Settings size={18} /> Settings
        </Link>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-100 w-full"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

    </div>
  )
}