"use client"

import React, { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Trash2, Play, Save, Settings, Mic, MessageSquare,
  Phone, Calendar, ChevronRight, X, GripVertical, Sparkles,
  Copy, Download, Upload, Zap, Target, CheckCircle, AlertCircle
} from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

interface Node {
  id: string
  type: "start" | "response" | "question" | "action" | "condition" | "end"
  position: { x: number; y: number }
  data: {
    label: string
    content?: string
    voiceSettings?: any
    tools?: string[]
    conditions?: any[]
    nextNodeId?: string
  }
}

interface Connection {
  id: string
  from: string
  to: string
}

interface PixelFlowBuilderProps {
  onSave?: (nodes: Node[], connections: Connection[]) => void
  onTest?: (nodes: Node[], connections: Connection[]) => void
  initialNodes?: Node[]
  initialConnections?: Connection[]
  readOnly?: boolean
}

const NODE_TYPES = {
  start: { icon: Play, color: "from-green-500 to-emerald-600", label: "Start" },
  response: { icon: MessageSquare, color: "from-blue-500 to-cyan-600", label: "Response" },
  question: { icon: Mic, color: "from-purple-500 to-pink-600", label: "Question" },
  action: { icon: Zap, color: "from-orange-500 to-red-600", label: "Action" },
  condition: { icon: Target, color: "from-yellow-500 to-amber-600", label: "Condition" },
  end: { icon: CheckCircle, color: "from-gray-500 to-slate-600", label: "End" }
}

const TEMPLATES: Record<string, { name: string; nodes: Node[]; connections: Connection[] }> = {
  sales: {
    name: "Sales Agent",
    nodes: [
      {
        id: "start",
        type: "start" as const,
        position: { x: 100, y: 100 },
        data: { label: "Start Call", nextNodeId: "greeting" }
      },
      {
        id: "greeting",
        type: "response",
        position: { x: 300, y: 100 },
        data: { label: "Greeting", content: "Hi! I'm calling from [Company Name]. How are you today?", nextNodeId: "qualification" }
      },
      {
        id: "qualification",
        type: "question",
        position: { x: 500, y: 100 },
        data: { label: "Qualification", content: "Are you the decision maker for [Topic]?", nextNodeId: "pitch" }
      },
      {
        id: "pitch",
        type: "response",
        position: { x: 700, y: 100 },
        data: { label: "Value Pitch", content: "Great! Let me share how we can help you...", nextNodeId: "booking" }
      },
      {
        id: "booking",
        type: "action",
        position: { x: 900, y: 100 },
        data: { label: "Book Meeting", tools: ["calendar"], nextNodeId: "end" }
      },
      {
        id: "end",
        type: "end",
        position: { x: 1100, y: 100 },
        data: { label: "End Call" }
      }
    ],
    connections: [
      { id: "c1", from: "start", to: "greeting" },
      { id: "c2", from: "greeting", to: "qualification" },
      { id: "c3", from: "qualification", to: "pitch" },
      { id: "c4", from: "pitch", to: "booking" },
      { id: "c5", from: "booking", to: "end" }
    ]
  },
  support: {
    name: "Support Agent",
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 100, y: 100 },
        data: { label: "Start Support", nextNodeId: "greeting" }
      },
      {
        id: "greeting",
        type: "response",
        position: { x: 300, y: 100 },
        data: { label: "Welcome", content: "Thank you for calling! How can I help you today?", nextNodeId: "issue" }
      },
      {
        id: "issue",
        type: "question",
        position: { x: 500, y: 100 },
        data: { label: "Identify Issue", content: "Can you describe the issue you're experiencing?", nextNodeId: "resolution" }
      },
      {
        id: "resolution",
        type: "condition" as const,
        position: { x: 700, y: 100 },
        data: {
          label: "Resolution Path",
          conditions: [
            { condition: "simple_issue", nextNodeId: "quick_fix" },
            { condition: "complex_issue", nextNodeId: "escalate" }
          ]
        }
      },
      {
        id: "quick_fix",
        type: "response",
        position: { x: 900, y: 50 },
        data: { label: "Quick Fix", content: "Here's a quick solution...", nextNodeId: "end" }
      },
      {
        id: "escalate",
        type: "action",
        position: { x: 900, y: 150 },
        data: { label: "Escalate", tools: ["transfer"], nextNodeId: "end" }
      },
      {
        id: "end",
        type: "end",
        position: { x: 1100, y: 100 },
        data: { label: "End Call" }
      }
    ],
    connections: [
      { id: "c1", from: "start", to: "greeting" },
      { id: "c2", from: "greeting", to: "issue" },
      { id: "c3", from: "issue", to: "resolution" },
      { id: "c4", from: "resolution", to: "quick_fix" },
      { id: "c5", from: "resolution", to: "escalate" },
      { id: "c6", from: "quick_fix", to: "end" },
      { id: "c7", from: "escalate", to: "end" }
    ]
  }
}

