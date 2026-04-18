"use client"

import useScrollAnimation from "@/hooks/useScrollAnimation"

export default function WhySection() {
  useScrollAnimation()

  const leftItems = [
    {
      title: "We Understand Your Shop",
      text: "Makemenu is built for small food businesses that need speed and simplicity. We help you take orders faster, reduce mistakes, and run your shop smoothly.",
    },
    {
      title: "Built for",
      text: "Specifically for tea shops, cafés, and food stalls.",
    },
    {
      title: "Smart & Simple System",
      text: "Everything works in one place — simple and fast.",
    },
  ]

  const rightItems = [
    {
      title: "Always Improving",
      text: "We continuously improve Makemenu.",
    },
    {
      title: "Here to Support You",
      text: "We help you set up easily.",
    },
    {
      title: "Unlimited Menu addons",
      text: "Create unlimited menus.",
    },
  ]

  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">

      {/* HEADING */}
      <div className="text-center mb-12 md:mb-16 fade-in">
        <h2 className="text-3xl md:text-5xl font-bold">
          Why Choose MakeMenu?
        </h2>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">

        {/* LEFT */}
        <div className="space-y-8">
          {leftItems.map((item, i) => (
            <div
              key={i}
              className="fade-in"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <h3 className="text-lg md:text-xl font-semibold">
                {item.title}
              </h3>
              <p className="text-gray-600 mt-2">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div className="space-y-8 md:border-l md:pl-10">
          {rightItems.map((item, i) => (
            <div
              key={i}
              className="fade-in"
              style={{ transitionDelay: `${(i + 3) * 0.1}s` }}
            >
              <h3 className="text-lg md:text-xl font-semibold">
                {item.title}
              </h3>
              <p className="text-gray-600 mt-2">
                {item.text}
              </p>
            </div>
          ))}
        </div>

      </div>

    </section>
  )
}