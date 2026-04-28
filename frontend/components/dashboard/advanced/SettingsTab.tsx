'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Phone, ShieldAlert } from 'lucide-react'

interface SettingsTabProps {
  transferPhoneNumber: string
  setTransferPhoneNumber: (v: string) => void
  promptInjectionProtection: boolean
  setPromptInjectionProtection: (v: boolean) => void
  hallucinationGuard: boolean
  setHallucinationGuard: (v: boolean) => void
}

export default function SettingsTab({
  transferPhoneNumber, setTransferPhoneNumber,
  promptInjectionProtection, setPromptInjectionProtection,
  hallucinationGuard, setHallucinationGuard
}: SettingsTabProps) {
  return (
    <div className="p-8 lg:p-12 space-y-12 overflow-y-auto no-scrollbar relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FEED01]/10 border border-[#FEED01]/20 flex items-center justify-center">
          <Settings className="w-6 h-6 text-[#FEED01]"/>
        </div>
        <div>
          <h3 className="text-2xl font-sketch font-bold text-white">Neural Configuration</h3>
          <p className="text-sm text-zinc-500 font-sketch">Adjust high-level synaptic parameters and security protocols.</p>
        </div>
      </div>
      
      {/* Transfer Phone Number */}
      <div className="space-y-4 max-w-2xl bg-white/5 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Phone className="w-12 h-12 text-[#FEED01]" />
        </div>
        <label className="text-xs font-bold text-[#FEED01] uppercase tracking-[0.2em] flex items-center gap-2">
          Logic: Neural Transfer
        </label>
        <h4 className="text-lg font-sketch font-bold text-white">Call Forwarding Uplink</h4>
        <p className="text-sm text-zinc-500 font-sketch leading-relaxed">
          Define the termination point for physical call transfers. The agent will hand off the synaptic stream to this number in E.164 format.
        </p>
        <div className="relative mt-4">
          <input
            type="tel"
            value={transferPhoneNumber || ""}
            onChange={(e) => setTransferPhoneNumber(e.target.value)}
            placeholder="+17122141889"
            className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#FEED01]/50 outline-none font-mono transition-all"
          />
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-6 pt-8 border-t border-white/5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h4 className="text-lg font-sketch font-bold text-white">Security & Integrity</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-[#FEED01]/20 transition-all group">
            <div className="space-y-1">
              <p className="text-sm text-white font-sketch font-bold">Injection Shield</p>
              <p className="text-[10px] text-zinc-500 font-sketch">Prevents prompt-override attempts.</p>
            </div>
            <div 
              onClick={() => setPromptInjectionProtection(!promptInjectionProtection)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${promptInjectionProtection ? 'bg-[#FEED01]' : 'bg-zinc-800'}`}
            >
              <motion.div 
                animate={{ x: promptInjectionProtection ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full absolute shadow-lg" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-[#FEED01]/20 transition-all group">
            <div className="space-y-1">
              <p className="text-sm text-white font-sketch font-bold">Hallucination Guard</p>
              <p className="text-[10px] text-zinc-500 font-sketch">Strict adherence to memory matrix.</p>
            </div>
            <div 
              onClick={() => setHallucinationGuard(!hallucinationGuard)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${hallucinationGuard ? 'bg-[#FEED01]' : 'bg-zinc-800'}`}
            >
              <motion.div 
                animate={{ x: hallucinationGuard ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full absolute shadow-lg" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
