"use client"

import Link from "next/link"
import { useState } from "react"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">

      <div className="flex items-center justify-between px-6 md:px-12 py-4">

        {/* LEFT: Logo + Nav */}
        <div className="flex items-center gap-8">

          {/* LOGO */}
          <Link href="/">
            <img
              src="/logo.png"
              alt="MakeMenu Logo"
              className="h-10 w-auto cursor-pointer"
            />
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8 text-lg font-semibold">

            <button
              onClick={() =>
                document
                  .getElementById("steps")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="cursor-pointer hover:text-red-500 transition"
            >
              Product
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="cursor-pointer hover:text-red-500 transition"
            >
              Pricing
            </button>

          </div>
        </div>

        {/* RIGHT: AUTH */}
        <div className="hidden md:flex gap-6 text-lg font-semibold">

          <Link
            href="/login"
            className="hover:text-red-500 transition"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="hover:text-red-500 transition"
          >
            Sign up
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 space-y-4 text-lg font-semibold bg-white border-t">

          <div className="flex flex-col gap-4">

            <button
              onClick={() => {
                setMenuOpen(false)
                document
                  .getElementById("steps")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-left hover:text-red-500"
            >
              Product
            </button>

            <button
              onClick={() => {
                setMenuOpen(false)
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              className="text-left hover:text-red-500"
            >
              Pricing
            </button>

            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="hover:text-red-500"
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="hover:text-red-500"
            >
              Sign up
            </Link>

          </div>

        </div>
      )}
    </header>
  )
}