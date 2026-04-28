'use client'

import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Target, DollarSign, Activity, Zap } from 'lucide-react'
import gsap from 'gsap'

interface GrowthPanelProps {
  stats: {
    revenue?: number;
    hoursSaved?: number;
    leadQuality?: number;
    activeAgents?: number;
  }
}

const StatCounter = ({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) => {
  const counterRef = useRef<HTMLSpanElement>(null)
  
  useEffect(() => {
    if (!counterRef.current) return
    gsap.to(counterRef.current, {
      innerText: value,
      duration: 2,
      snap: { innerText: 1 },
      ease: "power2.out",
      onUpdate: function() {
        if (counterRef.current) {
          const val = parseFloat(counterRef.current.innerText)
          counterRef.current.innerText = prefix + val.toLocaleString() + suffix
        }
      }
    })
  }, [value, prefix, suffix])

  return <span ref={counterRef}>{prefix}0{suffix}</span>
}

export default function GrowthPanel({ stats }: GrowthPanelProps) {
  const metrics = [
    { 
      label: "Revenue", 
      value: stats.revenue || 0,
      prefix: "$",
      sub: "Total pipeline value",
      icon: DollarSign, 
      color: "text-[#FEED01]", 
      bg: "bg-[#FEED01]/10" 
    },
    { 
      label: "Hours Saved", 
      value: stats.hoursSaved || 0,
      suffix: "h",
      sub: "By your agents",
      icon: Clock, 
      color: "text-blue-400", 
      bg: "bg-blue-400/10" 
    },
    { 
      label: "Conversion Rate", 
      value: stats.leadQuality || 0,
      suffix: "%",
      sub: "Leads that convert",
      icon: Target, 
      color: "text-emerald-400", 
      bg: "bg-emerald-400/10" 
    },
    { 
      label: "Uptime", 
      value: 99.9,
      suffix: "%",
      sub: "Always running",
      icon: Activity, 
      color: "text-purple-400", 
      bg: "bg-purple-400/10" 
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            delay: i * 0.1, 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="relative group cursor-pointer"
        >
          {/* Glassmorphism Background Glow */}
          <div className="absolute inset-0 bg-[#FEED01]/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full" />
          
          <div className="relative bg-[#141418] border border-white/10 p-6 rounded-[2.5rem] hover:border-[#FEED01]/30 transition-all duration-500 overflow-hidden group/card">
            <div className={`absolute -right-8 -top-8 w-32 h-32 ${m.bg} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-700`} />
            
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-[1.2rem] ${m.bg} flex items-center justify-center border border-white/10 group-hover/card:scale-110 transition-transform duration-500`}>
                <m.icon className={`w-7 h-7 ${m.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-[0.15em]">{m.label}</span>
                <span className="text-[10px] font-medium text-zinc-500 mt-0.5">{m.sub}</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div className="text-4xl font-black italic tracking-tighter text-white">
                <StatCounter value={m.value} prefix={m.prefix} suffix={m.suffix} />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.2%</span>
              </div>
            </div>

            {/* Premium Progress Indicator */}
            <div className="mt-6 h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{ duration: 2, delay: i * 0.3, ease: "circOut" }}
                className={`h-full ${m.color.replace('text', 'bg')} relative shadow-[0_0_15px_rgba(254,237,1,0.5)]`}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
