'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Webhook, Calendar, Search, Mail, Command, Database, X, Check, Loader2, Zap, Shield, ArrowUpRight, Cpu, Activity, LayoutGrid, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const categories = [
  { id: 'all', name: 'All Modules' },
  { id: 'automation', name: 'Automation' },
  { id: 'outreach', name: 'Outreach' },
  { id: 'intelligence', name: 'Intelligence' },
]

const toolsList = [
  { id: 'calendar', category: 'automation', name: 'Google Calendar V2', desc: 'Neural scheduling for automated meeting orchestration.', icon: <Calendar />, status: 'ACTIVE', bg: 'hover:border-blue-500/50', fields: [{ key: 'clientId', label: 'OAuth Client ID', type: 'text', placeholder: 'Enter Client ID' }, { key: 'clientSecret', label: 'OAuth Client Secret', type: 'password', placeholder: 'Enter Client Secret' }] },
  { id: 'webhook', category: 'automation', name: 'Matrix Webhooks', desc: 'Dynamic API triggers for real-time external synchronization.', icon: <Webhook />, status: 'CONFIG_REQUIRED', bg: 'hover:border-emerald-500/50', fields: [{ key: 'url', label: 'Webhook URL', type: 'url', placeholder: 'https://api.example.com/webhook' }] },
  { id: 'search', category: 'intelligence', name: 'DeepWeb Uplink', desc: 'Real-time fact-checking and deep web intelligence gathering.', icon: <Search />, status: 'ACTIVE', bg: 'hover:border-purple-500/50', fields: [{ key: 'serperKey', label: 'API Key', type: 'password', placeholder: 'Enter API key' }] },
  { id: 'email', category: 'outreach', name: 'Neural Emailer', desc: 'Human-like follow-up orchestration via SendGrid Matrix.', icon: <Mail />, status: 'STANDBY', bg: 'hover:border-rose-500/50', fields: [{ key: 'sendgridKey', label: 'SendGrid Key', type: 'password', placeholder: 'SG....' }] },
  { id: 'database', category: 'intelligence', name: 'Postgres Synapse', desc: 'Direct neural connection to your enterprise data layers.', icon: <Database />, status: 'ACTIVE', bg: 'hover:border-zinc-500/50', fields: [{ key: 'dbUri', label: 'Connection URI', type: 'password', placeholder: 'postgresql://...' }] },
]

export default function ToolsMarketplaceUI() {
  const [activeTool, setActiveTool] = useState<any | null>(null)
  const [filter, setFilter] = useState('all')
  const [isSaving, setIsSaving] = useState(false)

  const filteredTools = toolsList.filter(t => filter === 'all' || t.category === filter)

  return (
    <div className="flex flex-col h-full space-y-8 max-w-6xl mx-auto p-4 lg:p-8">
      {/* Matrix Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#FEED01] font-bold text-[10px] uppercase tracking-[0.3em]">
            <Cpu className="w-4 h-4" />
            Neural Integration Hub
          </div>
          <h2 className="text-4xl font-sketch text-white tracking-tight">Uplink Marketplace</h2>
          <p className="text-sm text-zinc-500 font-sketch max-w-md">Equip your AI Agents with robust API synapses. Each module expands the autonomous capability of your node.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === cat.id ? 'bg-[#FEED01] text-black shadow-[0_0_15px_rgba(254,237,1,0.2)]' : 'text-zinc-500 hover:text-white'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, idx) => (
            <motion.div 
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveTool(tool)}
              className="group relative bg-zinc-900/40 border border-white/5 hover:border-[#FEED01]/30 rounded-[2rem] p-8 cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-[0_0_40px_rgba(254,237,1,0.05)]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FEED01] opacity-[0.02] blur-[50px] group-hover:opacity-[0.05] transition-opacity" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-zinc-950 border border-white/5 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 group-hover:border-[#FEED01]/50 transition-all duration-500 shadow-xl">
                    {React.cloneElement(tool.icon as React.ReactElement, { className: 'w-6 h-6 text-[#FEED01]' })}
                  </div>
                  <Badge className={`font-mono text-[9px] tracking-widest border-none ${tool.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    {tool.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-sketch text-white tracking-wide group-hover:text-[#FEED01] transition-colors">{tool.name}</h3>
                  <p className="text-xs text-zinc-500 font-sketch leading-relaxed line-clamp-2">{tool.desc}</p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-[#FEED01]" />
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">99.9% SLU</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FEED01] transition-all duration-500">
                    <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modular Config Overlay */}
      <AnimatePresence>
        {activeTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTool(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#09090b] border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FEED01] to-transparent opacity-50" />
              
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                    {React.cloneElement(activeTool.icon as React.ReactElement, { className: 'w-8 h-8 text-[#FEED01]' })}
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-sketch text-white tracking-tight">Configure {activeTool.name}</h3>
                    <p className="text-[9px] text-zinc-500 font-sketch uppercase tracking-widest mt-1">Uplink Protocol: Secure</p>
                  </div>
                </div>
                <button onClick={() => setActiveTool(null)} className="p-3 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 mb-10">
                {activeTool.fields.map((field: any) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3 text-[#FEED01]" />
                      {field.label}
                    </label>
                    <input 
                      type={field.type} 
                      placeholder={field.placeholder}
                      className="w-full bg-zinc-950/50 border border-white/5 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:outline-none focus:border-[#FEED01]/50 focus:bg-zinc-950 transition-all placeholder:text-zinc-700 shadow-inner"
                    />
                  </div>
                ))}
                
                <div className="p-4 bg-[#FEED01]/5 border border-[#FEED01]/10 rounded-2xl flex gap-4 items-center">
                  <Shield className="w-6 h-6 text-[#FEED01] flex-shrink-0" />
                  <p className="text-[9px] text-zinc-400 font-sketch leading-relaxed uppercase tracking-wider">Your credentials are encrypted via AES-256 and stored within the isolated Neural Vault. Access is restricted to agent runtime only.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-16 bg-[#FEED01] text-black font-black rounded-2xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(254,237,1,0.2)]"
                  onClick={() => {
                    setIsSaving(true)
                    setTimeout(() => { setIsSaving(false); setActiveTool(null); }, 1500)
                  }}
                >
                  {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "ESTABLISH UPLINK"}
                </Button>
                <p className="text-center text-[9px] text-zinc-600 font-mono tracking-widest uppercase mt-4">Node Identity: Local_Matrix_Pulse_01</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
