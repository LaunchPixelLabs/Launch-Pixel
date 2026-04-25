'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MoreHorizontal, ArrowRight, Trash2, Phone, Loader2, ChevronDown, Sparkles, Bot } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Role config for badges & colors
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  receptionist:       { label: 'Receptionist',     color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  sales_closer:       { label: 'Sales Agent',      color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  appointment_setter: { label: 'Booking Agent',    color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
  support:            { label: 'Support Agent',    color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20' },
  survey:             { label: 'Survey Agent',     color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  custom:             { label: 'Custom Agent',     color: 'text-zinc-400',   bg: 'bg-zinc-500/10 border-zinc-500/20' },
}

interface Preset {
  key: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
  enabledTools: string[];
}

interface Agent {
  id: number;
  name: string;
  role: string;
  agentType: string;
  assignedPhoneNumber?: string;
  elevenLabsAgentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  enabledTools: string[];
}

interface AgentListViewProps {
  onAgentSelect: (agentId: string) => void;
  currentUser: any;
}

export default function AgentListView({ onAgentSelect, currentUser }: AgentListViewProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [presets, setPresets] = useState<Preset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const getAuthHeaders = useCallback(async () => {
    if (!currentUser) return {}
    try {
      const token = await currentUser.getIdToken()
      return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    } catch { return {} }
  }, [currentUser])

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    if (!currentUser?.uid) return
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/agent-configurations?userId=${currentUser.uid}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setAgents(data.configurations || [])
      }
    } catch (e) {
      console.error('Failed to fetch agents:', e)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser, getAuthHeaders])

  // Fetch presets
  const fetchPresets = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agent-configurations/presets`)
      if (res.ok) {
        const data = await res.json()
        if (data.presets && data.presets.length > 0) {
          setPresets(data.presets)
          return
        }
      }
    } catch { /* ignore */ }
    
    // Fallback if backend fails or doesn't return presets
    setPresets([
      { key: 'receptionist', name: 'Receptionist', role: 'receptionist', icon: '📞', color: 'from-orange-500 to-amber-400', description: 'Handles every inbound call with human-level warmth. Routes inquiries, captures messages, and ensures no lead is left behind.', enabledTools: ['book_meeting'] },
      { key: 'sales_closer', name: 'Sales Closer', role: 'sales_closer', icon: '🎯', color: 'from-blue-500 to-indigo-400', description: 'Your top-performing SDR that never sleeps. Qualifies leads, pitches with conviction, and closes deals on the first call.', enabledTools: ['book_meeting'] },
      { key: 'appointment_setter', name: 'Booking Agent', role: 'appointment_setter', icon: '📅', color: 'from-rose-500 to-pink-400', description: 'Laser-focused qualification machine. Asks the right questions and secures high-value meetings for your team.', enabledTools: ['book_meeting'] },
      { key: 'support', name: 'Customer Support', role: 'support', icon: '🛟', color: 'from-emerald-500 to-green-400', description: 'Enterprise-grade support agent that resolves queries on the first call using your custom knowledge base.', enabledTools: ['escalate_to_human'] },
      { key: 'debt_collector', name: 'Recovery Agent', role: 'debt_collector', icon: '💰', color: 'from-amber-500 to-yellow-400', description: 'Professional, results-oriented agent specialized in recovering outstanding payments and managing accounts.', enabledTools: ['send_email'] },
      { key: 'real_estate', name: 'Real Estate Pro', role: 'real_estate', icon: '🏠', color: 'from-teal-500 to-cyan-400', description: 'Virtual real estate assistant that qualifies buyers, schedules property viewings, and manages listings.', enabledTools: ['book_meeting'] },
      { key: 'survey', name: 'Market Intelligence', role: 'survey', icon: '📊', color: 'from-purple-500 to-violet-400', description: 'Collects actionable customer feedback, conducts NPS surveys, and generates high-level market reports.', enabledTools: ['notify_team'] },
      { key: 'whatsapp_pro', name: 'WhatsApp Pro', role: 'sales_closer', icon: '💬', color: 'from-green-500 to-emerald-400', description: 'Optimized for high-conversion WhatsApp outreach and intelligent lead closing via direct messaging.', enabledTools: ['book_meeting', 'notify_team'] },
      { key: 'custom', name: 'Custom Agent', role: 'custom', icon: '🤖', color: 'from-zinc-500 to-zinc-400', description: 'Build your own AI agent from scratch.', enabledTools: [] }
    ])
  }, [])

  useEffect(() => { fetchAgents(); fetchPresets(); }, [fetchAgents, fetchPresets])

  // Create from preset
  const handleCreateFromPreset = async (presetKey: string) => {
    if (!currentUser?.uid) return
    setIsCreating(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/agent-configurations/from-preset`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: currentUser.uid, presetKey }),
      })
      if (res.ok) {
        const data = await res.json()
        await fetchAgents()
        setShowTemplates(false)
        if (data.configuration?.id) {
          onAgentSelect(String(data.configuration.id))
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed to create agent: ${errorData.error || res.statusText}`);
      }
    } catch (e: any) {
      console.error('Failed to create agent:', e)
      alert(`Network error: Could not create agent. ${e.message}`);
    } finally {
      setIsCreating(false)
    }
  }

  // Delete agent
  const handleDelete = async (agentId: number) => {
    try {
      const headers = await getAuthHeaders()
      await fetch(`${API_BASE}/api/agent-configurations/${agentId}?userId=${currentUser.uid}`, {
        method: 'DELETE',
        headers,
      })
      setAgents(prev => prev.filter(a => a.id !== agentId))
      setDeleteConfirm(null)
    } catch (e) {
      console.error('Failed to delete agent:', e)
    }
  }

  const filteredAgents = (Array.isArray(agents) ? agents : []).filter(a => {
    if (!a) return false;
    const nameMatch = (a.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const roleMatch = (a.role || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    return nameMatch || roleMatch;
  });


  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6 bg-black/20 border border-white/5 rounded-[2rem] backdrop-blur-3xl relative shadow-2xl">
      {/* TEMPLATE STRIP (Collapsible) */}
      <div className="relative z-20 space-y-4">
        <div className="flex items-center justify-between px-4">
           <div className="flex flex-col">
             <h3 className="text-white font-sketch font-black uppercase text-xs tracking-[0.2em] opacity-30 mb-1">Blueprints</h3>
             <p className="text-[10px] font-sketch text-zinc-600 uppercase tracking-widest leading-none">Powerful conversion agents for any task</p>
           </div>
           <button 
             onClick={() => setShowTemplates(!showTemplates)}
             className="text-[10px] font-black uppercase tracking-widest text-[#FEED01] hover:text-white transition-colors flex items-center gap-2 bg-[#FEED01]/5 px-4 py-2 rounded-xl border border-[#FEED01]/10"
           >
             {showTemplates ? 'Collapse Gallery' : 'Browse Blueprints'}
             <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
           </button>
        </div>

        <div className="flex items-center gap-4 px-4 overflow-x-auto no-scrollbar pb-4 pt-2">
           {presets.filter(p => p.key !== 'custom').map((preset) => (
             <div key={preset.key} className="flex flex-col items-center gap-2 group/icon">
               <button
                 onClick={() => {
                   if (!showTemplates) {
                     setShowTemplates(true);
                   }
                 }}
                 className={`flex-shrink-0 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl transition-all border-2 ${
                   showTemplates 
                     ? 'bg-zinc-900 border-[#FEED01]/60 shadow-[0_0_25px_rgba(254,237,1,0.2)] scale-105' 
                     : 'bg-[#0a0a0c] border-white/5 hover:border-[#FEED01] hover:scale-110 shadow-xl'
                 }`}
               >
                 {preset.icon}
               </button>
               <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-colors ${showTemplates ? 'text-[#FEED01]' : 'text-zinc-600 group-hover/icon:text-zinc-400'}`}>
                 {preset.name.split(' ')[0]}
               </span>
             </div>
           ))}
           <div className="w-px h-12 bg-white/5 mx-2" />
           <div className="flex flex-col items-center gap-2">
             <button 
               onClick={() => handleCreateFromPreset('custom')}
               className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-[#FEED01] text-black flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_30px_rgba(254,237,1,0.4)]"
             >
               <Plus className="w-8 h-8 stroke-[3px]" />
             </button>
             <span className="text-[8px] font-black uppercase tracking-[0.1em] text-[#FEED01]">Custom</span>
           </div>
        </div>

        <AnimatePresence>
          {showTemplates && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-zinc-900/40 border-2 border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(presets || []).filter(p => p && p.key !== 'custom').map((preset, idx) => (
                  <button
                    key={preset.key || idx}
                    onClick={() => handleCreateFromPreset(preset.key)}
                    disabled={isCreating}
                    className="group relative bg-black/60 border-2 border-white/5 p-6 rounded-3xl hover:border-[#FEED01] transition-all text-left overflow-hidden shadow-xl flex flex-col min-h-[220px]"
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${preset.color} mb-4 shadow-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                        {preset.icon}
                      </div>
                      <h4 className="text-white font-sketch font-black text-lg mb-2 group-hover:text-[#FEED01] transition-colors uppercase tracking-tight leading-tight">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-sketch line-clamp-3 mb-6 opacity-70 group-hover:opacity-100">{preset.description}</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {(preset.enabledTools || []).slice(0, 3).map(t => (
                          <span key={t} className="text-[8px] px-2 py-0.5 rounded-lg bg-[#FEED01]/10 text-[#FEED01] border border-[#FEED01]/20 uppercase font-black tracking-tighter break-all leading-tight max-w-full">
                            {t.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FEED01]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-white/5 relative z-10 mx-4" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 pt-4 px-4">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-5xl font-sketch font-black text-white tracking-tighter flex flex-wrap items-center gap-4 uppercase italic">
            My Agents
            <span className="px-4 py-1 rounded-2xl bg-[#FEED01] text-black text-[10px] md:text-xs font-black tracking-[0.2em] not-italic shadow-lg">
              {(Array.isArray(agents) ? agents.length : 0)}
            </span>
          </h2>
          <p className="text-[10px] md:text-xs font-sketch text-zinc-500 max-w-md uppercase tracking-widest opacity-60">
            Deploy once. Show up everywhere.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#FEED01] transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your agents..." 
            className="w-full bg-black/40 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white font-sketch focus:outline-none focus:border-[#FEED01]/20 transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>
      {/* Agents Matrix Grid */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 text-[#FEED01] animate-spin opacity-50" />
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Loading agents...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-black/20 border-2 border-dashed border-white/5 rounded-[2rem]">
            <h3 className="text-2xl font-sketch text-white mb-2">No Agents Yet</h3>
            <p className="text-zinc-500 font-sketch text-sm max-w-sm mx-auto mb-8">
              Start by choosing a template or creating a custom agent.
            </p>
            <button 
              onClick={() => setShowTemplates(true)}
              className="px-10 py-4 bg-[#FEED01]/10 border border-[#FEED01]/30 text-[#FEED01] font-sketch font-bold rounded-2xl hover:bg-[#FEED01] hover:text-black transition-all"
            >
              Explore Templates
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(filteredAgents || []).map((agent) => {
              if (!agent) return null;
              const roleConfig = (agent.role && ROLE_CONFIG[agent.role]) ? ROLE_CONFIG[agent.role] : ROLE_CONFIG.custom;
              const isLive = !!agent.elevenLabsAgentId;
              
              return (
                <div 
                  key={agent.id || Math.random()}
                  onClick={() => onAgentSelect(String(agent.id))}
                  className="group relative bg-[#0c0c0e] border-2 border-white/5 p-6 rounded-[2rem] hover:border-[#FEED01]/50 transition-all cursor-pointer overflow-hidden shadow-2xl"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]'} animate-pulse`} />
                        <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase whitespace-nowrap ${isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {isLive ? 'Live' : 'Draft'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {deleteConfirm === agent.id ? (
                           <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                             <button 
                               onClick={() => handleDelete(agent.id)}
                               className="px-2 py-1 bg-red-500/20 text-red-400 text-[10px] font-bold rounded hover:bg-red-500 hover:text-white transition-all"
                             >
                               Confirm
                             </button>
                             <button 
                               onClick={() => setDeleteConfirm(null)}
                               className="px-2 py-1 bg-white/5 text-zinc-500 text-[10px] font-bold rounded hover:text-white transition-all"
                             >
                               No
                             </button>
                           </div>
                        ) : (
                           <button 
                             onClick={(e) => { e.stopPropagation(); setDeleteConfirm(agent.id); }}
                             className="p-2 bg-white/5 text-zinc-600 hover:text-red-400 rounded-lg transition-all"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-2xl font-sketch font-bold text-white mb-2 group-hover:text-[#FEED01] transition-colors truncate">
                      {agent.name}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${roleConfig.bg} ${roleConfig.color} uppercase tracking-widest whitespace-nowrap`}>
                        {roleConfig.label}
                      </span>
                      {agent.assignedPhoneNumber && (
                        <span className="text-[9px] font-mono text-zinc-500 uppercase flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {agent.assignedPhoneNumber}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {(agent.enabledTools || []).slice(0, 3).map((t: any, i: number) => (
                          <div key={t?.toString() || i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#0c0c0e] flex items-center justify-center text-[8px] text-zinc-400 font-bold uppercase shadow-lg">
                            {typeof t === 'string' && t.length > 0 ? t[0] : '?'}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-sketch font-bold text-white group-hover:text-[#FEED01] flex items-center gap-1 transition-colors">
                        Configure <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
