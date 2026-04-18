"use client"

import { useEffect, useRef, useState } from "react"

export default function StepItem({
  number,
  title,
  text,
  reverse
}: {
  number: string
  title: string
  text: string
  reverse: boolean
}) {

  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 }
    )

    if (ref.current) observer.observe(ref.current)

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`
        flex flex-col md:flex-row items-center justify-between gap-12 md:gap-24
        ${reverse ? "md:flex-row-reverse" : ""}
        transition-all duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
      `}
    >

      {/* IMAGE */}
      <div className="w-full max-w-[350px] md:max-w-[450px] h-[220px] md:h-[280px] bg-gray-100 rounded-xl flex items-center justify-center shadow-sm hover:scale-105 transition duration-300">
        <span className="text-gray-400">Image</span>
      </div>

      {/* TEXT */}
      <div className="max-w-md space-y-4 text-center md:text-left">

        <h3 className="text-red-500 text-4xl md:text-6xl font-bold">
          {number}
        </h3>

        <h4 className="text-xl md:text-2xl font-semibold">
          {title}
        </h4>

        <p className="text-gray-600 text-base md:text-lg leading-relaxed">
          {text}
        </p>

      </div>

    </div>
  )
}