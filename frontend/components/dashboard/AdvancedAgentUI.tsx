'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Save, Loader2, Maximize2, Mic, SlidersHorizontal, ShieldAlert, Cpu, Globe, FileText, Type, FolderPlus, Sparkles, Phone, Shield, Zap, ChevronDown } from 'lucide-react'
import SteeringCanvas from '../SteeringCanvas'
import KnowledgeBaseUI from './KnowledgeBaseUI'
import WhatsAppConfigUI from './WhatsAppConfigUI'

interface AdvancedAgentUIProps {
  systemPrompt: string;
  setSystemPrompt: (v: string) => void;
  firstMessage: string;
  setFirstMessage: (v: string) => void;
  agentLanguage: string;
  setAgentLanguage: (v: string) => void;
  voiceId: string;
  setVoiceId: (v: string) => void;
  isLoading: boolean;
  onSave: () => void;
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
  
  const [innerTab, setInnerTab] = useState<'Agent' | 'Workflow' | 'Knowledge Base' | 'Communication' | 'Settings' | 'Billing & API'>('Agent')
  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl relative shadow-[0_0_80px_rgba(0,0,0,0.5)]">
      {/* Premium Header Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FEED01]/40 to-transparent z-20" />

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
                <div className="absolute inset-0 bg-gradient-to-b from-[#FEED01]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Define the core intelligence of your agent..."
                  className="w-full h-80 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-[#FEED01]/50 focus:ring-1 focus:ring-[#FEED01]/30 resize-none font-mono transition-all backdrop-blur-xl leading-relaxed outline-none"
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase italic opacity-60">Note: Use {"{{variable}}"} for dynamic context</span>
                <div className="flex items-center gap-3">
                   <span className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase">Organic Logic</span>
                   <div className="w-9 h-5 bg-[#FEED01]/10 rounded-full relative border border-[#FEED01]/20 p-1">
                     <motion.div 
                       animate={{ x: 16 }}
                       className="w-3 h-3 bg-[#FEED01] rounded-full shadow-[0_0_8px_#FEED01]" 
                     />
                   </div>
                </div>
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
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="The first greeting sent by the agent..."
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:border-[#FEED01]/50 focus:ring-1 focus:ring-[#FEED01]/30 resize-none font-mono transition-all backdrop-blur-xl outline-none"
                />
               </div>
               <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => setInterruptible?.(!interruptible)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${interruptible ? 'bg-[#FEED01]' : 'bg-zinc-800'}`}
                  >
                    <motion.div 
                      animate={{ x: interruptible ? 24 : 0 }}
                      className="w-6 h-6 bg-white rounded-full absolute shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-center"
                    >
                      <div className={`w-1 h-1 rounded-full ${interruptible ? 'bg-[#FEED01]' : 'bg-zinc-400'}`} />
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Barge-in / Interruptible</span>
                </div>
              </div>
            </div>
          </div>


          {/* Sticky Sidebar (Right) */}
          <div className="w-full lg:w-[400px] bg-black/40 p-6 lg:p-10 flex flex-col gap-10 overflow-y-auto no-scrollbar border-t lg:border-t-0 lg:border-l border-white/5 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FEED01]/5 to-transparent pointer-events-none" />
            
