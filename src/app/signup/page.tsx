"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "../../lib/supabase"
import { Eye, EyeOff } from "lucide-react"

const districts = [
  "Chennai","Coimbatore","Madurai","Salem","Tiruchirappalli","Tirunelveli",
  "Erode","Vellore","Thoothukudi","Dindigul","Thanjavur","Ranipet",
  "Sivagangai","Virudhunagar","Karur","Namakkal","Nagapattinam",
  "Krishnagiri","Dharmapuri","Cuddalore","Kanchipuram","Tiruvallur",
  "Tiruppur","Kanyakumari","Nilgiris","Perambalur","Ariyalur",
  "Ramanathapuram","Tenkasi","Mayiladuthurai","Chengalpattu",
  "Kallakurichi","Others"
]

export default function Signup() {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [customLocation, setCustomLocation] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const finalLocation = location === "Others" ? customLocation : location

  // ✅ VALIDATIONS
  const isValidName = /^[A-Za-z\s]+$/.test(name.trim()) && name.trim().length >= 2

  const isValidLocation =
    location !== "" &&
    (location !== "Others" || customLocation.trim().length > 0)

  const isValidPhone = /^[0-9]{10}$/.test(phone)
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isValidPassword = password.length >= 6
  const passwordsMatch = password === confirmPassword

  const isFormValid =
    isValidName &&
    isValidLocation &&
    isValidPhone &&
    isValidEmail &&
    isValidPassword &&
    passwordsMatch

  const handleSignup = async () => {
    setError("")

    if (!isFormValid) {
      setError("Please fix the errors above")
      return
    }

    setLoading(true)

    // ✅ CHECK PHONE UNIQUE
    const { data: phoneExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", phone)
      .maybeSingle()

    if (phoneExists) {
      setError("Phone number already exists")
      setLoading(false)
      return
    }

    // ✅ SIGNUP WITH METADATA (🔥 MAIN FIX)
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/login",
        data: {
          name: name.trim(),
          phone: phone,
          location: finalLocation,
        },
      },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user && data.user.identities?.length === 0) {
      setError("User already exists. Please sign in.")
      setLoading(false)
      return
    }

    alert("Signup successful! Please check your email and login.")

    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#e5e5e5]">

      <div className="absolute top-0 left-0 w-full h-[42%] bg-[#e05861]" />

      <div className="relative z-10 w-full max-w-md mx-6 bg-white rounded-2xl shadow-md px-6 py-8">

        <div className="flex justify-center mb-3">
          <Image src="/logo.png" alt="logo" width={140} height={40} />
        </div>

        <h1 className="text-center text-[22px] font-semibold text-black mb-1">
          Welcome to MakeMenu
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
          QR Ordering System for Food outlets
        </p>

        <Input label="Name" value={name} setValue={setName} valid={isValidName} />

        {/* LOCATION */}
        <div className="mb-4">
          <label className="block text-[14px] font-semibold text-black mb-2">
            Location
          </label>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#f2f2f2]"
          >
            <option value="">Select your district</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {location === "Others" && (
            <input
              type="text"
              placeholder="Enter your location"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="mt-3 w-full px-4 py-3 rounded-xl bg-[#f2f2f2]"
            />
          )}
        </div>

        <Input label="Phone No" value={phone} setValue={setPhone} valid={isValidPhone} />
        <Input label="Email" value={email} setValue={setEmail} valid={isValidEmail} />

        <PasswordInput
          label="Create Password"
          value={password}
          setValue={setPassword}
          show={showPassword}
          setShow={setShowPassword}
          valid={isValidPassword}
        />

        <PasswordInput
          label="Confirm Password"
          value={confirmPassword}
          setValue={setConfirmPassword}
          show={showConfirm}
          setShow={setShowConfirm}
          valid={passwordsMatch}
        />

        <button
          onClick={handleSignup}
          disabled={!isFormValid || loading}
          className={`w-full py-3 rounded-xl text-white font-medium ${
            !isFormValid || loading
              ? "bg-gray-400"
              : "bg-[#f45b69] hover:bg-[#e14c58]"
          }`}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {error && (
          <p className="text-sm text-center text-red-500 mt-4">{error}</p>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-black font-medium">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

/* INPUT */
function Input({ label, value, setValue, valid }: any) {
  return (
    <div className="mb-4">
      <label className="block text-[14px] font-semibold text-black mb-2">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl bg-[#f2f2f2] border ${
          value && !valid ? "border-red-400" : "border-transparent"
        }`}
      />
    </div>
  )
}

/* PASSWORD */
function PasswordInput({ label, value, setValue, show, setShow, valid }: any) {
  return (
    <div className="mb-4">
      <label className="block text-[14px] font-semibold text-black mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full px-4 py-3 rounded-xl bg-[#f2f2f2] pr-12 border ${
            value && !valid ? "border-red-400" : "border-transparent"
          }`}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}