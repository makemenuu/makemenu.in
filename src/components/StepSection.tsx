"use client"

import StepItem from "./StepItem"
import useScrollAnimation from "@/hooks/useScrollAnimation"

export default function StepSection() {
  useScrollAnimation()

  const steps = [
    {
      number: "1",
      title: "Create Your Account",
      text: "Sign up on Makemenu using your phone or email. Add your shop name and basic details.",
      reverse: false,
    },
    {
      number: "2",
      title: "Add Your Menu",
      text: "Enter your food items, prices, and categories. You can update or edit your menu anytime.",
      reverse: true,
    },
    {
      number: "3",
      title: "Get Your QR Code",
      text: "Makemenu will generate a unique QR code for your shop. Download and print it.",
      reverse: false,
    },
    {
      number: "4",
      title: "Place QR in Your Shop",
      text: "Stick the QR code on tables or near the counter. Customers can easily scan it.",
      reverse: true,
    },
    {
      number: "5",
      title: "Customers Scan & Order",
      text: "Customers scan the QR code using their phone. They view your menu and place orders instantly.",
      reverse: false,
    },
    {
      number: "6",
      title: "Receive Orders on Your Screen",
      text: "Orders appear directly on your dashboard or kitchen screen. You can see what each customer ordered.",
      reverse: true,
    },
    {
      number: "7",
      title: "Prepare & Serve",
      text: "Prepare the food and serve it to the customer. Makemenu automatically calculates the bill.",
      reverse: false,
    },
  ]

  return (
    <section
      id="steps"
      className="bg-white px-6 md:px-12 lg:px-20 py-16 md:py-24"
    >

      <div className="space-y-16 md:space-y-24">

        {/* HEADING */}
        <header className="text-center fade-in">
          <h2 className="text-3xl md:text-5xl font-bold">
            How to use MakeMenu
          </h2>
          <p className="text-gray-600 mt-3 text-sm md:text-base">
            Get started in just a few simple steps
          </p>
        </header>

        {/* STEPS */}
        <div className="space-y-20 md:space-y-28">

          {steps.map((step, i) => (
            <div
              key={i}
              className="max-w-7xl mx-auto fade-in"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <StepItem {...step} />
            </div>
          ))}

        </div>

      </div>

    </section>
  )
}