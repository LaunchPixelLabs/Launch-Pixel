'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Phone, ShieldAlert, Clock, Bell, Mic, Users, Zap } from 'lucide-react'

interface SettingsTabProps {
  transferPhoneNumber: string
  setTransferPhoneNumber: (v: string) => void
  promptInjectionProtection: boolean
  setPromptInjectionProtection: (v: boolean) => void
  hallucinationGuard: boolean
  setHallucinationGuard: (v: boolean) => void
}

export default function SettingsTab({
  transferPhoneNumber, setTransferPhoneNumber,
  promptInjectionProtection, setPromptInjectionProtection,
  hallucinationGuard, setHallucinationGuard
}: SettingsTabProps) {
  return (
    <div className="p-8 lg:p-12 space-y-10 overflow-y-auto no-scrollbar relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FEED01]/10 border border-[#FEED01]/20 flex items-center justify-center">
          <Settings className="w-6 h-6 text-[#FEED01]"/>
        </div>
        <div>
          <h3 className="text-2xl font-sketch font-bold text-white">Agent Configuration</h3>
          <p className="text-sm text-zinc-500 font-sketch">Fine-tune your agent's behavior, security, and operational parameters.</p>
        </div>
      </div>
      
      {/* Call Forwarding */}
      <div className="space-y-4 max-w-4xl bg-white/5 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Phone className="w-12 h-12 text-[#FEED01]" />
        </div>
        <label className="text-xs font-bold text-[#FEED01] uppercase tracking-[0.2em] flex items-center gap-2">
          <Phone className="w-3 h-3" /> Call Forwarding
        </label>
        <h4 className="text-lg font-sketch font-bold text-white">Human Handoff Number</h4>
        <p className="text-sm text-zinc-500 font-sketch leading-relaxed">
          When the agent can't handle a request or the customer asks for a human, calls will be forwarded to this number.
        </p>
        <div className="relative mt-4">
          <input
            type="tel"
            value={transferPhoneNumber || ""}
            onChange={(e) => setTransferPhoneNumber(e.target.value)}
            placeholder="+91 99999 99999"
            className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#FEED01]/50 outline-none font-mono transition-all"
          />
        </div>
      </div>

      {/* Operational Settings */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#FEED01]" />
          <h4 className="text-lg font-sketch font-bold text-white">Operational Settings</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Response Speed */}
          <SettingCard
            icon={<Clock className="w-5 h-5" />}
            title="Response Speed"
            description="Instant responses feel robotic. A 1-2s delay feels natural."
          >
            <select className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FEED01]/50 outline-none font-mono">
              <option value="instant">Instant (0ms)</option>
              <option value="natural" selected>Natural (1-2s)</option>
              <option value="thoughtful">Thoughtful (2-4s)</option>
            </select>
          </SettingCard>

          {/* Notification Preference */}
          <SettingCard
            icon={<Bell className="w-5 h-5" />}
            title="Admin Notifications"
            description="Get notified via WhatsApp when important events happen."
          >
            <select className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FEED01]/50 outline-none font-mono">
              <option value="all">All interactions</option>
              <option value="important" selected>Important only</option>
              <option value="none">None</option>
            </select>
          </SettingCard>

          {/* Call Recording */}
          <SettingCard
            icon={<Mic className="w-5 h-5" />}
            title="Call Recording"
            description="Record calls for quality assurance and training."
          >
            <ToggleSwitch defaultOn={true} />
          </SettingCard>

          {/* Max Concurrent */}
          <SettingCard
            icon={<Users className="w-5 h-5" />}
            title="Concurrent Sessions"
            description="Maximum simultaneous conversations the agent handles."
          >
            <select className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#FEED01]/50 outline-none font-mono">
              <option value="5">5 sessions</option>
              <option value="10" selected>10 sessions</option>
              <option value="25">25 sessions</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </SettingCard>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h4 className="text-lg font-sketch font-bold text-white">Security & Integrity</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-[#FEED01]/20 transition-all group">
            <div className="space-y-1">
              <p className="text-sm text-white font-sketch font-bold">Injection Shield</p>
              <p className="text-[10px] text-zinc-500 font-sketch">Blocks prompt-override attacks from malicious users.</p>
            </div>
            <div 
              onClick={() => setPromptInjectionProtection(!promptInjectionProtection)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${promptInjectionProtection ? 'bg-[#FEED01]' : 'bg-zinc-800'}`}
            >
              <motion.div 
                animate={{ x: promptInjectionProtection ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full absolute shadow-lg" 
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-[#FEED01]/20 transition-all group">
            <div className="space-y-1">
              <p className="text-sm text-white font-sketch font-bold">Hallucination Guard</p>
              <p className="text-[10px] text-zinc-500 font-sketch">Forces agent to only respond from verified knowledge base.</p>
            </div>
            <div 
              onClick={() => setHallucinationGuard(!hallucinationGuard)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${hallucinationGuard ? 'bg-[#FEED01]' : 'bg-zinc-800'}`}
            >
              <motion.div 
                animate={{ x: hallucinationGuard ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full absolute shadow-lg" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingCard({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-[#FEED01]/20 transition-all space-y-4">
      <div className="flex items-center gap-3 text-[#FEED01]">
        {icon}
        <p className="text-sm text-white font-sketch font-bold">{title}</p>
      </div>
      <p className="text-[10px] text-zinc-500 font-sketch leading-relaxed">{description}</p>
      {children}
    </div>
  )
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = React.useState(defaultOn)
  return (
    <div 
      onClick={() => setOn(!on)}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${on ? 'bg-[#FEED01]' : 'bg-zinc-800'}`}
    >
      <motion.div 
        animate={{ x: on ? 24 : 0 }}
        className="w-6 h-6 bg-white rounded-full absolute shadow-lg" 
      />
    </div>
  )
}
