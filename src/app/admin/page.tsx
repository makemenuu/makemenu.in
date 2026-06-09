"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import AdminPayments from "@/components/AdminPayments"

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const checkAdmin = async () => {
    console.log("CHECK ADMIN START")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("USER:", user)

    if (!user) {
      console.log("NO USER → redirect")
      router.push("/login")
      return
    }

    const { data: dbUser } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    console.log("DB USER:", dbUser)

    if (!dbUser?.is_admin) {
      console.log("NOT ADMIN → redirect")
      router.push("/")
      return
    }

    console.log("ADMIN VERIFIED")
    setLoading(false)
  }

  checkAdmin()
}, [router])
  return <AdminPayments />
}