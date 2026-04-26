"use client"

import { Phone, MessageCircle } from "lucide-react"
import { motion } from "framer-motion"

const FloatingButtons = () => {
  const phoneNumber = "+917004635011"

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`
  }

  const handleWhatsApp = () => {
    window.location.href = `https://wa.me/${phoneNumber.replace('+', '')}`
  }

  return (
    // Only visible on mobile (hidden on md and up)
    <div className="fixed bottom-5 right-4 flex flex-col gap-3 z-50 md:hidden">
      {/* Call Button */}
      <motion.button
        className="relative w-12 h-12 rounded-full flex items-center justify-center bg-indigo-600/90 text-white shadow-lg backdrop-blur-sm"
        onClick={handleCall}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Call us"
      >
        {/* Subtle glow effect */}
        <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-50 blur-md animate-pulse" />
        <Phone className="w-5 h-5 relative z-10" />
      </motion.button>

      {/* WhatsApp Button */}
      <motion.button
        className="relative w-12 h-12 rounded-full flex items-center justify-center bg-[#25D366]/90 text-white shadow-lg backdrop-blur-sm"
        onClick={handleWhatsApp}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        aria-label="Message on WhatsApp"
      >
        {/* Subtle glow effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-50 blur-md animate-pulse" />
        <MessageCircle className="w-5 h-5 relative z-10" />
      </motion.button>
    </div>
  )
}

export default FloatingButtons
