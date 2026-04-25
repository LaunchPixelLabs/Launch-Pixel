'use client'
import React, { useEffect, useRef } from 'react'
import { Phone, Plus, Hash, CreditCard, Info } from 'lucide-react'
import gsap from 'gsap'

export default function NumberManagementUI() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.1 }
      )
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 mb-8 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Hash className="text-[var(--lp-accent)] w-6 h-6"/> Phone Numbers</h2>
          <p className="text-sm text-zinc-400">Buy and assign Twilio phone numbers to your AI agents for inbound and outbound calls.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white text-sm font-semibold rounded-xl transition">
             <CreditCard className="w-4 h-4 text-zinc-400" /> Billing
           </button>
        </div>
      </div>

      <div className="space-y-4" ref={containerRef}>
        {/* Info Banner */}
        <div className="bg-[var(--lp-accent)]/5 border border-[var(--lp-accent)]/20 rounded-2xl p-5 flex items-start gap-4">
          <Info className="w-5 h-5 text-[var(--lp-accent)] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-white font-semibold mb-1">How Phone Numbers Work</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Phone numbers are provisioned through Twilio and automatically connected to your AI agents. 
              Each number can handle inbound calls, outbound campaigns, or both. Numbers start at $1.15/mo.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition cursor-pointer group">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-white/10">
              <Phone className="w-7 h-7 text-zinc-400 group-hover:text-[var(--lp-accent)]" />
           </div>
           <p className="text-lg font-semibold text-zinc-300 mb-1">No numbers provisioned yet</p>
           <p className="text-sm text-zinc-500 text-center max-w-md mb-6">
             Connect a Twilio account in Integrations to provision your first phone number and start making AI-powered calls.
           </p>
           <button className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-zinc-200 font-semibold rounded-xl text-sm transition shadow-[0_0_15px_rgba(255,255,255,0.1)]">
             <Plus className="w-4 h-4" /> Provision First Number
           </button>
        </div>
      </div>
    </div>
  )
}
