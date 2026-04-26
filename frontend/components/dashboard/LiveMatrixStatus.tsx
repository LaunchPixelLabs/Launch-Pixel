'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap, Activity, Globe, ShieldCheck, Database, Server, Info } from 'lucide-react'

interface LiveMatrixStatusProps {
  agentName?: string
  isLive?: boolean
  isDraft?: boolean
  onDeploy?: (stage: string) => void
}

export default function LiveMatrixStatus({ 
  agentName = "Agent System", 
  isLive = false,
  isDraft = true,
  onDeploy
}: LiveMatrixStatusProps) {
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

  const [stage, setStage] = useState<'test' | 'production'>('production')

  return (
    <div className="relative overflow-hidden bg-[#08080a] border border-white/5 rounded-3xl p-6 shadow-2xl backdrop-blur-xl group hover:border-[#FEED01]/20 transition-all">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isLive ? 'bg-[#FEED01]/20 border border-[#FEED01]/30 shadow-[0_0_20px_rgba(254,237,1,0.2)]' : 'bg-white/5 border border-white/10'}`}>
            <Activity className={`w-6 h-6 ${isLive ? 'text-[#FEED01]' : 'text-zinc-600'}`} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight italic group-hover:text-[#FEED01] transition-colors">{agentName}</h3>
            <div className="flex items-center gap-2.5 mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-amber-500'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isLive ? 'Online & Ready' : isDraft ? 'Testing Mode' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10 px-8 py-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Network Lag</span>
            <span className="text-sm font-bold text-white tracking-wider">{isLive ? `${latency}ms` : '--'}</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Session Time</span>
            <span className="text-sm font-bold text-white tracking-wider">{isLive ? formatUptime(uptime) : '--'}</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Environment</span>
            <select 
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="bg-transparent text-[11px] font-black text-[#FEED01] uppercase tracking-widest outline-none border-none p-0 cursor-pointer hover:text-white transition-colors"
            >
              <option value="test" className="bg-zinc-900">Sandbox</option>
              <option value="production" className="bg-zinc-900">Live Server</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => onDeploy?.(stage)}
          className={`px-8 py-3.5 rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.2em] shadow-xl ${
          isLive 
            ? 'bg-[#FEED01] text-black hover:scale-105 active:scale-95 shadow-[#FEED01]/20' 
            : 'bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10 hover:text-white'
        }`}>
          {isLive ? 'Live Now' : 'Deploy Agent'}
        </button>
      </div>
    </div>
  )
}
