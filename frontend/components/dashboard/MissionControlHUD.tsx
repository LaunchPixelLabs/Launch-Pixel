"use client"

import React from "react"
import { motion } from "framer-motion"
import { Activity, Zap, Phone, Shield, Globe, Cpu } from "lucide-react"

interface MissionControlHUDProps {
  stats: {
    activeCalls: number;
    whatsappQueue: number;
    neuralTurns: number;
    safetyScore: number;
  }
}

export default function MissionControlHUD({ stats }: MissionControlHUDProps) {
  const metrics = [
    { label: "Active Calls", value: stats.activeCalls, icon: Phone, color: "text-[#FEED01]", glow: "shadow-[0_0_15px_rgba(254,237,1,0.2)]" },
    { label: "Pending Queue", value: stats.whatsappQueue, icon: Zap, color: "text-blue-400", glow: "shadow-[0_0_15px_rgba(96,165,250,0.2)]" },
    { label: "Total Actions", value: stats.neuralTurns, icon: Cpu, color: "text-purple-400", glow: "shadow-[0_0_15px_rgba(192,132,252,0.2)]" },
    { label: "Safety Score", value: `${stats.safetyScore}%`, icon: Shield, color: "text-emerald-400", glow: "shadow-[0_0_15px_rgba(52,211,153,0.2)]" },
  ]

  return (
    <div className="flex gap-4 mb-8">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex-1 bg-[#0d0d0f]/80 border border-white/5 p-4 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-[#FEED01]/20 transition-all ${m.glow}`}
        >
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <m.icon className="w-12 h-12" />
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-white/5 ${m.color}`}>
              <m.icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{m.label}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black italic tracking-tighter">{m.value}</span>
            <div className="h-1 w-8 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                className={`h-full ${m.color.replace('text', 'bg')}`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
