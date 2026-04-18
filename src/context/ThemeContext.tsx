"use client"

import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext<any>(null)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved) setTheme(saved)
  }, [])

  const toggleTheme = (mode: "light" | "dark") => {
    setTheme(mode)
    localStorage.setItem("theme", mode)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "bg-black text-white" : "bg-white text-black"}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)