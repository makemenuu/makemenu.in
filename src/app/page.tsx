"use client"

import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import StepSection from "@/components/StepSection"
import Banner from "@/components/Banner"
import WhySection from "@/components/WhySection"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main className="bg-white text-black">

      <Navbar />
      <Hero />
      <StepSection />
      <Banner />
      <WhySection />
      <Footer />

    </main>
  )
}