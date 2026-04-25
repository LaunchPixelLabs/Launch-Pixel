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
    <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-12 relative z-10">
      {/* Template Matrix (Collapsible) */}
      <div className="relative space-y-6">
        <div className="flex items-center justify-between px-4">
           <div className="space-y-1">
             <h3 className="text-[#FEED01] font-black uppercase text-[10px] tracking-[0.3em] opacity-40">Preset Neural Archetypes</h3>
             <p className="text-[12px] font-bold text-white uppercase tracking-widest leading-none">Select blueprint to initialize</p>
           </div>
           <button 
             onClick={() => setShowTemplates(!showTemplates)}
             className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-[#FEED01] transition-all flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 hover:border-[#FEED01]/20"
           >
             {showTemplates ? 'Compact Matrix' : 'Expand Archetypes'}
             <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
           </button>
        </div>

        <div className="flex items-center gap-6 px-4 overflow-x-auto no-scrollbar pb-6 pt-2">
           {presets.filter(p => p.key !== 'custom').map((preset) => (
             <div key={preset.key} className="flex flex-col items-center gap-3 group/icon">
               <button
                 onClick={() => !showTemplates && setShowTemplates(true)}
                 className={`flex-shrink-0 w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl transition-all border-2 ${
                   showTemplates 
                     ? 'bg-[#0d0d0f] border-[#FEED01]/40 shadow-[0_0_40px_rgba(254,237,1,0.15)] scale-105' 
                     : 'bg-[#0d0d0f] border-white/5 hover:border-[#FEED01] hover:scale-110'
                 }`}
               >
                 {preset.icon}
               </button>
               <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${showTemplates ? 'text-[#FEED01]' : 'text-zinc-600 group-hover/icon:text-zinc-400'}`}>
                 {preset.name}
               </span>
             </div>
           ))}
           <div className="w-px h-16 bg-white/5 mx-4" />
           <div className="flex flex-col items-center gap-3">
             <button 
               onClick={() => handleCreateFromPreset('custom')}
               className="flex-shrink-0 w-20 h-20 rounded-[2rem] bg-[#FEED01] text-black flex items-center justify-center hover:scale-110 transition-all shadow-[0_0_50px_rgba(254,237,1,0.3)] group"
             >
               <Plus className="w-10 h-10 stroke-[3px] group-hover:rotate-90 transition-transform" />
             </button>
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FEED01]">Custom</span>
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
              <div className="bg-[#0d0d0f]/60 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {(presets || []).filter(p => p && p.key !== 'custom').map((preset, idx) => (
                  <button
                    key={preset.key || idx}
                    onClick={() => handleCreateFromPreset(preset.key)}
                    disabled={isCreating}
                    className="group relative bg-black/40 border-2 border-white/5 p-8 rounded-[2.5rem] hover:border-[#FEED01]/40 transition-all text-left overflow-hidden shadow-xl flex flex-col min-h-[260px]"
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${preset.color} mb-6 shadow-2xl flex items-center justify-center text-3xl flex-shrink-0`}>
                        {preset.icon}
                      </div>
                      <h4 className="text-white font-black italic tracking-tighter text-xl mb-3 group-hover:text-[#FEED01] transition-colors uppercase">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed mb-8 opacity-60 group-hover:opacity-100">{preset.description}</p>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {(preset.enabledTools || []).slice(0, 3).map(t => (
                          <span key={t} className="text-[8px] px-2.5 py-1 rounded-lg bg-[#FEED01]/10 text-[#FEED01] border border-[#FEED01]/20 uppercase font-black tracking-widest">
                            {t.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-white/5 mx-4" />
      
      {/* Active Matrix Section */}
      <div className="space-y-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase flex items-center gap-6">
              My Agents
              <span className="px-5 py-1 rounded-2xl bg-[#FEED01] text-black text-[10px] md:text-xs font-black tracking-[0.3em] not-italic shadow-[0_0_30px_#FEED0150]">
                {(Array.isArray(agents) ? agents.length : 0)}
              </span>
            </h2>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] ml-1">
              Active Neural Nodes in Deployment
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-[#FEED01] transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="FILTER MATRIX..." 
              className="w-full bg-[#0d0d0f] border-2 border-white/5 rounded-2xl pl-14 pr-6 py-5 text-xs text-white font-black uppercase tracking-widest focus:outline-none focus:border-[#FEED01]/20 transition-all placeholder:text-zinc-800"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="w-16 h-16 border-2 border-[#FEED01]/20 border-t-[#FEED01] rounded-full animate-spin shadow-[0_0_30px_rgba(254,237,1,0.1)]" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Syncing with Node Matrix...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-[#0d0d0f]/40 border-2 border-dashed border-white/5 rounded-[3rem]">
            <Bot className="w-12 h-12 text-zinc-800 mb-6" />
            <h3 className="text-xl font-black italic text-white uppercase mb-2 tracking-tighter">Node Matrix Empty</h3>
            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest max-w-sm mx-auto mb-10">
              Initialize your first neural agent from the archetypes above.
            </p>
            <button 
              onClick={() => setShowTemplates(true)}
              className="px-12 py-5 bg-[#FEED01] text-black font-black italic tracking-tighter uppercase text-sm rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              Explore Archetypes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(filteredAgents || []).map((agent) => {
              if (!agent) return null;
              const roleConfig = (agent.role && ROLE_CONFIG[agent.role]) ? ROLE_CONFIG[agent.role] : ROLE_CONFIG.custom;
              const isLive = !!agent.elevenLabsAgentId;
              
              return (
                <div 
                  key={agent.id || Math.random()}
                  onClick={() => onAgentSelect(String(agent.id))}
                  className="group relative bg-[#0d0d0f] border border-white/5 p-8 rounded-[3rem] hover:border-[#FEED01]/30 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FEED01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 shadow-[0_0_15px_#10b981]' : 'bg-[#FEED01] shadow-[0_0_15px_#FEED01]'} animate-pulse`} />
                        <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${isLive ? 'text-emerald-400' : 'text-[#FEED01]'}`}>
                          {isLive ? 'Link Active' : 'Standby'}
                        </span>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(agent.id); }}
                        className="p-2.5 bg-white/5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-white/5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-3xl font-black italic tracking-tighter text-white mb-3 group-hover:text-[#FEED01] transition-colors truncate uppercase">
                      {agent.name}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${roleConfig.bg} ${roleConfig.color} uppercase tracking-[0.1em]`}>
                        {roleConfig.label}
                      </span>
                      {agent.assignedPhoneNumber && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-zinc-500 uppercase">
                          <Phone className="w-2.5 h-2.5" /> {agent.assignedPhoneNumber}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto space-y-6">
                      {/* Cognitive Load Tracker */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-600">
                          <span>Cognitive Load</span>
                          <span className="text-zinc-400">{isLive ? '42%' : '0%'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: isLive ? '42%' : '0%' }}
                            className="h-full bg-gradient-to-r from-[#FEED01] to-emerald-400"
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                        <div className="flex -space-x-3">
                          {(agent.enabledTools || []).slice(0, 4).map((t: any, i: number) => (
                            <div key={t?.toString() || i} className="w-8 h-8 rounded-xl bg-black border-2 border-[#0d0d0f] flex items-center justify-center text-[10px] text-zinc-400 font-black uppercase shadow-xl group-hover:border-[#FEED01]/30 transition-all">
                              {typeof t === 'string' && t.length > 0 ? t[0] : '?'}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:text-[#FEED01] transition-colors">
                          Uplink <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* DELETE CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0d0d0f] border border-white/10 p-10 rounded-[3rem] max-w-md w-full text-center space-y-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-[2rem] flex items-center justify-center mx-auto">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Terminate Node?</h3>
                <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                  This action will permanently purge the agent configuration and disconnect all synaptic links.
                </p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-4 bg-white/5 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                >
                  Terminate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
