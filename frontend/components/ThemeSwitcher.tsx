'use client'

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex bg-black/40 border border-white/5 backdrop-blur-md rounded-full p-1 overflow-hidden pointer-events-auto">
      <button
        onClick={() => setTheme('theme-main')}
        className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors z-10 ${
          theme === 'theme-main' ? 'text-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        {theme === 'theme-main' && (
          <motion.div
            layoutId="theme-pill"
            className="absolute inset-0 bg-white rounded-full -z-10"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <Sun className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">LaunchPixel Primary</span>
      </button>

      <button
        onClick={() => setTheme('theme-alt')}
        className={`relative flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full transition-colors z-10 ${
          theme === 'theme-alt' ? 'text-black' : 'text-zinc-400 hover:text-white'
        }`}
      >
        {theme === 'theme-alt' && (
          <motion.div
            layoutId="theme-pill"
            className="absolute inset-0 bg-white rounded-full -z-10"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
         <Moon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Alt Crimson Theme</span>
      </button>
    </div>
  )
}
