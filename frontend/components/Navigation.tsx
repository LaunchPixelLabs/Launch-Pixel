"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { X, Phone, Menu } from "lucide-react"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Update scroll state
  useMotionValueEvent(scrollY, "change", (latest) => {
    const scrolled = latest > 50
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled)
    }
  })

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/call", label: "AI Agent" },
    { href: "/blogs", label: "Blog" },
    { href: "/careers", label: "Careers" },
  ]

  // Animation variants
  const containerVariants = {
    top: {
      width: "95%",
      maxWidth: "72rem", // max-w-6xl
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      backdropFilter: "blur(24px)",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: "9999px",
      padding: "0.5rem 1.5rem",
      gap: "0rem",
      justifyContent: "space-between",
    },
    scrolled: {
      width: "100%",
      maxWidth: "100%",
      backgroundColor: "rgba(0, 0, 0, 0)",
      backdropFilter: "blur(0px)",
      borderColor: "rgba(255, 255, 255, 0)",
      borderRadius: "0px",
      padding: "1.5rem 2.5rem", // More spacious spread
      gap: "0rem",
      justifyContent: "space-between",
    }
  }

  // Disable floating animations for performance
  // on mobile we handle responsiveness cleanly

  return (
    <>
      <motion.nav
        className="fixed top-2 sm:top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Slightly smoother/slower easing
      >
        <motion.div
          layout
          variants={containerVariants}
          className="flex items-center border shadow-xl relative pointer-events-auto transition-all"
          style={{
            // We handle styles in variants, but some statics here
            // Note: On mobile we might want to force the 'top' look style,
            // but the prompt implies a global interaction. We'll verify responsiveness via CSS classes override if needed.
          }}
        >
          {/* Floating gradient orb effect - Only visible at top state */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl -z-10"
              />
            )}
          </AnimatePresence>

          {/* --- LEFT: LOGO --- */}
          <motion.div layout className="flex items-center">
            <Link href="/" className="relative group block">
              <motion.div
                layout
                className={`relative flex items-center justify-center transition-all duration-300 ${isScrolled
                  ? "w-14 h-14 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg"
                  : "w-auto h-auto bg-transparent border-none shadow-none"
                  }`}
              >
                <Image
                  src="/logo.gif"
                  alt="LaunchPixel"
                  width={isScrolled ? 56 : 98}
                  height={isScrolled ? 56 : 98}
                  className={`rounded-full object-contain transition-all duration-500 ${isScrolled ? "w-10 h-10" : "w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[98px] md:h-[98px]"
                    }`}
                />
              </motion.div>
            </Link>
          </motion.div>

          {/* --- CENTER: NAV LINKS --- */}
          {/* Desktop Nav */}
          <motion.div layout className="hidden lg:flex items-center gap-1 xl:gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={isScrolled ? "scrolled-nav" : "top-nav"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                className={`flex items-center ${isScrolled
                  ? "gap-8 px-10 py-4 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 shadow-xl" // Darker, more prominent
                  : "gap-1"
                  }`}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-sm font-medium transition-all duration-300 group ${isScrolled
                      ? "px-2 py-1 text-gray-200 hover:text-white"
                      : "px-4 py-1.5 text-gray-400 hover:text-white"
                      } ${pathname === item.href ? "text-white" : ""}`}
                  >
                    {pathname === item.href && !isScrolled && (
                      <span className="absolute inset-0 bg-white/10 rounded-full" />
                    )}
                    <span className="relative z-10">{item.label}</span>
                    {/* Underline only in top state or modified in scrolled? Request says clean typography in scrolled */}
                    {!isScrolled && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-indigo-400 to-purple-400 group-hover:w-3/4 transition-all duration-300" />
                    )}
                    {isScrolled && pathname === item.href && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                    )}
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* --- RIGHT: ACTIONS --- */}
          <motion.div layout className="flex items-center gap-4">
            {/* Contact Button */}
            <Link
              href="/contact"
              className="hidden lg:block group"
            >
              <AnimatePresence mode="wait">
                {isScrolled ? (
                  <motion.button
                    key="icon-contact"
                    layout
                    initial={{ scale: 0.8, opacity: 0, rotate: 180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.8, opacity: 0, rotate: -180 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                    className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-pink-600 rounded-full text-white shadow-lg shadow-indigo-500/30 border border-white/10"
                  >
                    <Phone size={24} className="fill-current" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="text-contact"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative px-7 py-3 text-base font-semibold text-white overflow-hidden rounded-full"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:scale-105 transition-transform" />
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    <span className="relative z-10">Contact</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors bg-gray-800/50 rounded-full border border-gray-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </motion.div>

        </motion.div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-950/95 backdrop-blur-xl lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <Link href="/" onClick={() => setIsMenuOpen(false)}>
                <Image
                  src="/logo.gif"
                  alt="LaunchPixel"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors bg-gray-800/50 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col p-6 gap-3 overflow-y-auto h-[calc(100vh-100px)]">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block w-full text-left py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-300 ${pathname === item.href
                      ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white border border-indigo-500/30"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50 border border-gray-800"
                      }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.05 }}
              >
                <Link
                  href="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center mt-4 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
