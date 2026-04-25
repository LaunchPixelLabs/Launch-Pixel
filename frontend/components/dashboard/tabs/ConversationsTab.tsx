'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Download, Search, MessageSquare, TrendingUp, UserCheck, ShieldCheck } from 'lucide-react'

interface ConversationsTabProps {
  analytics: any
  logs: any[]
  isLoading?: boolean
}

export default function ConversationsTab({
  analytics,
  logs,
  isLoading
}: ConversationsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 h-full flex flex-col"
    >
      {/* Executive Overview Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Synapses", value: analytics?.totalCalls || "0", icon: TrendingUp, color: "text-[#FEED01]" },
          { label: "Neural Minutes", value: `${Math.round(analytics?.totalMinutes || 0)}m`, icon: MessageSquare, color: "text-blue-400" },
          { label: "Sales Efficiency", value: `${analytics?.conversionRate || 0}%`, icon: UserCheck, color: "text-emerald-400" },
          { label: "Guardian Health", value: "99.8%", icon: ShieldCheck, color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-[#0d0d0f] border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-3xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Live Intel Matrix */}
      <div className="flex-1 bg-[#0d0d0f] border border-white/5 rounded-3xl flex flex-col min-h-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,#FEED0105_0%,transparent_30%)]" />
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FEED01]/10 rounded-2xl flex items-center justify-center border border-[#FEED01]/20">
              <Search className="w-4 h-4 text-[#FEED01]" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">Live Synaptic Intel</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Real-time interaction audit</p>
            </div>
          </div>
          
          <button 
            disabled={!logs || logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#FEED01]/10 text-zinc-400 hover:text-[#FEED01] rounded-xl border border-white/5 hover:border-[#FEED01]/20 transition-all font-bold text-[10px] uppercase tracking-widest disabled:opacity-30"
          >
            <Download className="w-3 h-3" />
            Export Intel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0d0d0f] z-20">
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Contact Uplink</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Cognitive Load</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Neural Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Sentiment Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <div className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-full animate-spin-slow" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Synaptic Feed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-[#FEED01]/5 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-[11px] font-bold text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-white border border-white/5 group-hover:border-[#FEED01]/30">
                          {log.AgentContact?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-[#FEED01] transition-colors">{log.AgentContact?.name || log.contactPhone}</p>
                          <p className="text-[9px] text-zinc-600 font-bold uppercase">{log.contactPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-zinc-400">
                      {Math.round(log.duration)}s
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'} animate-pulse`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          log.outcome?.toLowerCase().includes('book') || log.outcome?.toLowerCase().includes('interest')
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]'
                            : 'bg-zinc-800 text-zinc-500 border-white/5'
                        }`}>
                          {log.outcome || 'Neutral Signal'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
