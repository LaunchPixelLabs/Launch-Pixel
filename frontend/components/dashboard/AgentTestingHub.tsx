"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle,
  Mic, Phone, MessageSquare, Clock, TrendingUp, Award, Shield,
  FileText, Download, Share, Settings, ChevronRight, Star,
  ThumbsUp, ThumbsDown, Volume2, VolumeX, SkipForward, SkipBack
} from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

interface TestResult {
  id: string
  timestamp: Date
  type: "voice" | "chat" | "whatsapp"
  score: number
  duration: number
  transcript: string
  feedback: {
    clarity: number
    relevance: number
    tone: number
    accuracy: number
  }
  issues: string[]
  suggestions: string[]
}

interface ApprovalChecklist {
  configuration: boolean
  voice: boolean
  knowledge: boolean
  testing: boolean
  performance: boolean
  security: boolean
}

interface AgentTestingHubProps {
  agentId?: string
  onApprove?: () => void
  onReject?: () => void
  readOnly?: boolean
}

export default function AgentTestingHub({
  agentId,
  onApprove,
  onReject,
  readOnly = false
}: AgentTestingHubProps) {
  const [activeTab, setActiveTab] = useState<"voice" | "chat" | "whatsapp" | "approval">("voice")
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [checklist, setChecklist] = useState<ApprovalChecklist>({
    configuration: false,
    voice: false,
    knowledge: false,
    testing: false,
    performance: false,
    security: false
  })
  const [showApprovalModal, setShowApprovalModal] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)

  const handleStartTest = async (type: "voice" | "chat" | "whatsapp") => {
    setIsTesting(true)
    setActiveTab(type)

    // Simulate test execution
    setTimeout(() => {
      const result: TestResult = {
        id: `test-${Date.now()}`,
        timestamp: new Date(),
        type,
        score: Math.floor(Math.random() * 20) + 80,
        duration: Math.floor(Math.random() * 120) + 30,
        transcript: "This is a simulated test transcript. In production, this would contain the actual conversation between the AI agent and the test user.",
        feedback: {
          clarity: Math.floor(Math.random() * 20) + 80,
          relevance: Math.floor(Math.random() * 20) + 80,
          tone: Math.floor(Math.random() * 20) + 80,
          accuracy: Math.floor(Math.random() * 20) + 80
        },
        issues: [],
        suggestions: []
      }

      setCurrentTest(result)
      setTestResults(prev => [result, ...prev])
      setIsTesting(false)

      // Update checklist
      setChecklist(prev => ({ ...prev, testing: true }))
    }, 3000)
  }

  const handlePlaybackToggle = () => {
    setIsPlaying(!isPlaying)
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }

  const handleApprove = () => {
    if (onApprove) {
      onApprove()
    }
    setShowApprovalModal(false)
  }

  const handleReject = () => {
    if (onReject) {
      onReject()
    }
    setShowApprovalModal(false)
  }

  const overallScore = currentTest
    ? Math.round(
        (currentTest.feedback.clarity +
          currentTest.feedback.relevance +
          currentTest.feedback.tone +
          currentTest.feedback.accuracy) / 4
      )
    : 0

  const isReadyForApproval = Object.values(checklist).every(Boolean)

  return (
    <div className="h-full flex flex-col bg-[#0c0c10]">
      {/* Header */}
      <div className="bg-[#1a1a20] border-b border-[#FEED01]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#FEED01]" />
              Agent Testing Hub
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Test, validate, and approve your AI agent before deployment
            </p>
          </div>

          {!readOnly && (
            <button
              onClick={() => setShowApprovalModal(true)}
              disabled={!isReadyForApproval}
              className="px-4 py-2 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-lg font-medium hover:shadow-[#FEED01]/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              Request Approval
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0c0c10] border-b border-[#FEED01]/10 px-4">
        <div className="flex gap-2">
          {[
            { id: "voice", icon: Mic, label: "Voice Test" },
            { id: "chat", icon: MessageSquare, label: "Chat Test" },
            { id: "whatsapp", icon: Phone, label: "WhatsApp Test" },
            { id: "approval", icon: CheckCircle, label: "Approval" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[#FEED01]/10 text-[#FEED01] border border-[#FEED01]/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "voice" && (
          <div className="space-y-6">
            {/* Test Controls */}
            <div className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Voice Testing</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartTest("voice")}
                    disabled={isTesting}
                    className="px-4 py-2 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-lg font-medium hover:shadow-[#FEED01]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Start Test
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Playback Controls */}
              {currentTest && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePlaybackToggle}
                      className="p-3 bg-[#0c0c10] rounded-lg hover:bg-[#FEED01]/10 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 text-[#FEED01]" /> : <Play className="w-5 h-5 text-[#FEED01]" />}
                    </button>

                    <button
                      onClick={handleMuteToggle}
                      className="p-3 bg-[#0c0c10] rounded-lg hover:bg-[#FEED01]/10 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-[#FEED01]" />}
                    </button>

                    <div className="flex items-center gap-2">
                      {[0.5, 1, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`px-3 py-1 rounded text-sm ${
                            playbackSpeed === speed
                              ? "bg-[#FEED01] text-black"
                              : "bg-[#0c0c10] text-gray-400 hover:text-white"
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 h-2 bg-[#0c0c10] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#FEED01] to-[#FFD700]"
                        initial={{ width: 0 }}
                        animate={{ width: isPlaying ? "100%" : "0%" }}
                        transition={{ duration: currentTest.duration }}
                      />
                    </div>

                    <span className="text-sm text-gray-400">
                      {Math.floor(currentTest.duration / 60)}:{(currentTest.duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>

                  {/* Transcript */}
                  <div className="bg-[#0c0c10] rounded-lg p-4 max-h-64 overflow-y-auto">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{currentTest.transcript}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Test Results</h3>

                <div className="space-y-4">
                  {testResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-[#0c0c10] rounded-lg p-4 border border-[#FEED01]/10"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            result.type === "voice" ? "bg-blue-500/20" :
                            result.type === "chat" ? "bg-green-500/20" :
                            "bg-purple-500/20"
                          }`}>
                            {result.type === "voice" ? <Mic className="w-4 h-4 text-blue-400" /> :
                             result.type === "chat" ? <MessageSquare className="w-4 h-4 text-green-400" /> :
                             <Phone className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Test
                            </p>
                            <p className="text-xs text-gray-400">
                              {result.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.score >= 90 ? "bg-green-500/20 text-green-400" :
                            result.score >= 70 ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }`}>
                            {result.score}%
                          </div>
                        </div>
                      </div>

                      {/* Feedback Metrics */}
                      <div className="grid grid-cols-4 gap-4">
                        {Object.entries(result.feedback).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <p className="text-xs text-gray-400 capitalize">{key}</p>
                            <p className="text-lg font-bold text-white">{value}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-6">
            <div className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Chat Testing</h3>
                <button
                  onClick={() => handleStartTest("chat")}
                  disabled={isTesting}
                  className="px-4 py-2 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-lg font-medium hover:shadow-[#FEED01]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Test
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#0c0c10] rounded-lg p-4 h-64 flex items-center justify-center">
                <p className="text-gray-400">Chat testing interface - Coming soon</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "whatsapp" && (
          <div className="space-y-6">
            <div className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">WhatsApp Testing</h3>
                <button
                  onClick={() => handleStartTest("whatsapp")}
                  disabled={isTesting}
                  className="px-4 py-2 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-lg font-medium hover:shadow-[#FEED01]/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Test
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#0c0c10] rounded-lg p-4 h-64 flex items-center justify-center">
                <p className="text-gray-400">WhatsApp testing interface - Coming soon</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "approval" && (
          <div className="space-y-6">
            {/* Approval Checklist */}
            <div className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Approval Checklist</h3>

              <div className="space-y-3">
                {[
                  { id: "configuration", label: "Agent configuration reviewed", icon: Settings },
                  { id: "voice", label: "Voice quality tested", icon: Mic },
                  { id: "knowledge", label: "Knowledge base validated", icon: FileText },
                  { id: "testing", label: "All tests passed", icon: CheckCircle },
                  { id: "performance", label: "Performance metrics met", icon: TrendingUp },
                  { id: "security", label: "Security checks completed", icon: Shield }
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-[#0c0c10] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${
                        checklist[item.id as keyof ApprovalChecklist]
                          ? "text-green-400"
                          : "text-gray-400"
                      }`} />
                      <span className="text-sm text-white">{item.label}</span>
                    </div>

                    {checklist[item.id as keyof ApprovalChecklist] ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>

              {/* Overall Status */}
              <div className="mt-6 p-4 bg-[#0c0c10] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Overall Status</p>
                    <p className={`text-lg font-bold ${
                      isReadyForApproval ? "text-green-400" : "text-yellow-400"
                    }`}>
                      {isReadyForApproval ? "Ready for Approval" : "Pending Completion"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-400">Completion</p>
                    <p className="text-lg font-bold text-white">
                      {Math.round((Object.values(checklist).filter(Boolean).length / 6) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval History */}
            <div className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Approval History</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0c0c10] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Approved by John Doe</p>
                      <p className="text-xs text-gray-400">April 28, 2026</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                    Production
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#0c0c10] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Changes requested by Jane Smith</p>
                      <p className="text-xs text-gray-400">April 25, 2026</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                    Revision
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FEED01] to-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready for Deployment</h3>
                <p className="text-sm text-gray-400">
                  All checks passed. Do you want to approve this agent for deployment?
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-lg font-medium hover:shadow-[#FEED01]/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve & Deploy
                </button>

                <button
                  onClick={handleReject}
                  className="w-full px-4 py-3 bg-[#0c0c10] border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Request Changes
                </button>

                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="w-full px-4 py-3 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} />
    </div>
  )
}