export default function PixelFlowBuilder({
  onSave,
  onTest,
  initialNodes,
  initialConnections,
  readOnly = false
}: PixelFlowBuilderProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes || TEMPLATES.sales.nodes)
  const [connections, setConnections] = useState<Connection[]>(
    initialConnections || TEMPLATES.sales.connections
  )
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<Node | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleAddNode = useCallback((type: keyof typeof NODE_TYPES) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 100 + nodes.length * 200, y: 100 },
      data: {
        label: NODE_TYPES[type].label,
        content: "",
        tools: [],
        conditions: []
      }
    }

    setNodes(prev => [...prev, newNode])
    setSelectedNode(newNode)

    // Animate new node appearance
    gsap.fromTo(
      `[data-node-id="${newNode.id}"]`,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
    )
  }, [nodes.length])

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }, [selectedNode])

  const handleNodeDragStart = useCallback((node: Node, e: React.MouseEvent) => {
    if (readOnly) return
    setIsDragging(true)
    setDraggedNode(node)
    e.stopPropagation()
  }, [readOnly])

  const handleNodeDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedNode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - 100
    const y = e.clientY - rect.top - 40

    setNodes(prev =>
      prev.map(n =>
        n.id === draggedNode.id
          ? { ...n, position: { x: Math.max(0, x), y: Math.max(0, y) } }
          : n
      )
    )
  }, [isDragging, draggedNode])

  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedNode(null)
  }, [])

  const handleConnectNodes = useCallback((fromId: string, toId: string) => {
    const existingConnection = connections.find(
      c => c.from === fromId && c.to === toId
    )

    if (!existingConnection && fromId !== toId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: fromId,
        to: toId
      }

      setConnections(prev => [...prev, newConnection])

      // Animate connection
      gsap.fromTo(
        `[data-connection-id="${newConnection.id}"]`,
        { strokeDashoffset: 1000 },
        { strokeDashoffset: 0, duration: 1, ease: "power2.out" }
      )
    }
  }, [connections])

  const handleLoadTemplate = useCallback((templateName: keyof typeof TEMPLATES) => {
    const template = TEMPLATES[templateName]
    setNodes(template.nodes)
    setConnections(template.connections)
    setShowTemplateModal(false)

    // Animate all nodes
    gsap.fromTo(
      "[data-node-id]",
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }
    )
  }, [])

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, connections)
    }
  }, [nodes, connections, onSave])

  const handleTest = useCallback(() => {
    setIsPlaying(true)
    if (onTest) {
      onTest(nodes, connections)
    }

    // Simulate workflow execution
    let currentNode = nodes.find(n => n.type === "start")
    const executionOrder: Node[] = []

    while (currentNode) {
      executionOrder.push(currentNode)

      // Find next node
      const connection = connections.find(c => c.from === currentNode.id)
      if (connection) {
        currentNode = nodes.find(n => n.id === connection.to)
      } else {
        currentNode = null
      }
    }

    // Animate execution
    executionOrder.forEach((node, index) => {
      setTimeout(() => {
        gsap.to(`[data-node-id="${node.id}"]`, {
          scale: 1.1,
          boxShadow: "0 0 30px rgba(254, 237, 1, 0.5)",
          duration: 0.3,
          yoyo: true,
          repeat: 1
        })
      }, index * 1000)
    })

    setTimeout(() => {
      setIsPlaying(false)
    }, executionOrder.length * 1000)
  }, [nodes, connections, onTest])

  const renderConnection = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.from)
    const toNode = nodes.find(n => n.id === connection.to)

    if (!fromNode || !toNode) return null

    const fromX = fromNode.position.x + 200
    const fromY = fromNode.position.y + 40
    const toX = toNode.position.x
    const toY = toNode.position.y + 40

    const midX = (fromX + toX) / 2

    return (
      <svg
        key={connection.id}
        data-connection-id={connection.id}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0
        }}
      >
        <path
          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
          stroke="url(#gradient)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          className="opacity-60"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEED01" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0c0c10]">
      {/* Header */}
      <div className="bg-[#1a1a20] border-b border-[#FEED01]/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FEED01]" />
            PixelFlow Builder
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-3 py-1.5 bg-[#0c0c10] border border-[#FEED01]/20 rounded-lg text-sm text-gray-300 hover:border-[#FEED01] transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Templates
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={handleTest}
                disabled={isPlaying}
                className="px-4 py-2 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-lg font-medium hover:shadow-[#FEED01]/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isPlaying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Test
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#1a1a20] border border-[#FEED01]/20 rounded-lg text-white hover:border-[#FEED01] transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {!readOnly && (
        <div className="bg-[#0c0c10] border-b border-[#FEED01]/10 p-3 flex items-center gap-2 overflow-x-auto">
          {Object.entries(NODE_TYPES).map(([type, config]) => (
            <button
              key={type}
              onClick={() => handleAddNode(type as keyof typeof NODE_TYPES)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#1a1a20] to-[#0c0c10] border border-[#FEED01]/20 rounded-lg hover:border-[#FEED01] transition-all group"
            >
              <config.icon className={`w-4 h-4 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`} />
              <span className="text-sm text-gray-300 group-hover:text-white">{config.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-[radial-gradient(circle_at_50%_50%,#1a1a2005_0%,transparent_50%)]"
        onMouseMove={handleNodeDrag}
        onMouseUp={handleNodeDragEnd}
      >
        {/* Connections */}
        <div className="absolute inset-0 pointer-events-none">
          {connections.map(renderConnection)}
        </div>

        {/* Nodes */}
        {nodes.map((node) => {
          const NodeIcon = NODE_TYPES[node.type].icon
          const isSelected = selectedNode?.id === node.id

          return (
            <div
              key={node.id}
              data-node-id={node.id}
              className={`absolute cursor-pointer transition-all ${
                isSelected ? "z-10" : "z-1"
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: "200px"
              }}
              onMouseDown={(e) => handleNodeDragStart(node, e)}
              onClick={() => setSelectedNode(node)}
            >
              <motion.div
                className={`relative bg-gradient-to-r ${NODE_TYPES[node.type].color} p-4 rounded-xl shadow-lg ${
                  isSelected ? "ring-2 ring-[#FEED01] ring-offset-2 ring-offset-[#0c0c10]" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Drag Handle */}
                {!readOnly && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 p-1 cursor-grab active:cursor-grabbing opacity-0 hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Node Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <NodeIcon className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">{node.data.label}</span>
                  </div>
                  {!readOnly && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNode(node.id)
                      }}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>

                {/* Node Content */}
                {node.data.content && (
                  <p className="text-xs text-white/80 line-clamp-2">{node.data.content}</p>
                )}

                {/* Node Tools */}
                {node.data.tools && node.data.tools.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {node.data.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/20 rounded text-xs text-white"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Connection Point */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FEED01] rounded-full border-2 border-[#0c0c10]" />
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Choose Template</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadTemplate(key as keyof typeof TEMPLATES)}
                    className="w-full p-4 bg-[#0c0c10] border border-[#FEED01]/20 rounded-xl hover:border-[#FEED01] transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{template.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {template.nodes.length} nodes · {template.connections.length} connections
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#FEED01]" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
