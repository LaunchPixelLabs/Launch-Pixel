'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap, Activity, Globe, ShieldCheck, Database, Server, Info } from 'lucide-react'

interface LiveMatrixStatusProps {
  agentName?: string
  isLive?: boolean
}

export default function LiveMatrixStatus({ agentName = "Neural Core", isLive = true }: LiveMatrixStatusProps) {
  const [uptime, setUptime] = useState(0)
  const [synapticLoad, setSynapticLoad] = useState(24)
  const [latency, setLatency] = useState(142)

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1)
      setSynapticLoad(Math.floor(Math.random() * 15) + 20)
      setLatency(Math.floor(Math.random() * 20) + 130)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative group overflow-hidden bg-[#050505] border border-white/5 rounded-3xl p-6 shadow-2xl">
      {/* Background Pulse */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FEED01]/5 to-transparent opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner`}>
               <Cpu className={`w-8 h-8 ${isLive ? 'text-[#FEED01]' : 'text-zinc-600'} transition-colors duration-500`} />
            </div>
            {isLive && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-[#FEED01] rounded-full blur-[2px]"
              />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold text-[#FEED01] uppercase tracking-[0.2em]">Live Agent Status</span>
              <div className="h-px w-8 bg-white/10" />
            </div>
            <h3 className="text-2xl font-sketch font-bold text-white tracking-tight">{agentName}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  {isLive ? 'Online & Persistent' : 'Offline / Standby'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-600">|</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-3 h-3" /> Matrix Core: Global
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full md:w-auto bg-black/40 p-4 rounded-2xl border border-white/5">
          {/* Synaptic Load */}
          <div className="flex flex-col items-center md:items-start group/stat relative">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3 h-3 text-[#FEED01]/60" />
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Thinking Load</span>
            </div>
            <div className="text-xl font-sketch font-bold text-white">{synapticLoad}%</div>
            <span className="text-[8px] font-mono text-emerald-500 uppercase mt-1">Healthy (Low)</span>
            
            {/* Tooltip on hover */}
            <div className="absolute -top-12 left-0 w-32 bg-black border border-white/10 rounded-lg p-2 text-[8px] text-zinc-400 opacity-0 group-hover/stat:opacity-100 transition-opacity pointer-events-none z-50">
              How much "brain" power is being used. Lower is better for faster replies.
            </div>
          </div>

          {/* Latency */}
          <div className="flex flex-col items-center md:items-start group/stat relative">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3 h-3 text-[#FEED01]/60" />
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Reply Speed</span>
            </div>
            <div className="text-xl font-sketch font-bold text-white">{latency}ms</div>
            <span className="text-[8px] font-mono text-emerald-500 uppercase mt-1">Excellent (Fast)</span>

            <div className="absolute -top-12 left-0 w-32 bg-black border border-white/10 rounded-lg p-2 text-[8px] text-zinc-400 opacity-0 group-hover/stat:opacity-100 transition-opacity pointer-events-none z-50">
              The delay in the agent's voice. Below 200ms feels like a real human.
            </div>
          </div>

          {/* Uptime */}
          <div className="flex flex-col items-center md:items-start group/stat relative">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-3 h-3 text-[#FEED01]/60" />
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Stability</span>
            </div>
            <div className="text-xl font-sketch font-bold text-white">{formatUptime(uptime)}</div>
            <span className="text-[8px] font-mono text-emerald-500 uppercase mt-1">100% Stable</span>

            <div className="absolute -top-12 left-0 w-32 bg-black border border-white/10 rounded-lg p-2 text-[8px] text-zinc-400 opacity-0 group-hover/stat:opacity-100 transition-opacity pointer-events-none z-50">
              How long the agent has been live in memory without crashing.
            </div>
          </div>
        </div>

        <div className="flex gap-2">
           <button className="px-6 py-3 bg-[#FEED01] rounded-xl text-[10px] font-sketch font-bold text-black hover:scale-105 active:scale-95 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(254,237,1,0.2)]">
             Full Uplink Active
           </button>
        </div>
      </div>
    </div>
  )
}
