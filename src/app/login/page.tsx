"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "../../lib/supabase"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    setError("")
    setLoading(true)

    // 🔐 LOGIN
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    if (!user) {
      setError("Login failed")
      setLoading(false)
      return
    }

    // ✅ FINAL NAME LOGIC (🔥 IMPORTANT)
    const finalName =
      user.user_metadata?.name ||        // new users
      user.email?.split("@")[0] ||       // old users fallback
      "User"

    // ✅ ALWAYS SYNC PROFILE (FIXED)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name: finalName,
        },
        {
          onConflict: "id",
        }
      )

    if (profileError) {
      console.error("Profile sync error:", profileError)
    }

    // 🔥 REFRESH TOPBAR
    window.dispatchEvent(new Event("profileUpdated"))

    // ✅ CHECK SETUP
    const { data: settings } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    // 🚀 REDIRECT
    if (!settings) {
      router.push("/setup")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#e5e5e5]">
      <div className="absolute top-0 left-0 w-full h-[42%] bg-[#e05861]" />

      <div className="relative z-10 w-full max-w-md mx-6 bg-white rounded-2xl shadow-md px-6 py-8">

        {/* LOGO */}
        <div className="flex justify-center mb-3">
          <Image src="/logo.png" alt="logo" width={140} height={40} />
        </div>

        <h1 className="text-center text-[22px] font-semibold text-black mb-1">
          Welcome to MakeMenu
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          QR Ordering System for Food outlets
        </p>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-[14px] font-semibold text-black mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#f2f2f2]"
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-2">
          <label className="block text-[14px] font-semibold text-black mb-2">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#f2f2f2] pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-right mb-6">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-500 hover:text-[#e05861]"
          >
            Forgot password?
          </Link>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-medium ${
            loading
              ? "bg-gray-400"
              : "bg-[#f45b69] hover:bg-[#e14c58]"
          }`}
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-center text-red-500 mt-4">
            {error}
          </p>
        )}

        {/* SIGNUP */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-black font-medium">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}