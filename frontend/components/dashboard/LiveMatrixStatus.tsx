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
    <div className="relative overflow-hidden bg-zinc-950 border border-white/5 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLive ? 'bg-[#FEED01]/10 border border-[#FEED01]/20' : 'bg-zinc-900 border border-white/5'}`}>
            <Activity className={`w-5 h-5 ${isLive ? 'text-[#FEED01]' : 'text-zinc-700'}`} />
          </div>
          <div>
            <h3 className="text-lg font-sketch font-black text-white uppercase tracking-tight italic">{agentName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                {isLive ? 'Connected' : isDraft ? 'Sandbox' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 px-6 py-3 bg-black/40 rounded-2xl border border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Latency</span>
            <span className="text-sm font-sketch font-bold text-white">{isLive ? `${latency}ms` : '--'}</span>
          </div>
          <div className="w-px h-6 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Uptime</span>
            <span className="text-sm font-sketch font-bold text-white">{isLive ? formatUptime(uptime) : '--'}</span>
          </div>
          <div className="w-px h-6 bg-white/5" />
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">Env</span>
            <select 
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="bg-transparent text-[10px] font-sketch font-bold text-white outline-none border-none p-0 cursor-pointer"
            >
              <option value="test" className="bg-zinc-900">Staging</option>
              <option value="production" className="bg-zinc-900">Production</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => onDeploy?.(stage)}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-sketch font-black transition-all uppercase tracking-widest ${
          isLive ? 'bg-[#FEED01] text-black shadow-lg shadow-[#FEED01]/10' : 'bg-zinc-900 text-zinc-600 border border-white/5 hover:bg-zinc-800'
        }`}>
          {isLive ? 'Live' : 'Go Live'}
        </button>
      </div>
    </div>
  )
}
