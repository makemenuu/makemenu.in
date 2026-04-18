"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Password reset link sent to your email.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="w-96 border p-6 rounded">

        <h1 className="text-xl font-bold mb-4">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          className="border w-full p-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="bg-orange-400 w-full p-2 rounded"
        >
          Send Reset Link
        </button>

        {message && <p className="mt-3">{message}</p>}

      </div>

    </div>
  )
}