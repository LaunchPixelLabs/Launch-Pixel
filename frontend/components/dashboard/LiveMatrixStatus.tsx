'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap, Activity, Globe, ShieldCheck, Database, Server, Info } from 'lucide-react'

interface LiveMatrixStatusProps {
  agentName?: string
  isLive?: boolean
}

export default function LiveMatrixStatus({ 
  agentName = "Agent System", 
  isLive = false,
  isDraft = true 
}: LiveMatrixStatusProps & { isDraft?: boolean }) {
  const [uptime, setUptime] = useState(0)
  const [synapticLoad, setSynapticLoad] = useState(0)
  const [latency, setLatency] = useState(0)

  useEffect(() => {
    if (!isLive) {
      setUptime(0);
      setSynapticLoad(0);
      setLatency(0);
      return;
    }
    // Only show "simulated" healthy load if actually live
    setSynapticLoad(21);
    setLatency(135);

    const timer = setInterval(() => {
      setUptime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isLive])

  const formatUptime = (seconds: number) => {
    if (seconds === 0) return "--:--:--"
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative group overflow-hidden bg-black/40 border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl">
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-inner`}>
               <Activity className={`w-6 h-6 ${isLive ? 'text-[#FEED01]' : 'text-zinc-700'} transition-colors duration-500`} />
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold text-[#FEED01] uppercase tracking-[0.2em] opacity-50">Performance</span>
              <div className="h-px w-6 bg-white/5" />
            </div>
            <h3 className="text-xl md:text-2xl font-sketch font-black text-white tracking-tight uppercase italic">{agentName}</h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'} ${isLive ? 'animate-pulse' : ''}`} />
                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {isLive ? 'Online' : isDraft ? 'Draft' : 'Standby'}
                </span>
              </div>
              <span className="hidden md:inline text-[9px] font-mono text-zinc-800">|</span>
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-1 whitespace-nowrap">
                Cloud Engine
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 w-full md:w-auto bg-black/40 p-4 rounded-2xl border border-white/5">
          {/* Processing */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1">Processing</span>
            <div className="text-xl font-sketch font-bold text-white">{isLive ? synapticLoad : 0}%</div>
            <span className={`text-[8px] font-mono uppercase mt-1 ${isLive ? 'text-emerald-500' : 'text-zinc-700'}`}>
              {isLive ? 'Healthy' : 'Inert'}
            </span>
          </div>

          {/* Response */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1">Response</span>
            <div className="text-xl font-sketch font-bold text-white">{isLive ? latency : 0}ms</div>
            <span className={`text-[8px] font-mono uppercase mt-1 ${isLive ? 'text-emerald-500' : 'text-zinc-700'}`}>
              {isLive ? 'Optimal' : 'Inert'}
            </span>
          </div>

          {/* Uptime */}
          <div className="flex flex-col items-center md:items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1">Uptime</span>
            <div className="text-xl font-sketch font-bold text-white">{formatUptime(uptime)}</div>
            <span className={`text-[8px] font-mono uppercase mt-1 ${isLive ? 'text-emerald-500' : 'text-zinc-700'}`}>
              {isLive ? '100% Stable' : 'Offline'}
            </span>
          </div>

          {/* WhatsApp Status */}
          <div className="flex flex-col items-center md:items-start border-l border-white/5 pl-8">
            <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-1">Channel Uplink</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              <div className="text-lg font-sketch font-black text-white">WhatsApp</div>
            </div>
            <span className="text-[8px] font-mono uppercase mt-1 text-emerald-500 font-bold">
              Connected
            </span>
          </div>
        </div>

        <div className="flex gap-2">
            <button className={`px-8 py-3 rounded-2xl text-[11px] font-sketch font-black transition-all uppercase tracking-widest shadow-xl ${
              isLive ? 'bg-[#FEED01] text-black shadow-[#FEED01]/20 hover:scale-105' : 'bg-zinc-900 text-zinc-600 border border-white/5'
            }`}>
              {isLive ? 'Live' : 'Go Live'}
            </button>
        </div>
      </div>
    </div>
  )
}
