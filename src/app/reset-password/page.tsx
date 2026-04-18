"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

export default function ResetPassword() {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setMessage("")
    setLoading(true)

    if (password !== confirm) {
      setMessage("Passwords do not match")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage("Password updated successfully")

    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded flex flex-col gap-4">

      <h1 className="text-2xl font-bold text-center">
        Reset Password
      </h1>

      <input
        className="border p-2 rounded"
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`p-2 rounded text-white ${
          loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
        }`}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message && (
        <p className="text-sm text-center text-green-600">
          {message}
        </p>
      )}

    </div>
  )
}