import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Globe, Smartphone, Save, Loader2, ChevronDown, Sparkles } from 'lucide-react'

interface AgentConfigTabProps {
  systemPrompt: string
  setSystemPrompt: (v: string) => void
  firstMessage: string
  setFirstMessage: (v: string) => void
  steeringInstructions: string
  setSteeringInstructions: (v: string) => void
  voiceId: string
  setVoiceId: (v: string) => void
  agentLanguage: string
  setAgentLanguage: (v: string) => void
  adminWhatsAppNumber: string
  setAdminWhatsAppNumber: (v: string) => void
  interruptible: boolean
  setInterruptible: (v: boolean) => void
  isLoading: boolean
  onSave: () => void
}

export default function AgentConfigTab({
  systemPrompt, setSystemPrompt,
  firstMessage, setFirstMessage,
  steeringInstructions, setSteeringInstructions,
  voiceId, setVoiceId,
  agentLanguage, setAgentLanguage,
  adminWhatsAppNumber, setAdminWhatsAppNumber,
  interruptible, setInterruptible,
  isLoading, onSave
}: AgentConfigTabProps) {
  // Local state for peak performance during typing
  const [localPrompt, setLocalPrompt] = useState(systemPrompt)
  const [localFirst, setLocalFirst] = useState(firstMessage)
  const [localSteering, setLocalSteering] = useState(steeringInstructions)

  useEffect(() => { setLocalPrompt(systemPrompt) }, [systemPrompt])
  useEffect(() => { setLocalFirst(firstMessage) }, [firstMessage])
  useEffect(() => { setLocalSteering(steeringInstructions) }, [steeringInstructions])

  return (
    <div className="flex flex-1 overflow-hidden relative z-10 flex-col lg:flex-row min-h-0">
      {/* Main Content Column (Left) */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-12 no-scrollbar border-r border-white/5 relative z-10">
        {/* System Prompt Section */}
        <div className="space-y-4 relative group">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-[#FEED01] uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FEED01] animate-pulse" />
              Synaptic Core Instructions
            </label>
            <div className="px-3 py-1 rounded bg-black/40 border border-white/5 text-[9px] text-zinc-500 font-mono tracking-[0.1em] uppercase">
              Brain: Claude-3.5-Sonnet
            </div>
          </div>
          <div className="relative">
            <textarea
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              onBlur={() => setSystemPrompt(localPrompt)}
              placeholder="Define the core intelligence of your agent..."
              className="w-full h-80 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-[#FEED01]/50 focus:ring-1 focus:ring-[#FEED01]/30 resize-none font-mono transition-all backdrop-blur-xl leading-relaxed outline-none"
            />
          </div>
        </div>

        {/* First Message Section */}
        <div className="space-y-4 relative group">
          <label className="text-[10px] font-bold text-[#FEED01] uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FEED01] animate-pulse" />
            Initial Synaptic Trigger
          </label>
          <div className="relative">
            <textarea
              value={localFirst}
              onChange={(e) => setLocalFirst(e.target.value)}
              onBlur={() => setFirstMessage(localFirst)}
              placeholder="The first greeting sent by the agent..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-[#FEED01]/50 focus:ring-1 focus:ring-[#FEED01]/30 resize-none font-mono transition-all backdrop-blur-xl outline-none"
            />
          </div>
        </div>

        {/* Steering Instructions */}
        <div className="space-y-4 relative group">
          <label className="text-[10px] font-bold text-[#FEED01] uppercase tracking-[0.2em] flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FEED01] animate-pulse" />
            Global Steering Documents
          </label>
          <div className="relative">
            <textarea
              value={localSteering}
              onChange={(e) => setLocalSteering(e.target.value)}
              onBlur={() => setSteeringInstructions(localSteering)}
              placeholder="Provide high-level context and rules for keyword triggers..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-[#FEED01]/50 focus:ring-1 focus:ring-[#FEED01]/30 resize-none font-mono transition-all backdrop-blur-xl outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sticky Sidebar (Right) */}
      <div className="w-full lg:w-[400px] bg-black/40 p-6 lg:p-10 flex flex-col gap-10 overflow-y-auto no-scrollbar border-t lg:border-t-0 lg:border-l border-white/5 relative">
        {/* Voices Card */}
        <div className="space-y-4 relative z-10">
          <label className="text-xs font-bold text-white uppercase tracking-widest">Acoustic Matrix</label>
          <div className="relative">
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[#FEED01]/50 outline-none appearance-none font-sketch cursor-pointer"
            >
              <option value="rachel">Rachel - Professional & Friendly</option>
              <option value="drew">Drew - Deep & Trustworthy</option>
              <option value="sarah">Sarah - Energetic Sales</option>
              <option value="josh">Josh - Calm Support</option>
              <option value="eric">Eric - Smooth Conversational</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-4 pt-8 border-t border-white/5 relative z-10">
          <label className="text-xs font-bold text-white uppercase tracking-widest">Linguistic Core</label>
          <div className="relative">
            <select
              value={agentLanguage}
              onChange={(e) => setAgentLanguage(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[#FEED01]/50 outline-none appearance-none font-sketch cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="es">Spanish</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="fr">French</option>
            </select>
            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
          </div>
        </div>

        {/* Interruptible Toggle */}
        <div className="space-y-4 pt-8 border-t border-white/5 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-widest">Allow Interruptions</span>
            <div 
              onClick={() => setInterruptible(!interruptible)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${interruptible ? 'bg-[#FEED01]' : 'bg-zinc-800'}`}
            >
              <motion.div 
                animate={{ x: interruptible ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full absolute shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Admin Uplink */}
        <div className="space-y-4 pt-8 border-t border-white/5 relative z-10">
          <label className="text-xs font-bold text-white uppercase tracking-widest">Admin Uplink</label>
          <input
            type="text"
            value={adminWhatsAppNumber}
            onChange={(e) => setAdminWhatsAppNumber(e.target.value)}
            placeholder="+91 99999 99999"
            className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-[#FEED01]/50 outline-none font-sketch"
          />
        </div>

        {/* Save Button */}
        <div className="pt-8 mt-auto relative z-10">
          <button
            onClick={() => {
              // Ensure everything is synced before save
              setSystemPrompt(localPrompt)
              setFirstMessage(localFirst)
              setSteeringInstructions(localSteering)
              onSave()
            }}
            disabled={isLoading}
            className="w-full bg-[#FEED01] text-black font-sketch font-bold py-4 rounded-2xl flex justify-center items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(254,237,1,0.2)]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Synchronize Matrix
          </button>
        </div>
      </div>
    </div>
  )
}
