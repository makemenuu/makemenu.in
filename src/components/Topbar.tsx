import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Topbar() {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")
  const [name, setName] = useState("User")
  const [avatar, setAvatar] = useState("")

  // ⏱ TIME + DATE
  useEffect(() => {
    const update = () => {
      const now = new Date()

      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      )

      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ]

      setDate(
        `${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`
      )
    }

    update()
    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [])

  // 👤 FETCH USER
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const user = session.user

      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

      const finalName =
        data?.name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "User"

      setName(finalName)
      // Strip any old cache-buster from DB and apply a fresh one for display
      const rawAvatar = data?.avatar_url?.split("?")[0] || ""
      setAvatar(rawAvatar ? rawAvatar + "?t=" + Date.now() : "")
    }

    fetchUser()

    const handler = () => {
      fetchUser()
    }

    window.addEventListener("profileUpdated", handler)

    return () => {
      window.removeEventListener("profileUpdated", handler)
    }
  }, [])

  return (
    <div className="bg-[#f5f5f5] px-4 sm:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black flex items-center justify-center text-white text-base sm:text-xl">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}

          {/* TEXT */}
          <h2 className="text-lg sm:text-3xl font-semibold leading-tight">
            Welcome{" "}
            <span className="block sm:inline">{name}</span>
          </h2>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* DATE */}
          <div className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs sm:text-base font-medium">
            {date}
          </div>

          {/* TIME */}
          <div className="text-sm sm:text-xl font-medium text-black">
            {time}
          </div>
        </div>

      </div>
    </div>
  )
}