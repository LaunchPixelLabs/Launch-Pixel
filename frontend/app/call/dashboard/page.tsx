"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bot, Split, Database, Settings, Mic, Link as LinkIcon, 
  Code, Users, PhoneCall, Phone, PhoneOutgoing, FileText, 
  LogOut, Zap, Activity, Globe, Shield, Loader2 
} from "lucide-react"

import { useDashboard } from "@/hooks/useDashboard"
import AdvancedAgentUI from "@/components/dashboard/AdvancedAgentUI"
import AgentListView from "@/components/dashboard/AgentListView"
import KnowledgeBaseUI from "@/components/dashboard/KnowledgeBaseUI"
import WhatsAppConfigUI from "@/components/dashboard/WhatsAppConfigUI"
import TestAgentUI from "@/components/dashboard/TestAgentUI"
import LiveMatrixStatus from "@/components/dashboard/LiveMatrixStatus"
import OutboundTab from "@/components/dashboard/tabs/OutboundTab"
import ConversationsTab from "@/components/dashboard/tabs/ConversationsTab"
import MissionControlHUD from "@/components/dashboard/MissionControlHUD"
import PremiumBackground from "@/components/dashboard/PremiumBackground"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const WORKER_BASE = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787"

export default function DashboardPage() {
  const {
    currentUser, isAuthLoading, isLoading, activeTab, setActiveTab,
    selectedAgentId, agentName, systemPrompt, setSystemPrompt,
    firstMessage, setFirstMessage, voiceId, setVoiceId, agentLanguage, setAgentLanguage,
    agentType, canvasState, setCanvasState, enabledTools, setEnabledTools,
    transferPhoneNumber, setTransferPhoneNumber, steeringInstructions, setSteeringInstructions,
    adminWhatsAppNumber, setAdminWhatsAppNumber, interruptible, setInterruptible,
    promptInjectionProtection, setPromptInjectionProtection, hallucinationGuard, setHallucinationGuard,
    contacts, analyticsData, callLogs,
    manualPhone, setManualPhone, manualName, setManualName,
    handleSaveConfig, handleDeploy, handleSignOut, getAuthHeaders,
    handleCSVUpload, handleBatchCall, handleManualCall, handleExportCSV, loadAgentConfig
  } = useDashboard()

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#FEED01]/10 rounded-full animate-ping absolute inset-0" />
          <Loader2 className="w-10 h-10 text-[#FEED01] animate-spin relative z-10" />
        </div>
      </div>
    )
  }

  const agentConfigProps = {
    systemPrompt, setSystemPrompt, firstMessage, setFirstMessage,
    agentLanguage, setAgentLanguage, voiceId, setVoiceId,
    interruptible, setInterruptible, promptInjectionProtection, setPromptInjectionProtection,
    hallucinationGuard, setHallucinationGuard, transferPhoneNumber, setTransferPhoneNumber,
    steeringInstructions, setSteeringInstructions, adminWhatsAppNumber, setAdminWhatsAppNumber,
    canvasState, onCanvasSave: (state: any) => handleSaveConfig(state),
    workerBase: WORKER_BASE, apiBase: API_BASE, getAuthHeaders, userId: currentUser?.uid,
    agentId: selectedAgentId || undefined
  }

  return (
    <div className="flex h-screen bg-[#020203] text-white overflow-hidden font-sketch selection:bg-[#FEED01]/30">
      {/* Dynamic Premium Background */}
      <PremiumBackground />

      {/* Sidebar Navigation */}
      <aside className="w-72 bg-[#08080a] border-r border-white/5 flex flex-col relative z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer">
            <div className="w-10 h-10 bg-[#FEED01] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(254,237,1,0.3)] group-hover:rotate-12 transition-transform">
              <Zap className="w-6 h-6 text-black fill-black" />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">Launch Pixel</h1>
          </div>

          <nav className="space-y-10">
            {/* Zones */}
            {[
              { 
                title: "Agent Controls", 
                items: [
                  { id: "agents", label: "My Agents", icon: Bot },
                  { id: "outbound", label: "Campaigns", icon: PhoneOutgoing },
                  { id: "whatsapp", label: "Link WhatsApp", icon: Phone },
                  { id: "conversations", label: "Performance", icon: FileText },
                ] 
              },
              { 
                title: "Knowledge Hub", 
                items: [
                  { id: "knowledge", label: "Knowledge Base", icon: Database },
                  { id: "test", label: "Test Lab", icon: Zap },
                ] 
              }
            ].map(zone => (
              <div key={zone.title}>
                <h3 className="px-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4">{zone.title}</h3>
                <div className="space-y-1">
                  {zone.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                        activeTab === item.id ? "bg-[#FEED01]/10 text-[#FEED01] border border-[#FEED01]/20" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${activeTab === item.id ? "text-[#FEED01]" : "text-zinc-600 group-hover:text-zinc-400"}`} />
                      <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-bold text-[11px] uppercase tracking-widest">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* Main Interface Matrix */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0 bg-[radial-gradient(circle_at_100%_100%,#FEED0105_0%,transparent_40%)]">
        <div className="p-8 pb-0 space-y-6">
          <LiveMatrixStatus 
            agentName={selectedAgentId ? agentName : "System Ready"}
            isLive={!!selectedAgentId && contacts.some(c => c.elevenLabsAgentId)}
            onDeploy={handleDeploy}
          />
          
          <MissionControlHUD 
            stats={{
              activeCalls: callLogs.filter(l => l.status === 'in-progress').length,
              whatsappQueue: contacts.filter(c => c.lastMessage).length,
              neuralTurns: analyticsData?.totalCalls || 0,
              safetyScore: 99
            }}
          />
        </div>

        <div className="flex-1 p-8 pt-2 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 flex flex-col min-h-0"
            >
              {activeTab === "agents" && (
                <AgentListView currentUser={currentUser} onAgentSelect={(id) => { loadAgentConfig(id); }} />
              )}

              {activeTab === "configure" && (
                <AdvancedAgentUI 
                  {...agentConfigProps}
                  isLoading={isLoading}
                  onSave={() => handleSaveConfig()}
                />
              )}

              {activeTab === "outbound" && (
                <OutboundTab 
                  agentType="outbound"
                  contacts={contacts}
                  manualName={manualName}
                  setManualName={setManualName}
                  manualPhone={manualPhone}
                  setManualPhone={setManualPhone}
                  handleManualCall={handleManualCall}
                  isLoading={isLoading}
                  handleCSVUpload={handleCSVUpload as any}
                  showValidationReport={false}
                  csvSummary={null}
                  csvFile={null}
                  handleCloseValidationReport={() => {}}
                  csvValidationErrors={[]}
                  csvValidContacts={[]}
                  handleImportValidOnly={() => {}}
                  handleDownloadCorrectedCSV={() => {}}
                  handleQuickCall={() => {}}
                  handleBatchCall={handleBatchCall}
                />
              )}

              {activeTab === "conversations" && (
                <ConversationsTab 
                  logs={callLogs}
                  analytics={analyticsData}
                  isLoading={isLoading}
                />
              )}

              {activeTab === "knowledge" && <KnowledgeBaseUI userId={currentUser?.uid} workerBase={WORKER_BASE} getAuthHeaders={getAuthHeaders} />}
              {activeTab === "whatsapp" && <WhatsAppConfigUI userId={currentUser?.uid} agentId={selectedAgentId || undefined} apiBase={API_BASE} />}
              {activeTab === "test" && <TestAgentUI currentUser={currentUser} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
