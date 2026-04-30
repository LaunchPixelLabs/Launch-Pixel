"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Rocket, CheckCircle, XCircle, Clock, AlertTriangle, Settings,
  Play, Pause, RotateCcw, Download, Share, ChevronRight, Shield,
  FileText, Users, Zap, Globe, Server, Database, Lock, Eye,
  ArrowRight, Loader2, RefreshCw, History, GitBranch, Tag
} from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

interface DeploymentStage {
  id: string
  name: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed"
  icon: any
  checks: DeploymentCheck[]
}

interface DeploymentCheck {
  id: string
  name: string
  status: "pending" | "passed" | "failed"
  message?: string
}

interface DeploymentHistory {
  id: string
  version: string
  stage: "test" | "production"
  status: "success" | "failed" | "rolled_back"
  timestamp: Date
  duration: number
  deployedBy: string
}

interface DeploymentPipelineProps {
  agentId?: string
  onDeploy?: (stage: "test" | "production") => void
  onRollback?: () => void
  readOnly?: boolean
}

const STAGES: DeploymentStage[] = [
  {
    id: "configuration",
    name: "Configuration",
    description: "Agent setup and workflow design",
    status: "completed",
    icon: Settings,
    checks: [
      { id: "config_1", name: "System prompt configured", status: "passed" },
      { id: "config_2", name: "Voice settings validated", status: "passed" },
      { id: "config_3", name: "Workflow canvas saved", status: "passed" }
    ]
  },
  {
    id: "testing",
    name: "Testing",
    description: "Automated and manual testing",
    status: "completed",
    icon: Play,
    checks: [
      { id: "test_1", name: "Voice quality test passed", status: "passed" },
      { id: "test_2", name: "Conversation simulation completed", status: "passed" },
      { id: "test_3", name: "Knowledge base validated", status: "passed" },
      { id: "test_4", name: "Performance metrics met", status: "passed" }
    ]
  },
  {
    id: "approval",
    name: "Approval",
    description: "Human review and sign-off",
    status: "in_progress",
    icon: Shield,
    checks: [
      { id: "approval_1", name: "Configuration review", status: "passed" },
      { id: "approval_2", name: "Testing review", status: "passed" },
      { id: "approval_3", name: "Security check", status: "pending" },
      { id: "approval_4", name: "Final approval", status: "pending" }
    ]
  },
  {
    id: "staging",
    name: "Staging",
    description: "Deploy to test environment",
    status: "pending",
    icon: Server,
    checks: [
      { id: "stage_1", name: "Environment provisioned", status: "pending" },
      { id: "stage_2", name: "Agent deployed", status: "pending" },
      { id: "stage_3", name: "Health check passed", status: "pending" }
    ]
  },
  {
    id: "production",
    name: "Production",
    description: "Live deployment with monitoring",
    status: "pending",
    icon: Rocket,
    checks: [
      { id: "prod_1", name: "Production environment ready", status: "pending" },
      { id: "prod_2", name: "Agent deployed", status: "pending" },
      { id: "prod_3", name: "Monitoring active", status: "pending" },
      { id: "prod_4", name: "Rollback plan verified", status: "pending" }
    ]
  }
]

const HISTORY: DeploymentHistory[] = [
  {
    id: "1",
    version: "v2.1.0",
    stage: "production",
    status: "success",
    timestamp: new Date("2026-04-28T10:30:00"),
    duration: 45,
    deployedBy: "John Doe"
  },
  {
    id: "2",
    version: "v2.0.5",
    stage: "test",
    status: "success",
    timestamp: new Date("2026-04-25T14:15:00"),
    duration: 32,
    deployedBy: "Jane Smith"
  },
  {
    id: "3",
    version: "v2.0.4",
    stage: "production",
    status: "rolled_back",
    timestamp: new Date("2026-04-24T09:00:00"),
    duration: 28,
    deployedBy: "John Doe"
  }
]

