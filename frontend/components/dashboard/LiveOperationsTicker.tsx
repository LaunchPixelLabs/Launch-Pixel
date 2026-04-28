'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function LiveOperationsTicker() {
  const activities = [
    "Agent 'Sarah' closed a $450 deal",
    "Incoming call from +1 555-0192 answered by 'Receptionist'",
    "WhatsApp campaign 'Spring Sale' — 15% conversion rate",
    "Lead 'John Doe' marked as interested",
    "All agents online — average response time 120ms",
  ]

  return (
    <div className="w-full bg-white/8 border-y border-white/10 py-2.5 px-8 overflow-hidden relative group">
      <div className="flex gap-12 whitespace-nowrap animate-scroll items-center">
        {activities.map((act, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FEED01] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300 group-hover:text-white transition-colors">{act}</span>
          </div>
        ))}
        {/* Duplicate for seamless scrolling */}
        {activities.map((act, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FEED01] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-300 group-hover:text-white transition-colors">{act}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
