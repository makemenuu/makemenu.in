"use client"

import { Instagram, Facebook } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 px-6 md:px-12 lg:px-20 py-12 md:py-16">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">

        {/* DISCOVER */}
        <div>
          <h3 className="font-bold text-lg md:text-xl mb-4">DISCOVER</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="hover:text-black cursor-pointer transition">QR Ordering</li>
            <li className="hover:text-black cursor-pointer transition">Digital Menu</li>
            <li className="hover:text-black cursor-pointer transition">Billing System</li>
          </ul>
        </div>

        {/* FEATURES */}
        <div>
          <h3 className="font-bold text-lg md:text-xl mb-4">FEATURES</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="hover:text-black cursor-pointer transition">Menu Setup</li>
            <li className="hover:text-black cursor-pointer transition">Real-Time Orders</li>
            <li className="hover:text-black cursor-pointer transition">QR Code Generator</li>
          </ul>
        </div>

        {/* COMPANY */}
        <div>
          <h3 className="font-bold text-lg md:text-xl mb-4">COMPANY</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="hover:text-black cursor-pointer transition">Pricing</li>
            <li className="hover:text-black cursor-pointer transition">About</li>
            <li className="hover:text-black cursor-pointer transition">Privacy</li>
          </ul>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">

        {/* LEFT */}
        <div>
          © 2026 MakeMenu
        </div>

        {/* RIGHT (SOCIAL ICONS) */}
        <div className="flex gap-4">

          <a
            href="https://www.instagram.com/makemenu.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-600 transition"
          >
            <Instagram size={28} />
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61585467286055"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            <Facebook size={28} />
          </a>

        </div>

      </div>

    </footer>
  )
}