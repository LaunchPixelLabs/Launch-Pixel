'use client'
import React, { useEffect, useRef } from 'react'
import { Phone, Plus, Hash, CreditCard, Info, Zap, Globe, ShieldCheck } from 'lucide-react'
import gsap from 'gsap'
import { motion } from 'framer-motion'

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
    <div className="flex flex-col h-full bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 backdrop-blur-3xl max-w-6xl mx-auto w-full relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FEED01]/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#FEED01]/10 border border-[#FEED01]/20 flex items-center justify-center">
               <Hash className="text-[#FEED01] w-5 h-5"/>
            </div>
            <h2 className="text-3xl font-sketch font-bold text-white tracking-tight">Active Lines</h2>
          </div>
          <p className="text-sm text-zinc-500 font-sketch">Provision and assign voice channels for seamless communication.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-white/5 border border-white/10 hover:border-[#FEED01]/50 text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-2xl transition-all">
             <CreditCard className="w-4 h-4 text-zinc-400" /> Subscription Plan
           </button>
           <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-[#FEED01] text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(254,237,1,0.2)]">
             <Plus className="w-4 h-4" /> Spawn New Link
           </button>
        </div>
      </div>

      <div className="space-y-8 relative z-10" ref={containerRef}>
        {/* Featured Number (The User's Number) */}
        <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-[#FEED01]/30 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-24 h-24 text-[#FEED01]" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex gap-6 items-center">
               <div className="relative">
                 <div className="absolute inset-0 bg-[#FEED01] blur-xl opacity-20" />
                 <div className="relative w-20 h-20 bg-[#0c0c0e] rounded-3xl border border-[#FEED01]/50 flex items-center justify-center shadow-inner">
                    <Phone className="w-10 h-10 text-[#FEED01]" strokeWidth={1} />
                 </div>
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#FEED01] uppercase tracking-[0.3em]">Primary Voice Line</span>
                    <div className="h-px w-10 bg-[#FEED01]/20" />
                  </div>
                  <h3 className="text-4xl font-sketch font-bold text-white tracking-tight">+1 712 214 1889</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                       <Globe className="w-3 h-3" /> US - Iowa Hub
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-1 font-bold">
                       <ShieldCheck className="w-3 h-3" /> Fully Verified
                    </span>
                  </div>
               </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               <button className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono font-bold text-white uppercase tracking-widest hover:border-[#FEED01]/50 transition-all">
                 Configure Logic
               </button>
               <button className="flex-1 md:flex-none px-6 py-3 bg-[#FEED01]/10 border border-[#FEED01]/30 rounded-xl text-[10px] font-mono font-bold text-[#FEED01] uppercase tracking-widest hover:bg-[#FEED01] hover:text-black transition-all">
                 Assign Node
               </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
               <Info className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <p className="text-sm text-white font-sketch font-bold mb-1">Provisioning Protocol</p>
              <p className="text-[11px] text-zinc-500 font-sketch leading-relaxed">
                Numbers are synchronized via the global network. Provisioning occurs in real-time, instantly mapping the audio stream to a physical number.
              </p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
               <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-white font-sketch font-bold mb-1">Concurrency Limit</p>
              <p className="text-[11px] text-zinc-500 font-sketch leading-relaxed">
                Standard accounts support 1,000 concurrent call threads. Upgrade to Enterprise for unlimited high-frequency capacity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
