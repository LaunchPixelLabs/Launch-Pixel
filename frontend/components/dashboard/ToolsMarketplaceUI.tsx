'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Webhook, Calendar, Search, Mail, Command, Database, X, Check, Loader2 } from 'lucide-react'
import gsap from 'gsap'

const toolsList = [
  { id: 'calendar', name: 'Google Calendar', desc: 'Allow your agent to directly query and book meetings.', icon: <Calendar />, status: 'Connected', bg: 'hover:border-blue-500/50', fields: [] },
  { id: 'webhook', name: 'Custom Webhook', desc: 'Trigger external API endpoints dynamically mid-call.', icon: <Webhook />, status: 'Configure', bg: 'hover:border-emerald-500/50', fields: [{ key: 'url', label: 'Webhook URL', type: 'url', placeholder: 'https://api.example.com/webhook' }, { key: 'secret', label: 'Secret Key (Optional)', type: 'password', placeholder: 'whsec_...' }] },
  { id: 'search', name: 'Web Search', desc: 'Give your agent real-time web search capabilities for live facts.', icon: <Search />, status: 'Configure', bg: 'hover:border-purple-500/50', fields: [{ key: 'serperKey', label: 'Serper.dev API Key', type: 'password', placeholder: 'Enter API key' }] },
  { id: 'email', name: 'Email Sender', desc: 'Agent can automatically send follow-up emails via SendGrid.', icon: <Mail />, status: 'Configure', bg: 'hover:border-rose-500/50', fields: [{ key: 'sendgridKey', label: 'SendGrid API Key', type: 'password', placeholder: 'SG....' }, { key: 'fromEmail', label: 'From Email Address', type: 'email', placeholder: 'hello@yourcompany.com' }] },
  { id: 'database', name: 'Database Query', desc: 'Connect direct SQL queries for live inventory checks.', icon: <Database />, status: 'Coming Soon', bg: 'opacity-50 pointer-events-none hover:border-zinc-500/50', fields: [] },
]

export default function ToolsMarketplaceUI() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeTool, setActiveTool] = useState<any | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [configuredTools, setConfiguredTools] = useState<Record<string, boolean>>({ calendar: true })

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children
      gsap.fromTo(cards, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.1 }
      )
    }
  }, [])

  const handleConfigure = (tool: any) => {
    if (tool.status === 'Coming Soon') return
    setActiveTool(tool)
    setFormData({})
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'https://lp-calling-agent.dawn-smoke-87cb.workers.dev';
      const response = await fetch(`${apiUrl}/api/system-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'local_user', // Simulate for now
          service: activeTool.id,
          keyName: 'default',
          encryptedValue: JSON.stringify(formData) // Simple serialization for now
        })
      });
      if (!response.ok) throw new Error('Failed to save credentials');
      
      setConfiguredTools(prev => ({ ...prev, [activeTool.id]: true }))
      setActiveTool(null)
    } catch (e) {
      console.error(e);
      alert('Failed to save integration settings');
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Agent Execution Tools</h2>
          <p className="text-sm text-zinc-400">Equip your AI Agents with the APIs they need to take action mid-conversation.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-lg">
           <Command className="w-4 h-4 text-zinc-500"/>
           <input type="text" placeholder="Search tools..." className="bg-transparent border-none text-sm text-white focus:outline-none w-32" />
        </div>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsList.map(tool => {
          const isConnected = configuredTools[tool.id]
          return (
            <div 
              key={tool.id} 
              onClick={() => handleConfigure(tool)}
              className={`group bg-black/60 border ${isConnected ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/5'} rounded-2xl p-6 transition-all duration-300 cursor-pointer ${tool.bg}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                  {tool.icon}
                </div>
                {isConnected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-zinc-500 mb-6 h-10">{tool.desc}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : tool.status === 'Coming Soon' ? 'bg-zinc-800 text-zinc-500' : 'bg-white/10 text-white'}`}>
                  {isConnected ? 'Connected' : tool.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Configuration Modal */}
      {activeTool && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-white">
                  {activeTool.icon}
                </div>
                <h3 className="text-xl font-bold text-white">Configure {activeTool.name}</h3>
              </div>
              <button 
                onClick={() => setActiveTool(null)}
                className="p-1 text-zinc-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {activeTool.fields.length > 0 ? (
              <div className="space-y-4 mb-6">
                {activeTool.fields.map((field: any) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-sm font-medium text-zinc-300">{field.label}</label>
                    <input 
                      type={field.type} 
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--lp-accent)] transition-colors"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-400 text-center">
                This integration connects via OAuth. Click connect to authorize.
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setActiveTool(null)}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/5 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[var(--lp-accent)] text-black text-sm font-bold rounded-lg hover:opacity-90 transition flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isSaving ? 'Saving...' : configuredTools[activeTool.id] ? 'Update Config' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