            {/* Voices Card */}
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-white uppercase tracking-widest">Acoustic Matrix</label>
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-[#FEED01]/50 transition-all">
                  <Mic className="w-4 h-4 text-[#FEED01]" />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 font-sketch leading-relaxed">Select the neural voice profile for this node's auditory projection.</p>
              
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

            {/* Execution Status */}
            <div className="space-y-4 pt-8 border-t border-white/5 relative z-10">
               <label className="text-xs font-bold text-white uppercase tracking-widest">Compute Hub</label>
               <div className="bg-gradient-to-br from-[#FEED01]/10 to-transparent border border-[#FEED01]/20 rounded-2xl p-5 space-y-3">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Sparkles className="w-5 h-5 text-[#FEED01]" />
                     <p className="text-sm text-white font-sketch font-bold">Sketch Matrix Mode</p>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-[#FEED01] animate-ping" />
                 </div>
                 <p className="text-[10px] text-zinc-500 font-sketch leading-relaxed">
                   Advanced reasoning, multi-step tool execution, and synaptic knowledge retrieval enabled.
                 </p>
               </div>
            </div>

             {/* Save Button */}
             <div className="pt-8 mt-auto relative z-10">
                <button
                  onClick={onSave}
                  disabled={isLoading}
                  className="w-full bg-[#FEED01] text-black font-sketch font-bold py-4 rounded-2xl flex justify-center items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(254,237,1,0.2)]"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Synchronize Matrix
                </button>
            </div>
          </div>
        </div>
      )}

      {innerTab === 'Workflow' && (
        <div className="flex-1 p-6 lg:p-10 flex flex-col min-h-0 relative z-10">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-sketch font-bold text-white">Live Workflow Steering</h2>
              <p className="text-sm text-zinc-500 font-sketch mt-1 max-w-xl">
                Orchestrate synaptic logic paths. Connect triggers to tools like RAG, Calendar, and Neural Transfers.
              </p>
            </div>
            <div className="flex gap-3">
               <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 Simulation Live
               </div>
            </div>
          </div>
          <div className="flex-1 w-full rounded-[2rem] overflow-hidden border border-white/5 relative bg-[#050505] shadow-inner">
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
        <div className="p-8 lg:p-12 space-y-12 overflow-y-auto no-scrollbar relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#FEED01]/10 border border-[#FEED01]/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-[#FEED01]"/>
             </div>
             <div>
                <h3 className="text-2xl font-sketch font-bold text-white">Neural Configuration</h3>
                <p className="text-sm text-zinc-500 font-sketch">Adjust high-level synaptic parameters and security protocols.</p>
             </div>
          </div>
          
          {/* Transfer Phone Number */}
          <div className="space-y-4 max-w-2xl bg-white/5 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Phone className="w-12 h-12 text-[#FEED01]" />
            </div>
            <label className="text-xs font-bold text-[#FEED01] uppercase tracking-[0.2em] flex items-center gap-2">
              Logic: Neural Transfer
            </label>
            <h4 className="text-lg font-sketch font-bold text-white">Call Forwarding Uplink</h4>
            <p className="text-sm text-zinc-500 font-sketch leading-relaxed">
              Define the termination point for physical call transfers. The agent will hand off the synaptic stream to this number in E.164 format.
            </p>
            <div className="relative mt-4">
              <input
                type="tel"
                value={transferPhoneNumber || ""}
                onChange={(e) => setTransferPhoneNumber?.(e.target.value)}
                placeholder="+17122141889"
                className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#FEED01]/50 outline-none font-mono transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-600 uppercase">Primary Link</div>
            </div>
            <p className="text-[10px] text-zinc-600 font-mono italic">Recommended: +17122141889 (Launch Matrix Default)</p>
          </div>

          {/* Security Section */}
          <div className="space-y-6 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
               <ShieldAlert className="w-5 h-5 text-amber-400" />
               <h4 className="text-lg font-sketch font-bold text-white">Security & Integrity</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-[#FEED01]/20 transition-all group">
                <div className="space-y-1">
                  <p className="text-sm text-white font-sketch font-bold">Injection Shield</p>
                  <p className="text-[10px] text-zinc-500 font-sketch">Prevents prompt-override attempts.</p>
                </div>
                <div 
                  onClick={() => setPromptInjectionProtection?.(!promptInjectionProtection)}
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
                  <p className="text-[10px] text-zinc-500 font-sketch">Strict adherence to memory matrix.</p>
                </div>
                <div 
                  onClick={() => setHallucinationGuard?.(!hallucinationGuard)}
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

