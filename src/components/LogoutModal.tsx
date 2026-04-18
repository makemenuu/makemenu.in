"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

type Props = {
  open: boolean
  onClose: () => void
}

export default function LogoutModal({ open, onClose }: Props) {
  if (!open) return null

  const [visible, setVisible] = useState(false)

useEffect(() => {
  if (open) {
    setTimeout(() => setVisible(true), 10)
  } else {
    setVisible(false)
  }
}, [open])
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
  className={`bg-white rounded-2xl p-8 w-[90%] max-w-md text-center shadow-lg transition-all duration-200 ${
    visible ? "scale-100 opacity-100" : "scale-90 opacity-0"
  }`}
>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
            <span className="text-red-600 text-3xl font-bold">i</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-2">
          See you soon!
        </h2>

        <p className="text-gray-600 text-sm mb-6">
          You’re about to log out.<br />
          Your menus will be safe when you come back.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-200 text-gray-800 font-medium"
          >
            Stay Logged In
          </button>

          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-full bg-red-600 text-white font-medium"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  )
}