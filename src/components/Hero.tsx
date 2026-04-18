"use client"

import Image from "next/image"
import Link from "next/link"
import useScrollAnimation from "@/hooks/useScrollAnimation"

export default function Hero() {
  useScrollAnimation()

  return (
    <section className="relative overflow-hidden flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-20 py-16 md:py-24 gap-10">

      {/* 🔥 PATTERN BACKGROUND (REFERENCE STYLE) */}
      <div className="absolute top-0 right-0 w-[700px] md:w-[1000px] h-full pointer-events-none z-0">

        {/* PATTERN IMAGE */}
        <img
          src="/pattern.png"   // make sure this exists in /public
          alt="background pattern"
          className="absolute top-0 right-0 w-full h-auto opacity-15"
        />

        {/* GRADIENT FADE (KEY FOR REFERENCE LOOK) */}
        <div className="absolute inset-0 bg-gradient-to-l from-white via-white/80 to-transparent"></div>

      </div>

      {/* LEFT */}
      <div className="relative z-10 max-w-xl space-y-6 text-center md:text-left fade-in">

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Power your business
          <br />
          with digital menus
        </h1>

        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          MakeMenu is a powerful QR code ordering system for restaurants,
          cafés, and food outlets — offer contactless menus, instant ordering,
          and seamless payments.
        </p>

        <Link href="/signup">
          <button className="w-full md:w-auto btn-animate bg-red-500 text-white px-6 md:px-8 py-3 rounded-xl text-base md:text-lg font-medium shadow-md hover:shadow-lg">
            Start growing your business
          </button>
        </Link>

      </div>

      {/* RIGHT */}
      <div className="relative z-10 flex justify-center w-full md:w-auto fade-in">

        <div className="animate-float">

          <Image
            src="/landing/hero.png"
            alt="QR restaurant ordering dashboard preview"
            width={520}
            height={340}
            className="rounded-2xl shadow-xl w-full max-w-[420px] md:max-w-[520px]"
            priority
          />

        </div>

      </div>

    </section>
  )
}