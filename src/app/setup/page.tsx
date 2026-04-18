"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Image from "next/image" // ✅ ADDED

export default function SetupPage() {
  const router = useRouter()

  const [shopName, setShopName] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [openTime, setOpenTime] = useState("")
  const [closeTime, setCloseTime] = useState("")
  const [loading, setLoading] = useState(false)

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data } = await supabase
        .from("restaurant_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (data) {
        router.push("/dashboard")
        return
      }

      setChecking(false)
    }

    checkUser()
  }, [])

  const handleSubmit = async () => {
    if (!shopName || !latitude || !longitude || !openTime || !closeTime) {
      alert("Please fill all fields")
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Session expired. Please login again.")
      router.push("/login")
      return
    }

    const { error } = await supabase
      .from("restaurant_settings")
      .upsert({
        user_id: user.id,
        shop_name: shopName,
        latitude,
        longitude,
        open_time: openTime,
        close_time: closeTime,
      }, {
        onConflict: "user_id"
      })

    if (error) {
      alert("Failed to save settings")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white w-[900px] p-10 rounded-xl shadow space-y-6">

        {/* ✅ UPDATED HEADER */}
        <div className="text-center space-y-3">

          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="MakeMenu Logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-3xl font-semibold">
            Set Up Your Shop
          </h2>

          <p className="text-gray-500">
            Let’s get your shop ready in seconds
          </p>

        </div>

        <div className="grid grid-cols-2 gap-10 mt-6">

          {/* LEFT */}
          <div className="space-y-6">

            <div>
              <p className="font-semibold mb-2">Shop Name</p>
              <input
                placeholder="Enter your shop name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-gray-100"
              />
            </div>

            <div>
              <p className="font-semibold mb-2">Shop Location</p>

              <input
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-gray-100 mb-3"
              />

              <input
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-4 py-3 rounded-full bg-gray-100"
              />
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-6 border-l pl-10">

            <div>
              <p className="font-semibold mb-2">Shop Timing</p>

              <div className="flex gap-4">

                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="px-4 py-3 rounded-full bg-gray-100 w-full"
                />

                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="px-4 py-3 rounded-full bg-gray-100 w-full"
                />

              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-500 text-white py-3 rounded-full mt-10 hover:bg-red-600"
            >
              {loading ? "Saving..." : "Finish Setup"}
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}