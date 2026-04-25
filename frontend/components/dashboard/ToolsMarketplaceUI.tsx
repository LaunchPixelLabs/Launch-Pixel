'use client'
import React, { useEffect, useRef } from 'react'
import { Webhook, Calendar, Search, Mail, Command, Database } from 'lucide-react'
import gsap from 'gsap'

const toolsList = [
  { id: 1, name: 'Google Calendar', desc: 'Allow your agent to directly query and book meetings.', icon: <Calendar />, status: 'Connected', bg: 'hover:border-blue-500/50' },
  { id: 2, name: 'Custom Webhook', desc: 'Trigger external API endpoints dynamically mid-call.', icon: <Webhook />, status: 'Configure', bg: 'hover:border-emerald-500/50' },
  { id: 3, name: 'Web Search', desc: 'Give your agent real-time web search capabilities for live facts.', icon: <Search />, status: 'Configure', bg: 'hover:border-purple-500/50' },
  { id: 4, name: 'Email Sender', desc: 'Agent can automatically send follow-up emails via SendGrid.', icon: <Mail />, status: 'Configure', bg: 'hover:border-rose-500/50' },
  { id: 5, name: 'Database Query', desc: 'Connect direct SQL queries for live inventory checks.', icon: <Database />, status: 'Coming Soon', bg: 'opacity-50 pointer-events-none hover:border-zinc-500/50' },
]

export default function ToolsMarketplaceUI() {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.children
      gsap.fromTo(cards, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.1 }
      )
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl">
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
        {toolsList.map(tool => (
          <div key={tool.id} className={`group bg-black/60 border border-white/5 rounded-2xl p-6 transition-all duration-300 cursor-pointer ${tool.bg}`}>
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors mb-4">
              {tool.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
            <p className="text-sm text-zinc-500 mb-6 h-10">{tool.desc}</p>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tool.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                {tool.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
