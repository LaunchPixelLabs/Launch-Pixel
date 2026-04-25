'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Loader2, Maximize2, Mic, SlidersHorizontal, ShieldAlert, Cpu, Globe, FileText, Type, FolderPlus, Sparkles, Phone } from 'lucide-react'
import SteeringCanvas from '../SteeringCanvas'
import KnowledgeBaseUI from './KnowledgeBaseUI'

interface AdvancedAgentUIProps {
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
  firstMessage: string;
  setFirstMessage: (v: string) => void;
  agentLanguage: string;
  onCanvasSave?: (state: { nodes: any[]; edges: any[]; enabledTools: string[] }) => void;
  canvasState?: { nodes: any[]; edges: any[] } | null;
  transferPhoneNumber?: string;
  setTransferPhoneNumber?: (v: string) => void;
  interruptible?: boolean;
  setInterruptible?: (v: boolean) => void;
  promptInjectionProtection?: boolean;
  setPromptInjectionProtection?: (v: boolean) => void;
  hallucinationGuard?: boolean;
  setHallucinationGuard?: (v: boolean) => void;
}

export default function AdvancedAgentUI({
  systemPrompt, setSystemPrompt,
  firstMessage, setFirstMessage,
  agentLanguage, setAgentLanguage,
  voiceId, setVoiceId,
  isLoading, onSave,
  onCanvasSave, canvasState,
  transferPhoneNumber, setTransferPhoneNumber,
  interruptible, setInterruptible,
  promptInjectionProtection, setPromptInjectionProtection,
  hallucinationGuard, setHallucinationGuard
}: AdvancedAgentUIProps) {
  
  const [innerTab, setInnerTab] = useState<'Agent' | 'Workflow' | 'Knowledge Base' | 'Settings'>('Agent')

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-2xl">
      {/* Horizontal Sub-Navigation */}
      <div className="flex px-4 pt-4 border-b border-white/10 overflow-x-auto no-scrollbar">
        {['Agent', 'Workflow', 'Knowledge Base', 'Settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setInnerTab(tab as any)}
            className={`px-6 py-3 text-sm font-semibold transition-all relative ${
              innerTab === tab ? "text-[var(--lp-accent)]" : "text-zinc-500 hover:text-white"
            }`}
          >
            {tab}
            {innerTab === tab && (
              <motion.div layoutId="agent-sub-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--lp-accent)]" />
            )}
          </button>
        ))}
      </div>

      {innerTab === 'Agent' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Column (Left) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8 no-scrollbar pr-4 border-r border-white/5">
            {/* System Prompt Section */}
            <div className="space-y-3 relative group">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white flex items-center gap-2"><Cpu className="w-4 h-4 text-zinc-400" /> System prompt</label>
                <button className="text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
              </div>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
                className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 focus:ring-1 focus:ring-white/30 resize-none font-mono"
              />
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-zinc-500">Type {'{{'}  to add variables</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Default personality</span>
                  <div className="w-8 h-4 bg-zinc-700 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-0 shadow-sm" /></div>
                </div>
              </div>
            </div>

            {/* First Message Section */}
            <div className="space-y-3 relative group">
               <label className="text-sm font-semibold text-white">First message</label>
               <p className="text-xs text-zinc-400">The first message the agent will say. If empty, it waits for the user.</p>
               <textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="Hello! How can I help you today?"
                className="w-full h-24 bg-black/20 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-white/30 focus:ring-1 focus:ring-white/30 resize-none font-mono"
              />
               <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-zinc-500">Type {'{{'}  to add variables</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Interruptible</span>
                  <div 
                    onClick={() => setInterruptible?.(!interruptible)}
                    className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${interruptible ? 'bg-[var(--lp-accent)]' : 'bg-zinc-700'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute shadow-sm transition-transform ${interruptible ? 'right-0' : 'left-0'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="w-80 bg-black/20 p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
            {/* Voices Card */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-white">Voices</label>
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition">
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>
              <p className="text-xs text-zinc-400">Select the ElevenLabs voices you want to use.</p>
              
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full mt-2 bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-[var(--lp-accent)] outline-none"
              >
                <option value="rachel">Rachel - Professional & Friendly</option>
                <option value="drew">Drew - Deep & Trustworthy</option>
                <option value="sarah">Sarah - Energetic Sales</option>
                <option value="josh">Josh - Calm Support</option>
                <option value="eric">Eric - Smooth Conversational</option>
              </select>
            </div>

            {/* Language Selection */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <label className="text-sm font-semibold text-white">Language</label>
              <p className="text-xs text-zinc-400">Choose the language the agent will communicate in.</p>
              <select
                value={agentLanguage}
                onChange={(e) => setAgentLanguage(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-[var(--lp-accent)] outline-none"
              >
                <option value="en">English (US)</option>
                <option value="es">Spanish</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="fr">French</option>
              </select>
            </div>

            {/* LLM Info */}
            <div className="space-y-3 pt-4 border-t border-white/10">
               <label className="text-sm font-semibold text-white">LLM</label>
               <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-3">
                 <Sparkles className="w-4 h-4 text-[var(--lp-accent)]" />
                 <div>
                   <p className="text-sm text-white font-medium">Powered by ElevenLabs</p>
                   <p className="text-xs text-zinc-500">Model is managed by ElevenLabs Conversational AI</p>
                 </div>
               </div>
            </div>

             {/* Save Button */}
             <div className="pt-6 mt-auto">
                <button
                  onClick={onSave}
                  disabled={isLoading}
                  className="w-full bg-[var(--lp-accent)] text-black font-semibold py-3 rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Agent Matrix
                </button>
            </div>
          </div>
        </div>
      )}

      {innerTab === 'Workflow' && (
        <div className="flex-1 p-6 h-[700px] flex flex-col">
          <div className="mb-4">
             <h2 className="text-xl font-bold text-white">Live Workflow Steering</h2>
             <p className="text-sm text-zinc-400">Map conversational logic flows via nodes. Add keyword triggers and connect them to tools like RAG, Calendar, and Transfer.</p>
          </div>
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-white/5 relative bg-black">
             <SteeringCanvas 
               onSave={onCanvasSave} 
               initialState={canvasState}
               isLoading={isLoading}
             />
          </div>
        </div>
      )}
      
      {innerTab === 'Knowledge Base' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <KnowledgeBaseUI />
        </div>
      )}
      
      {innerTab === 'Settings' && (
        <div className="p-8 space-y-8 overflow-y-auto">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-[var(--lp-accent)]"/> Agent Settings</h3>
          
          {/* Transfer Phone Number */}
          <div className="space-y-3 max-w-lg">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-400" />
              Call Transfer Number
            </label>
            <p className="text-xs text-zinc-400">When the AI agent transfers a call, it will forward to this number. Use E.164 format (e.g., +917122141889).</p>
            <input
              type="tel"
              value={transferPhoneNumber || ""}
              onChange={(e) => setTransferPhoneNumber?.(e.target.value)}
              placeholder="+917122141889"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-rose-400/50 focus:ring-1 focus:ring-rose-400/50 font-mono"
            />
          </div>

          {/* Security Section */}
          <div className="pt-6 border-t border-white/10 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-400" /> Security</h4>
            <p className="text-xs text-zinc-500 max-w-2xl">Lock down specific agent modalities to prevent prompt injection or hallucination bypasses.</p>
            <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl p-4 max-w-lg">
              <div>
                <p className="text-sm text-white font-medium">Prompt Injection Protection</p>
                <p className="text-xs text-zinc-500">Block attempts to override system prompt</p>
              </div>
              <div 
                onClick={() => setPromptInjectionProtection?.(!promptInjectionProtection)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${promptInjectionProtection ? 'bg-[var(--lp-accent)]' : 'bg-zinc-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-transform ${promptInjectionProtection ? 'right-0' : 'left-0'}`} />
              </div>
            </div>
            <div className="flex items-center justify-between bg-black/20 border border-white/10 rounded-xl p-4 max-w-lg">
              <div>
                <p className="text-sm text-white font-medium">Hallucination Guard</p>
                <p className="text-xs text-zinc-500">Force agent to only use knowledge base facts</p>
              </div>
              <div 
                onClick={() => setHallucinationGuard?.(!hallucinationGuard)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${hallucinationGuard ? 'bg-[var(--lp-accent)]' : 'bg-zinc-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-transform ${hallucinationGuard ? 'right-0' : 'left-0'}`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
