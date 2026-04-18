"use client"

import useScrollAnimation from "@/hooks/useScrollAnimation"

export default function Banner() {
  useScrollAnimation()

  return (
    <section className="bg-red-500 text-white py-16 md:py-24 text-center px-6">

      <div className="fade-in">

        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
          Scan. Order. Serve. Faster.
        </h2>

        <p className="text-base md:text-lg mt-4 opacity-90">
          In trend uh 🚀
        </p>

      </div>

    </section>
  )
}