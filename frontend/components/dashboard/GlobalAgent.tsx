"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot, X, Send, Minimize2, Maximize2, Sparkles,
  ChevronUp, ChevronDown, Loader2, CheckCircle, AlertCircle
} from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "action" | "suggestion" | "error"
  actionData?: any
}

interface GlobalAgentProps {
  userId?: string
  agentId?: string
  context?: string
  onAction?: (action: string, data: any) => void
}

export default function GlobalAgent({
  userId,
  agentId,
  context = "dashboard",
  onAction
}: GlobalAgentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant. I can help you build, test, and deploy AI agents. What would you like to do today?",
      timestamp: new Date(),
      type: "text"
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useGSAP(() => {
    if (containerRef.current) {
      gsap.from(containerRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.7)"
      })
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      type: "text"
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)
    setIsTyping(true)

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const response = generateAIResponse(inputValue, context)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
      setIsProcessing(false)
    }, 1500)
  }

  const generateAIResponse = (input: string, currentContext: string): Message => {
    const lowerInput = input.toLowerCase()

    // Context-aware responses
    if (lowerInput.includes("create") || lowerInput.includes("build") || lowerInput.includes("new agent")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "I can help you create a new AI agent! Let me guide you through the process:\n\n1. **Agent Type**: What type of agent do you need? (Outbound caller, Inbound receiver, or Both)\n2. **Purpose**: What should this agent accomplish?\n3. **Voice**: Which voice personality fits your brand?\n\nWould you like me to start with a template or build from scratch?",
        timestamp: new Date(),
        type: "suggestion",
        actionData: {
          action: "create_agent",
          suggestions: [
            { label: "Sales Agent", description: "Outbound calling for lead generation" },
            { label: "Support Agent", description: "Inbound customer support" },
            { label: "Custom Agent", description: "Build from scratch" }
          ]
        }
      }
    }

    if (lowerInput.includes("test") || lowerInput.includes("try")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "Great! Let's test your agent. I can help you:\n\n• **Voice Test**: Test the agent's voice and responses\n• **Call Simulation**: Simulate a conversation\n• **WhatsApp Test**: Test WhatsApp integration\n\nWhich would you like to try?",
        timestamp: new Date(),
        type: "action",
        actionData: {
          action: "test_agent",
          options: [
            { label: "Voice Test", icon: "🎤" },
            { label: "Call Simulation", icon: "📞" },
            { label: "WhatsApp Test", icon: "💬" }
          ]
        }
      }
    }

    if (lowerInput.includes("deploy") || lowerInput.includes("launch")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "Ready to deploy! Before we go live, let me run a quick checklist:\n\n✅ Agent configuration saved\n✅ Voice settings configured\n✅ Knowledge base connected\n✅ Testing completed\n\nEverything looks good! Would you like to deploy to **Test Environment** or **Production**?",
        timestamp: new Date(),
        type: "action",
        actionData: {
          action: "deploy_agent",
          options: [
            { label: "Test Environment", description: "Safe testing environment" },
            { label: "Production", description: "Live deployment" }
          ]
        }
      }
    }

    if (lowerInput.includes("help") || lowerInput.includes("what can you do")) {
      return {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm here to help you with everything related to AI agents! Here's what I can do:\n\n🤖 **Agent Building**\n• Create new agents from templates\n• Configure voice and behavior\n• Design conversation workflows\n\n🧪 **Testing & Quality**\n• Run voice tests\n• Simulate conversations\n• Review performance metrics\n\n🚀 **Deployment**\n• Deploy to test/production\n• Monitor live performance\n• Handle scaling\n\n📊 **Analytics**\n• Track agent performance\n• Analyze call data\n• Generate reports\n\nWhat would you like to work on?",
        timestamp: new Date(),
        type: "text"
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: `I understand you're asking about "${input}". Let me help you with that.\n\nCould you provide more details about what you'd like to accomplish? I can assist with:\n• Building and configuring agents\n• Testing and deployment\n• Analytics and performance\n• Troubleshooting issues`,
      timestamp: new Date(),
      type: "text"
    }
  }

  const handleActionClick = (action: string, data: any) => {
    if (onAction) {
      onAction(action, data)
    }

    const actionMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `Great choice! I'm ${action === "create_agent" ? "setting up" : action === "test_agent" ? "preparing" : "initiating"} ${data.label || action}...`,
      timestamp: new Date(),
      type: "action"
    }

    setMessages(prev => [...prev, actionMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black p-4 rounded-full shadow-2xl hover:shadow-[#FEED01]/30 transition-all duration-300"
        >
          <Bot className="w-6 h-6" />
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      )}

      {/* Agent Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "back.out(1.7)" }}
            className={`fixed bottom-6 right-6 z-50 bg-[#0c0c10] border border-[#FEED01]/20 rounded-2xl shadow-2xl overflow-hidden ${
              isMinimized ? "h-16" : "h-[600px]"
            } w-[400px]`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FEED01]/10 to-[#FFD700]/10 border-b border-[#FEED01]/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="w-6 h-6 text-[#FEED01]" />
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-gray-400">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-[#FEED01]/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-400" /> : <Minimize2 className="w-4 h-4 text-gray-400" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <div className="h-[calc(100%-8rem)] overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black"
                          : "bg-[#1a1a20] text-white border border-[#FEED01]/10"
                      }`}
                    >
                      {message.type === "action" && message.actionData?.options && (
                        <div className="space-y-2 mb-2">
                          {message.actionData.options.map((option: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(message.actionData?.action, option)}
                              className="w-full text-left p-3 bg-[#0c0c10] rounded-lg hover:bg-[#FEED01]/10 transition-colors border border-[#FEED01]/20"
                            >
                              <div className="flex items-center gap-2">
                                {option.icon && <span>{option.icon}</span>}
                                <span className="font-medium">{option.label}</span>
                              </div>
                              {option.description && (
                                <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {message.type === "suggestion" && message.actionData?.suggestions && (
                        <div className="space-y-2 mb-2">
                          {message.actionData.suggestions.map((suggestion: any, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(message.actionData?.action, suggestion)}
                              className="w-full text-left p-3 bg-[#0c0c10] rounded-lg hover:bg-[#FEED01]/10 transition-colors border border-[#FEED01]/20"
                            >
                              <div className="font-medium">{suggestion.label}</div>
                              <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
                            </button>
                          ))}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <div className="text-xs mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[#1a1a20] text-white border border-[#FEED01]/10 rounded-2xl p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#FEED01] animate-spin" />
                        <span className="text-sm text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            {!isMinimized && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0c0c10] border-t border-[#FEED01]/20">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Ask me anything..."
                      disabled={isProcessing}
                      className="w-full bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FEED01] transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isProcessing}
                    className="p-3 bg-gradient-to-r from-[#FEED01] to-[#FFD700] text-black rounded-xl hover:shadow-[#FEED01]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