export default function DeploymentPipeline({
  agentId,
  onDeploy,
  onRollback,
  readOnly = false
}: DeploymentPipelineProps) {
  const [stages, setStages] = useState<DeploymentStage[]>(STAGES)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployStage, setDeployStage] = useState<"test" | "production" | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistory, setSelectedHistory] = useState<DeploymentHistory | null>(null)

  const handleDeploy = async (stage: "test" | "production") => {
    setIsDeploying(true)
    setDeployStage(stage)

    // Simulate deployment process
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStages(prev =>
        prev.map((s, idx) =>
          idx === i
            ? {
                ...s,
                status: "in_progress" as const,
                checks: s.checks.map((c, cIdx) =>
                  cIdx === 0
                    ? { ...c, status: "passed" as const }
                    : c
                )
              }
            : s
        )
      )

      // Simulate check completion
      for (let j = 1; j < stages[i].checks.length; j++) {
        await new Promise(resolve => setTimeout(resolve, 500))

        setStages(prev =>
          prev.map((s, idx) =>
            idx === i
              ? {
                  ...s,
                  checks: s.checks.map((c, cIdx) =>
                    cIdx === j
                      ? { ...c, status: "passed" as const }
                      : c
                  )
                }
              : s
          )
        )
      }

      setStages(prev =>
        prev.map((s, idx) =>
          idx === i
            ? { ...s, status: "completed" as const }
            : s
        )
      )
    }

    setIsDeploying(false)
    setDeployStage(null)

    if (onDeploy) {
      onDeploy(stage)
    }
  }

  const handleRollback = async () => {
    if (!confirm("Are you sure you want to rollback to the previous version?")) {
      return
    }

    setIsDeploying(true)

    // Simulate rollback
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsDeploying(false)

    if (onRollback) {
      onRollback()
    }
  }

  const getStageStatus = (stage: DeploymentStage) => {
    switch (stage.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "in_progress":
        return <Loader2 className="w-5 h-5 text-[#FEED01] animate-spin" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStageColor = (status: DeploymentStage["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-500/30 bg-green-500/5"
      case "in_progress":
        return "border-[#FEED01]/30 bg-[#FEED01]/5"
      case "failed":
        return "border-red-500/30 bg-red-500/5"
      default:
        return "border-[#FEED01]/20 bg-[#1a1a20]"
    }
  }

  const getCheckStatus = (check: DeploymentCheck) => {
    switch (check.status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const currentStageIndex = stages.findIndex(s => s.status === "in_progress")
  const isReadyForDeploy = stages.every(s => s.status === "completed")

  return (
    <div className="h-full flex flex-col bg-[#0c0c10]">
      {/* Header */}
      <div className="bg-[#1a1a20] border-b border-[#FEED01]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#FEED01]" />
              Deployment Pipeline
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Automated deployment workflow with approval and rollback
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-[#0c0c10] border border-[#FEED01]/20 rounded-lg text-white hover:border-[#FEED01] transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              History
            </button>

            {!readOnly && (
              <>
                <button
                  onClick={() => handleDeploy("test")}
                  disabled={isDeploying}
                  className="px-4 py-2 bg-[#1a1a20] border border-[#FEED01]/20 rounded-lg text-white hover:border-[#FEED01] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeploying && deployStage === "test" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Deploy to Test
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDeploy("production")}
                  disabled={isDeploying || !isReadyForDeploy}
                  className="px-4 py-2 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-lg font-medium hover:shadow-[#FEED01]/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeploying && deployStage === "production" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      Deploy to Production
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Pipeline Stages */}
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border rounded-xl p-5 ${getStageColor(stage.status)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    stage.status === "completed"
                      ? "bg-green-500/20"
                      : stage.status === "in_progress"
                      ? "bg-[#FEED01]/20"
                      : stage.status === "failed"
                      ? "bg-red-500/20"
                      : "bg-[#0c0c10]"
                  }`}>
                    <stage.icon className={`w-6 h-6 ${
                      stage.status === "completed"
                        ? "text-green-400"
                        : stage.status === "in_progress"
                        ? "text-[#FEED01]"
                        : stage.status === "failed"
                        ? "text-red-400"
                        : "text-gray-400"
                    }`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{stage.name}</h3>
                      {getStageStatus(stage)}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{stage.description}</p>
                  </div>
                </div>

                {index < stages.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Checks */}
              <div className="space-y-2">
                {stage.checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-3 bg-[#0c0c10] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getCheckStatus(check)}
                      <span className="text-sm text-white">{check.name}</span>
                    </div>

                    {check.message && (
                      <span className="text-xs text-gray-400">{check.message}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Deployment History */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-[#FEED01]" />
                Deployment History
              </h3>
            </div>

            <div className="space-y-3">
              {HISTORY.map((deployment) => (
                <div
                  key={deployment.id}
                  className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-4 hover:border-[#FEED01]/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedHistory(deployment)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        deployment.status === "success"
                          ? "bg-green-500/20"
                          : deployment.status === "failed"
                          ? "bg-red-500/20"
                          : "bg-yellow-500/20"
                      }`}>
                        {deployment.status === "success" ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : deployment.status === "failed" ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <RotateCcw className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{deployment.version}</span>
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            deployment.stage === "production"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}>
                            {deployment.stage}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Deployed by {deployment.deployedBy} · {deployment.duration}s
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {deployment.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Rollback Section */}
        {!readOnly && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Emergency Rollback</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Immediately rollback to the previous stable version
                  </p>
                </div>
              </div>

              <button
                onClick={handleRollback}
                disabled={isDeploying}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rolling back...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Rollback
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
