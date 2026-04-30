"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bot, Split, Database, Settings, Mic, Link as LinkIcon, 
  Code, Users, PhoneCall, Phone, PhoneOutgoing, FileText, 
  LogOut, Zap, Activity, Globe, Shield, Loader2, Menu 
} from "lucide-react"

import { useDashboard } from "@/hooks/useDashboard"
import { useIsMobile, useIsTablet } from "@/hooks/useMediaQuery"
import AdvancedAgentUI from "@/components/dashboard/AdvancedAgentUI"
import AgentListView from "@/components/dashboard/AgentListView"
import KnowledgeBaseUI from "@/components/dashboard/KnowledgeBaseUI"
import WhatsAppConfigUI from "@/components/dashboard/WhatsAppConfigUI"
import TestAgentUI from "@/components/dashboard/TestAgentUI"
import DeploymentHubUI from "@/components/dashboard/DeploymentHubUI"
import ConversationsTab from "@/components/dashboard/tabs/ConversationsTab"
import OutboundTab from "@/components/dashboard/tabs/OutboundTab"
import PremiumBackground from "@/components/dashboard/PremiumBackground"
import Sidebar from "@/components/dashboard/Sidebar"
import BillingTab from "@/components/dashboard/tabs/BillingTab"
import GrowthPanel from "@/components/dashboard/GrowthPanel"
import PerformanceGraph from "@/components/dashboard/PerformanceGraph"
import LiveOperationsTicker from "@/components/dashboard/LiveOperationsTicker"
import GlobalAgent from "@/components/dashboard/GlobalAgent"
import PixelFlowBuilder from "@/components/dashboard/PixelFlowBuilder"
import AgentTestingHub from "@/components/dashboard/AgentTestingHub"
import AgentMetrics from "@/components/dashboard/AgentMetrics"
import DeploymentPipeline from "@/components/dashboard/DeploymentPipeline"
import WhatsNewPanel from "@/components/dashboard/WhatsNewPanel"
import ErrorBoundary from "@/components/ErrorBoundary"
import { logger } from "@/lib/logger"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://launch-pixel-backend.onrender.com"
const WORKER_BASE = process.env.NEXT_PUBLIC_WORKER_URL || "https://launch-pixel-backend.onrender.com"
// Render Node.js server — required for WhatsApp (Baileys needs persistent runtime)
const NODE_API_BASE = process.env.NEXT_PUBLIC_NODE_API_URL || "https://launch-pixel-backend.onrender.com"

export default function DashboardPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

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
    <div className="flex flex-col lg:flex-row h-screen bg-[#0c0c10] text-white overflow-hidden font-sketch selection:bg-[#FEED01]/30">
      {/* Dynamic Premium Background — hidden on mobile for GPU perf */}
      {!isMobile && <PremiumBackground />}

      {/* Responsive Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSignOut={handleSignOut}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isTablet}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0 bg-[radial-gradient(circle_at_100%_100%,#FEED0105_0%,transparent_40%)] overflow-hidden">
        
        {/* ===== Mobile/Tablet Header Bar ===== */}
        <div className="flex items-center justify-between px-4 py-3 lg:px-0 lg:py-0 border-b border-white/[0.06] lg:border-0 bg-[#111115]/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none flex-shrink-0">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-zinc-300" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FEED01] rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(254,237,1,0.3)]">
                <Zap className="w-4 h-4 text-black fill-black" />
              </div>
              <span className="text-sm font-black italic tracking-tighter uppercase">PixelFlow</span>
            </div>
          </div>

          {/* Right: What's New + Actions */}
          <div className="flex items-center gap-2 ml-auto lg:absolute lg:top-3 lg:right-6 lg:z-30">
            <WhatsNewPanel onNavigate={(tab) => setActiveTab(tab)} />
          </div>
        </div>

        {/* LiveOperationsTicker — hidden on mobile */}
        {!isMobile && <LiveOperationsTicker />}
        
        <div className="p-4 md:p-6 lg:p-8 pb-0 flex-shrink-0 dashboard-panel">
          <GrowthPanel 
            stats={{
              revenue: analyticsData?.totalPipeline || 0,
              hoursSaved: Math.round((analyticsData?.totalCalls || 0) * 0.15),
              leadQuality: parseInt(analyticsData?.conversionRate || '0') || 0,
              activeAgents: 0
            }}
          />
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8 pt-0 overflow-y-auto no-scrollbar flex flex-col">
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
              {activeTab === "deployed" && <DeploymentHubUI currentUser={currentUser} />}
              {activeTab === "billing" && <BillingTab currentUser={currentUser} />}
              {activeTab === "builder" && (
                <ErrorBoundary>
                  <PixelFlowBuilder
                    onSave={(nodes, connections) => {
                      logger.info("Saving workflow", { nodes: nodes.length, connections: connections.length })
                      handleSaveConfig({ nodes, edges: connections })
                    }}
                    onTest={(nodes, connections) => {
                      logger.info("Testing workflow", { nodes: nodes.length, connections: connections.length })
                      setActiveTab("test")
                    }}
                    initialNodes={canvasState?.nodes}
                    initialConnections={canvasState?.edges}
                  />
                </ErrorBoundary>
              )}
              {activeTab === "testing" && (
                <ErrorBoundary>
                  <AgentTestingHub
                    agentId={selectedAgentId || undefined}
                    onApprove={() => {
                      logger.info("Agent approved", { agentId: selectedAgentId })
                      handleDeploy("production")
                    }}
                    onReject={() => {
                      logger.info("Agent rejected", { agentId: selectedAgentId })
                    }}
                  />
                </ErrorBoundary>
              )}
              {activeTab === "metrics" && (
                <ErrorBoundary>
                  <AgentMetrics
                    agentId={selectedAgentId || undefined}
                    timeRange="30d"
                  />
                </ErrorBoundary>
              )}
              {activeTab === "pipeline" && (
                <ErrorBoundary>
                  <DeploymentPipeline
                    agentId={selectedAgentId || undefined}
                    onDeploy={(stage) => {
                      logger.info("Deploying agent", { agentId: selectedAgentId, stage })
                      handleDeploy(stage)
                    }}
                    onRollback={() => {
                      logger.info("Rolling back agent", { agentId: selectedAgentId })
                    }}
                  />
                </ErrorBoundary>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global AI Assistant */}
      <GlobalAgent
        userId={currentUser?.uid}
        agentId={selectedAgentId || undefined}
        context={activeTab}
        onAction={(action, data) => {
          // Handle agent actions from GlobalAgent
          logger.info("GlobalAgent action", { action, data })

          // Navigate based on action
          switch (action) {
            case "create_agent":
              setActiveTab("configure")
              break
            case "test_agent":
              setActiveTab("testing")
              break
            case "deploy_agent":
              setActiveTab("pipeline")
              break
            case "configure_agent":
              setActiveTab("configure")
              break
            case "view_analytics":
              setActiveTab("metrics")
              break
            case "build_workflow":
              setActiveTab("builder")
              break
            default:
              logger.warn("Unknown GlobalAgent action", { action })
          }
        }}
      />
    </div>
  )
}
