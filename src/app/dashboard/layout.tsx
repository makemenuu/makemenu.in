"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
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


  const [showLogout, setShowLogout] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)

useEffect(() => {
  let isMounted = true

  const checkAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace("/login")
      return
    }

    const { data: dbUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!dbUser) {
      router.replace("/login")
      return
    }

    // 🔒 FROZEN USER
if (dbUser?.is_frozen) {
  setChecking(false)
  router.replace("/frozen")
  return
}

    const now = new Date()

    // 🔥 PAID USER
    if (dbUser.is_paid) {
      if (!dbUser.subscription_end) {
        router.replace("/upgrade")
        return
      }

      const subEnd = new Date(dbUser.subscription_end)

      if (subEnd < now) {
        router.replace("/upgrade")
        return
      }

      if (isMounted) setAllowed(true)
      return
    }

    // 🔥 TRIAL USER
    if (dbUser.trial_end) {
      const trialEnd = new Date(dbUser.trial_end)

      if (trialEnd < now) {
        router.replace("/upgrade")
        return
      }
    }

    // 🔥 SETUP CHECK
    const { data: setup } = await supabase
      .from("restaurant_settings")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!setup) {
      router.replace("/setup")
      return
    }

    if (isMounted) setAllowed(true)
  }

  checkAccess()

  return () => {
    isMounted = false
  }
}, [])

if (!allowed) return null
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