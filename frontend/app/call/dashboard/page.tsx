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
import ConversationsTab from "@/components/dashboard/tabs/ConversationsTab"
import OutboundTab from "@/components/dashboard/tabs/OutboundTab"
import PremiumBackground from "@/components/dashboard/PremiumBackground"
import Sidebar from "@/components/dashboard/Sidebar"
import BillingTab from "@/components/dashboard/tabs/BillingTab"
import GrowthPanel from "@/components/dashboard/GrowthPanel"
import PerformanceGraph from "@/components/dashboard/PerformanceGraph"
import LiveOperationsTicker from "@/components/dashboard/LiveOperationsTicker"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://launch-pixel-backend.onrender.com"
const WORKER_BASE = process.env.NEXT_PUBLIC_WORKER_URL || "https://launch-pixel-backend.onrender.com"
// Render Node.js server — required for WhatsApp (Baileys needs persistent runtime)
const NODE_API_BASE = process.env.NEXT_PUBLIC_NODE_API_URL || "https://launch-pixel-backend.onrender.com"

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

  useGSAP(() => {
    gsap.from(".dashboard-panel", {
      y: 30,
      opacity: 0,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out"
    });
  }, { dependencies: [activeTab] });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0c0c10] flex items-center justify-center">
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
    workerBase: NODE_API_BASE, apiBase: NODE_API_BASE, getAuthHeaders, userId: currentUser?.uid,
    agentId: selectedAgentId || undefined
  }

  return (
    <div className="flex h-screen bg-[#0c0c10] text-white overflow-hidden font-sketch selection:bg-[#FEED01]/30">
      {/* Dynamic Premium Background */}
      <PremiumBackground />

      {/* Premium Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSignOut={handleSignOut} 
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0 bg-[radial-gradient(circle_at_100%_100%,#FEED0105_0%,transparent_40%)] overflow-hidden">
        <LiveOperationsTicker />
        
        <div className="p-8 pb-0 flex-shrink-0 dashboard-panel">
          <GrowthPanel 
            stats={{
              revenue: analyticsData?.totalPipeline || 0,
              hoursSaved: Math.round((analyticsData?.totalCalls || 0) * 0.15),
              leadQuality: parseInt(analyticsData?.conversionRate || '0') || 0,
              activeAgents: 0 // Stat requires agent list from AgentListView
            }}
          />
        </div>

        <div className="flex-1 p-8 pt-0 overflow-y-auto no-scrollbar flex flex-col">
          {activeTab === "conversations" && (
            <div className="dashboard-panel">
              <PerformanceGraph 
                stats={{
                  revenue: analyticsData?.totalPipeline || 0,
                  calls: analyticsData?.totalCalls || 0
                }}
              />
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="dashboard-panel flex-1 flex flex-col min-h-0"
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
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
              {activeTab === "whatsapp" && <WhatsAppConfigUI userId={currentUser?.uid} agentId={selectedAgentId || undefined} apiBase={NODE_API_BASE} />}
              {activeTab === "test" && <TestAgentUI currentUser={currentUser} />}
              {activeTab === "billing" && <BillingTab currentUser={currentUser} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
