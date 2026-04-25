'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MoreHorizontal, ArrowRight, Trash2, Phone, Loader2, ChevronDown, Sparkles } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Role config for badges & colors
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  receptionist:       { label: 'Synaptic Receptionist', color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  sales_closer:       { label: 'Growth Catalyst',       color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  appointment_setter: { label: 'Logic Orchestrator',   color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
  support:            { label: 'Matrix Resolver',      color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20' },
  survey:             { label: 'Data Harvester',       color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  custom:             { label: 'Custom Node',          color: 'text-zinc-400',   bg: 'bg-zinc-500/10 border-zinc-500/20' },
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
  const [showTemplates, setShowTemplates] = useState(true)
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
      { key: 'receptionist', name: 'AI Receptionist', role: 'receptionist', icon: '📞', color: 'from-orange-500 to-amber-400', description: 'Handles every inbound call with human-level warmth. Routes inquiries, captures messages...', enabledTools: ['book_meeting'] },
      { key: 'sales_closer', name: 'Sales Closer', role: 'sales_closer', icon: '🎯', color: 'from-blue-500 to-indigo-400', description: 'Your top-performing SDR that never sleeps. Qualifies leads, pitches with conviction...', enabledTools: ['book_meeting'] },
      { key: 'appointment_setter', name: 'Appointment Setter', role: 'appointment_setter', icon: '📅', color: 'from-rose-500 to-pink-400', description: 'Laser-focused qualification machine. Asks the right questions, scores leads...', enabledTools: ['book_meeting'] },
      { key: 'support', name: 'Customer Support', role: 'support', icon: '🛟', color: 'from-emerald-500 to-green-400', description: 'Enterprise-grade support agent that resolves 80% of tickets on the first call...', enabledTools: ['escalate_to_human'] },
      { key: 'debt_collector', name: 'Collections Agent', role: 'debt_collector', icon: '💰', color: 'from-amber-500 to-yellow-400', description: 'Compliant, professional collections agent that recovers outstanding payments...', enabledTools: ['send_email'] },
      { key: 'real_estate', name: 'Real Estate Agent', role: 'real_estate', icon: '🏠', color: 'from-teal-500 to-cyan-400', description: 'Virtual real estate assistant that qualifies buyers, schedules property viewings...', enabledTools: ['book_meeting'] },
      { key: 'survey', name: 'Survey & Feedback', role: 'survey', icon: '📊', color: 'from-purple-500 to-violet-400', description: 'Professional NPS & CSAT survey agent that collects actionable customer feedback...', enabledTools: ['notify_team'] },
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
        // Auto-select the new agent
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

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-6xl mx-auto space-y-8 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-2xl">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEED01]/5 blur-[100px] pointer-events-none" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h2 className="text-4xl font-sketch font-bold text-white tracking-tight flex items-center gap-3">
            Active Matrices
            <div className="px-3 py-1 rounded-full bg-[#FEED01]/10 border border-[#FEED01]/20 text-[#FEED01] text-[10px] font-mono tracking-[0.2em] uppercase">
              {agents.length} Nodes
            </div>
          </h2>
          <p className="text-sm font-sketch text-zinc-500 mt-2 max-w-md">
            Manage your autonomous synaptic agents. Each agent is persistent, in-memory, and ready for deployment across the Matrix.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 hover:border-[#FEED01]/50 text-white text-sm font-sketch font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#FEED01]" />
            Ingest Template
            <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
          <button 
            onClick={() => handleCreateFromPreset('custom')}
            disabled={isCreating}
            className="flex-1 md:flex-none px-8 py-3 bg-[#FEED01] text-black text-sm font-sketch font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(254,237,1,0.2)] disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Spawn Node
          </button>
        </div>
      </div>

      {/* Templates Carousel/Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10"
          >
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-white font-sketch font-bold text-xl mb-6">Template Repository</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {presets.filter(p => p.key !== 'custom').map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handleCreateFromPreset(preset.key)}
                    disabled={isCreating}
                    className="group relative bg-black/40 border-2 border-white/5 p-6 rounded-2xl hover:border-[#FEED01]/50 transition-all text-left overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${preset.color} mb-4 shadow-xl flex items-center justify-center text-xl`}>
                        {preset.icon}
                      </div>
                      <h4 className="text-white font-sketch font-bold text-base mb-2 group-hover:text-[#FEED01] transition-colors">{preset.name}</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-sketch line-clamp-3 mb-4">{preset.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {preset.enabledTools.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-[#FEED01]/5 text-[#FEED01]/60 border border-[#FEED01]/10 uppercase font-bold tracking-tighter">{t}</span>
                        ))}
                      </div>
                    </div>
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FEED01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 relative z-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#FEED01] transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Scan node repository..." 
            className="w-full bg-black/60 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white font-sketch focus:outline-none focus:border-[#FEED01]/30 transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>
      {/* Agents Matrix Grid */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-[#FEED01] animate-spin" />
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Accessing Synaptic Core...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-black/40 border-2 border-dashed border-white/5 rounded-[2rem]">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-zinc-700" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-sketch text-white mb-2">Node Sequence Empty</h3>
            <p className="text-zinc-500 font-sketch text-sm max-w-sm mx-auto mb-8">
              Initialize your first matrix node to begin autonomous operations. Use a template or spawn from scratch.
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
            {filteredAgents.map((agent) => {
              const roleConfig = ROLE_CONFIG[agent.role] || ROLE_CONFIG.custom
              const isLive = !!agent.elevenLabsAgentId
              
              return (
                <div 
                  key={agent.id}
                  onClick={() => onAgentSelect(String(agent.id))}
                  className="group relative bg-[#0c0c0e] border-2 border-white/5 p-6 rounded-[2rem] hover:border-[#FEED01]/50 transition-all cursor-pointer overflow-hidden shadow-2xl"
                >
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-amber-500 shadow-[0_0_15px_#f59e0b]'} animate-pulse`} />
                        <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${isLive ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {isLive ? 'Live Uplink' : 'Draft Matrix'}
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
                    
                    <div className="flex items-center gap-2 mb-6">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${roleConfig.bg} ${roleConfig.color} uppercase tracking-widest`}>
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
                        {(agent.enabledTools || []).slice(0, 3).map((t: string) => (
                          <div key={t} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#0c0c0e] flex items-center justify-center text-[8px] text-zinc-400 font-bold uppercase shadow-lg">
                            {t[0]}
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
