'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Save, Loader2, Maximize2, Mic, SlidersHorizontal, ShieldAlert, Cpu, Globe, FileText, Type, FolderPlus, Sparkles, Phone } from 'lucide-react'
import SteeringCanvas from '../SteeringCanvas'
import KnowledgeBaseUI from './KnowledgeBaseUI'
import WhatsAppConfigUI from './WhatsAppConfigUI'

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
  workerBase?: string;
  apiBase?: string;
  getAuthHeaders?: () => Promise<Record<string, string>>;
  userId?: string;
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
  hallucinationGuard, setHallucinationGuard,
  workerBase, apiBase, getAuthHeaders, userId
}: AdvancedAgentUIProps) {
  
  const [innerTab, setInnerTab] = useState<'Agent' | 'Workflow' | 'Knowledge Base' | 'Communication' | 'Settings'>('Agent')
  return (
    <div className="flex flex-col h-full bg-[#08080a] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-2xl relative shadow-2xl">

      {/* Matrix Background Effect (Only in Sketch Matrix Mode) */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--lp-matrix-glow),transparent_70%)]" />
          <div className="matrix-rain-effect opacity-30" />
        </motion.div>
      </AnimatePresence>

      {/* Horizontal Sub-Navigation */}
      <div className="flex px-4 pt-4 border-b border-white/10 overflow-x-auto no-scrollbar relative z-10">
        {['Agent', 'Workflow', 'Knowledge Base', 'Communication', 'Settings', 'Billing & API'].map(tab => (
          <button
            key={tab}
            onClick={() => setInnerTab(tab as any)}
            className={`px-6 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
              innerTab === tab ? "text-white" : "text-zinc-500 hover:text-white"
            }`}
          >
            {tab}
            {innerTab === tab && (
              <motion.div 
                layoutId="agent-sub-tab" 
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--lp-accent)] shadow-[0_0_10px_var(--lp-accent)]" 
              />
            )}
          </button>
        ))}
      </div>

      {innerTab === 'Agent' && (
        <div className="flex flex-1 overflow-hidden relative z-10 flex-col lg:flex-row">
          {/* Main Content Column (Left) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8 no-scrollbar pr-4 border-r border-white/5 relative z-10">
            {/* System Prompt Section */}
            <div className="space-y-3 relative group">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Cpu className="w-4 h-4" /> System Core Instructions</label>
                <button className="text-zinc-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Maximize2 className="w-4 h-4" /></button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--lp-accent)]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define the agent's personality and rules..."
                  className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[var(--lp-accent)]/50 focus:ring-1 focus:ring-[var(--lp-accent)]/30 resize-none font-mono transition-all backdrop-blur-md"
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-zinc-600 font-medium">Variable injection supported via {'{{key}}'}</span>
              </div>
            </div>

            {/* First Message Section */}
            <div className="space-y-3 relative group">
               <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Initial Salutation</label>
               <div className="relative">
                 <textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Enter the first thing the agent says..."
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-[var(--lp-accent)]/50 focus:ring-1 focus:ring-[var(--lp-accent)]/30 resize-none font-mono transition-all backdrop-blur-md"
                />
               </div>
               <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setInterruptible?.(!interruptible)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${interruptible ? 'bg-[var(--lp-accent)]' : 'bg-zinc-800'}`}
                  >
                    <motion.div 
                      animate={{ x: interruptible ? 20 : 0 }}
                      className="w-5 h-5 bg-white rounded-full absolute shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                    />
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">Barge-in / Interruptible</span>
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
               <label className="text-sm font-semibold text-white">Execution Engine</label>
               <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-3">
                 <div className="flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-[var(--lp-accent)]" />
                   <p className="text-sm text-white font-medium">Sketch Matrix Mode</p>
                 </div>
                 <div className="w-8 h-4 bg-[var(--lp-accent)] rounded-full relative cursor-pointer">
                   <div className="w-4 h-4 bg-white rounded-full absolute right-0 shadow-sm" />
                 </div>
               </div>
               <p className="text-[10px] text-zinc-500">Enables full CanvasX Sketch tool ecosystem and multi-step reasoning.</p>
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
          <KnowledgeBaseUI 
            userId={userId}
            workerBase={workerBase}
            getAuthHeaders={getAuthHeaders}
          />
        </div>
      )}

      {innerTab === 'Communication' && (
        <div className="flex-1 p-6 overflow-y-auto">
          <WhatsAppConfigUI 
            userId={userId}
            apiBase={apiBase}
          />
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
      {innerTab === 'Billing & API' as any && (
        <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Billing & API Matrix</h3>
              <p className="text-sm text-zinc-400">Manage your agent's commercial status and API access.</p>
            </div>
            <button className="px-6 py-2 bg-[var(--lp-accent)] text-black font-bold rounded-xl text-sm hover:opacity-90 transition">
              Upgrade Tier
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Status Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[var(--lp-accent)] font-bold uppercase text-xs tracking-widest">
                <Shield className="w-4 h-4" />
                Current Status
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-bold text-white">Growth Matrix</p>
                  <p className="text-sm text-zinc-500">Active since April 2026</p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold border border-green-500/30">
                  HEALTHY
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Agents Deployed</span>
                  <span className="text-white">2 / 5</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-[var(--lp-accent)]" />
                </div>
              </div>
            </div>

            {/* API Key Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest">
                <Zap className="w-4 h-4" />
                API Key Matrix
              </div>
              <div className="space-y-3">
                <label className="text-xs text-zinc-500 font-medium">YOUR MASTER KEY</label>
                <div className="flex gap-2">
                  <input 
                    type="password" 
                    readOnly 
                    value="lp_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-300 font-mono"
                  />
                  <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm hover:bg-white/20 transition">Copy</button>
                </div>
                <p className="text-[10px] text-zinc-600">Never share your API key. It grants full control over your agent matrix.</p>
              </div>
            </div>
          </div>

          {/* Usage Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
              <h4 className="text-sm font-bold text-white">Recent Usage Data</h4>
              <button className="text-[var(--lp-accent)] text-xs font-bold hover:underline">Download CSV</button>
            </div>
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-white/[0.02] text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-3">Metric</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Usage</th>
                  <th className="px-6 py-3">Cost Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="px-6 py-4 text-white">Matrix Calls</td>
                  <td className="px-6 py-4"><span className="text-green-400">● Live</span></td>
                  <td className="px-6 py-4">1,242 calls</td>
                  <td className="px-6 py-4">$0.00 (Incl.)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">STT/TTS Tokens</td>
                  <td className="px-6 py-4"><span className="text-green-400">● Live</span></td>
                  <td className="px-6 py-4">42.5M tokens</td>
                  <td className="px-6 py-4">$0.00 (Incl.)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-white">Tool Execution</td>
                  <td className="px-6 py-4"><span className="text-blue-400">● Optimization</span></td>
                  <td className="px-6 py-4">843 runs</td>
                  <td className="px-6 py-4">$0.00 (Incl.)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

