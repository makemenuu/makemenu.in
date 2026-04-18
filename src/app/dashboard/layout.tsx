"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Sidebar from "@/components/Sidebar"
import { ThemeProvider } from "@/context/ThemeContext"
import LogoutModal from "@/components/LogoutModal"
import Topbar from "@/components/Topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [showLogout, setShowLogout] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // ❌ NOT LOGGED IN
      if (!user) {
        router.push("/login")
        return
      }

      // 🔍 CHECK IF SETUP DONE
      const { data } = await supabase
        .from("restaurant_settings")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

      // ❌ NOT SETUP → REDIRECT
      if (!data) {
        router.push("/setup")
        return
      }

      // ✅ ALLOWED
      setLoading(false)
    }

    checkAccess()
  }, [router])

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-[#f5f5f5] text-black">
        {/* SIDEBAR */}
        <>
          {/* DESKTOP SIDEBAR */}
          <div className="hidden md:block">
  <Sidebar onLogout={() => setShowLogout(true)} />
</div>

          {/* MOBILE SIDEBAR */}
          {showSidebar && (
            <div className="fixed inset-0 z-50 flex">
              {/* OVERLAY */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setShowSidebar(false)}
              />

              {/* SIDEBAR PANEL */}
              <div className="relative w-64 bg-white h-full shadow-lg animate-slide-in">
                <Sidebar onLogout={() => setShowLogout(true)} />
              </div>
            </div>
          )}
        </>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col w-full">
          {/* MOBILE HEADER */}
          <div className="md:hidden p-4 bg-white shadow-sm flex items-center justify-between">
            {/* HAMBURGER */}
            <button
              onClick={() => setShowSidebar(true)}
              className="text-xl"
            >
              ☰
            </button>

            <span className="font-semibold">Dashboard</span>

            <div />
          </div>

          {/* ✅ GLOBAL TOPBAR */}


          {/* LOGOUT MODAL */}
          <LogoutModal
            open={showLogout}
            onClose={() => setShowLogout(false)}
          />

          {/* PAGE CONTENT */}
          <main className="flex-1 overflow-auto pt-4 sm:pt-6 px-3 sm:px-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}