'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import AgentConfigTab from './advanced/AgentConfigTab'
import WorkflowTab from './advanced/WorkflowTab'
import SettingsTab from './advanced/SettingsTab'
import BillingTab from './advanced/BillingTab'
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
  onCanvasSave?: (state: any) => void;
  canvasState?: any;
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
  agentId?: string;
  steeringInstructions?: string;
  setSteeringInstructions?: (v: string) => void;
  adminWhatsAppNumber?: string;
  setAdminWhatsAppNumber?: (v: string) => void;
}

type TabType = 'Agent' | 'Workflow' | 'Knowledge Base' | 'Communication' | 'Settings' | 'Billing'

export default function AdvancedAgentUI(props: AdvancedAgentUIProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Agent')

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-3xl relative shadow-[0_0_80px_rgba(0,0,0,0.5)]">
      {/* Horizontal Sub-Navigation */}
      <div className="flex px-4 pt-4 border-b border-white/10 overflow-x-auto no-scrollbar relative z-10">
        {['Agent', 'Workflow', 'Knowledge Base', 'Communication', 'Settings', 'Billing'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={`px-6 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
              activeTab === tab ? "text-white" : "text-zinc-500 hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="agent-sub-tab" 
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FEED01] shadow-[0_0_10px_#FEED01]" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10 min-h-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {activeTab === 'Agent' && (
              <AgentConfigTab 
                systemPrompt={props.systemPrompt} setSystemPrompt={props.setSystemPrompt}
                firstMessage={props.firstMessage} setFirstMessage={props.setFirstMessage}
                steeringInstructions={props.steeringInstructions || ""} setSteeringInstructions={props.setSteeringInstructions || (() => {})}
                voiceId={props.voiceId} setVoiceId={props.setVoiceId}
                agentLanguage={props.agentLanguage} setAgentLanguage={props.setAgentLanguage}
                adminWhatsAppNumber={props.adminWhatsAppNumber || ""} setAdminWhatsAppNumber={props.setAdminWhatsAppNumber || (() => {})}
                interruptible={props.interruptible || false} setInterruptible={props.setInterruptible || (() => {})}
                isLoading={props.isLoading} onSave={props.onSave}
              />
            )}

            {activeTab === 'Workflow' && (
              <WorkflowTab 
                onCanvasSave={props.onCanvasSave} 
                canvasState={props.canvasState}
                isLoading={props.isLoading}
              />
            )}

            {activeTab === 'Knowledge Base' && (
              <div className="p-6 overflow-y-auto">
                <KnowledgeBaseUI 
                  userId={props.userId}
                  workerBase={props.workerBase}
                  getAuthHeaders={props.getAuthHeaders}
                />
              </div>
            )}

            {activeTab === 'Communication' && (
              <div className="p-6 overflow-y-auto">
                <WhatsAppConfigUI 
                  userId={props.userId}
                  agentId={props.agentId}
                  apiBase={props.apiBase}
                />
              </div>
            )}

            {activeTab === 'Settings' && (
              <SettingsTab 
                transferPhoneNumber={props.transferPhoneNumber || ""}
                setTransferPhoneNumber={props.setTransferPhoneNumber || (() => {})}
                promptInjectionProtection={props.promptInjectionProtection || false}
                setPromptInjectionProtection={props.setPromptInjectionProtection || (() => {})}
                hallucinationGuard={props.hallucinationGuard || false}
                setHallucinationGuard={props.setHallucinationGuard || (() => {})}
              />
            )}

            {activeTab === 'Billing' && <BillingTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
