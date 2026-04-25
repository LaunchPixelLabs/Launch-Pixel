'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, MoreHorizontal, ArrowRight, Trash2, Phone, Loader2, ChevronDown, Sparkles } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Role config for badges & colors
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  receptionist:       { label: 'Receptionist',       color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  sales_closer:       { label: 'Sales Closer',       color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  appointment_setter: { label: 'Appointment Setter', color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20' },
  support:            { label: 'Customer Support',   color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/20' },
  survey:             { label: 'Survey Agent',       color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  custom:             { label: 'Custom',             color: 'text-zinc-400',   bg: 'bg-zinc-500/10 border-zinc-500/20' },
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Agents</h2>
          <p className="text-sm text-zinc-500 mt-1">{agents.length} agent{agents.length !== 1 ? 's' : ''} configured</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-xl transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[var(--lp-accent)]" />
            Browse templates
            <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
          <button 
            onClick={() => handleCreateFromPreset('custom')}
            disabled={isCreating}
            className="px-4 py-2 bg-[var(--lp-accent)] text-black text-sm font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition shadow-[0_0_15px_rgba(249,115,22,0.3)] disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New agent
          </button>
        </div>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">Get started with a template</h3>
                  <p className="text-sm text-zinc-400">Pick a role and your agent is ready in 10 seconds. You can customize everything later.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presets.filter(p => p.key !== 'custom').map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handleCreateFromPreset(preset.key)}
                    disabled={isCreating}
                    className="bg-black border border-white/5 p-5 rounded-xl hover:border-white/20 transition cursor-pointer group text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-tr ${preset.color} shadow-lg`} />
                      <span className="font-semibold text-white text-sm">{preset.name}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition">{preset.description}</p>
                    {preset.enabledTools.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {preset.enabledTools.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-400 uppercase font-bold">{t}</span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agents List */}
      <div className="space-y-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents..." 
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/10">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Phone</div>
          <div className="col-span-2">Tools</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAgents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-white font-bold mb-2">No agents yet</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-sm">
              Create your first AI agent by picking a template above, or start from scratch with a custom agent.
            </p>
            <button 
              onClick={() => setShowTemplates(true)}
              className="px-6 py-3 bg-[var(--lp-accent)] text-black font-bold rounded-xl hover:opacity-90 transition"
            >
              Browse Templates
            </button>
          </div>
        )}

        {/* Agent Rows */}
        {filteredAgents.map((agent) => {
          const roleConfig = ROLE_CONFIG[agent.role] || ROLE_CONFIG.custom
          return (
            <div 
              key={agent.id} 
              className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-white hover:bg-white/5 rounded-xl cursor-pointer transition border border-transparent hover:border-white/10 items-center group"
            >
              <div 
                className="col-span-4 flex items-center gap-3" 
                onClick={() => onAgentSelect(String(agent.id))}
              >
                <div className={`w-2 h-2 rounded-full ${agent.elevenLabsAgentId ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                <span className="truncate">{agent.name}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleConfig.bg} ${roleConfig.color}`}>
                  {roleConfig.label}
                </span>
              </div>
              <div className="col-span-2 text-zinc-400 text-xs">
                {agent.assignedPhoneNumber ? (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {agent.assignedPhoneNumber}</span>
                ) : (
                  <span className="text-zinc-600">No number</span>
                )}
              </div>
              <div className="col-span-2">
                <div className="flex gap-1">
                  {(agent.enabledTools || []).map((t: string) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--lp-accent)]/10 text-[var(--lp-accent)] font-bold uppercase">{t}</span>
                  ))}
                  {(!agent.enabledTools || agent.enabledTools.length === 0) && (
                    <span className="text-[10px] text-zinc-600">—</span>
                  )}
                </div>
              </div>
              <div className="col-span-2 text-right flex items-center justify-end gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onAgentSelect(String(agent.id)); }}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded transition"
                >
                  Configure <ArrowRight className="w-3 h-3 inline" />
                </button>
                {deleteConfirm === agent.id ? (
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(agent.id); }}
                      className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30 transition"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                      className="text-xs text-zinc-500 px-2 py-1 rounded hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(agent.id); }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
