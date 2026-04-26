"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../../../lib/firebase"

export default function AgentAuth() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      await signInWithPopup(auth, googleProvider)
      // Success - Redirect to Dashboard
      router.push("/call/dashboard")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Authentication failed. Make sure Firebase is configured.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Cinematic Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => router.push("/call")}
          className="mb-8 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          Back to Launch Pixel AI
        </button>

        <div className="bg-gray-900/60 backdrop-blur-2xl border border-gray-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-950 rounded-2xl flex items-center justify-center border border-gray-800 relative">
              <ShieldCheck className="w-8 h-8 text-indigo-400" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-indigo-500/20 rounded-2xl" 
                style={{ clipPath: "polygon(0 0, 100% 0, 100% 10%, 0 10%)" }}
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2 font-display tracking-tight">Agent Terminal Access</h1>
          <p className="text-gray-400 text-sm mb-8">Sign in securely using Google to orchestrate your AI calling systems.</p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3 mb-6 text-center"
            >
              {error}
            </motion.div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">Authenticating Google Session...</span>
            ) : (
              <>
                {/* SVG Google Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
