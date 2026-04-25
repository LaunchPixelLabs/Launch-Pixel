'use client'

import React, { useState, useEffect } from 'react'
import { PhoneOutgoing, Loader2, Phone, MessageSquare, Send, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Agent {
  id: string;
  name: string;
}

export default function TestAgentUI() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  
  // Modes: phone, chat, whatsapp
  const [activeMode, setActiveMode] = useState<'phone' | 'chat' | 'whatsapp'>('phone')

  // Phone state
  const [isCalling, setIsCalling] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatting, setIsChatting] = useState(false)

  useEffect(() => {
    // Fetch user's agents
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const res = await fetch(`${API_BASE}/api/agent-configurations`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          setAgents(data.configurations || [])
          if (data.configurations && data.configurations.length > 0) {
            setSelectedAgent(data.configurations[0].id)
          }
        }
      } catch (e) {
        console.error("Failed to fetch agents", e)
      }
    }
    fetchAgents()
  }, [])

  const handleTestCall = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a destination phone number")
      return
    }
    
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Please enter a valid phone number with country code (e.g., +1234567890)")
      return
    }

    setIsCalling(true)
    try {
      const token = localStorage.getItem("auth_token")
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }

      const res = await fetch(`${API_BASE}/api/call/test-outbound`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          to: phoneNumber,
          agentId: selectedAgent || undefined
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success("Call initiated! Your phone should ring shortly.")
        setPhoneNumber('')
      } else {
        toast.error(`Failed to initiate call: ${data.message || data.error}`)
      }
    } catch (e) {
      console.error(e)
      toast.error("Error connecting to server to initiate test call.")
    } finally {
      setIsCalling(false)
    }
  }

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsChatting(true);

    try {
      const token = localStorage.getItem("auth_token")
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }

      const res = await fetch(`${API_BASE}/api/call/chat-simulate`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage,
          agentId: selectedAgent || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChatMessages(prev => [...prev, { role: 'agent', text: data.message }]);
      } else {
        toast.error(`Agent failed to respond: ${data.message || data.error}`);
        setChatMessages(prev => [...prev, { role: 'agent', text: "⚠️ Error generating response." }]);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error communicating with simulator endpoint.");
      setChatMessages(prev => [...prev, { role: 'agent', text: "⚠️ Connection error." }]);
    } finally {
      setIsChatting(false);
    }
  }

  const handleWhatsAppTest = () => {
    if (!phoneNumber) {
      toast.error("Please enter a destination phone number");
      return;
    }
    // For now, prompt the user that WhatsApp sandbox is required.
    toast.info("WhatsApp Sandbox is not fully configured yet. Please activate it in your Twilio Dashboard first.");
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Universal Agent Simulator</h2>
          <p className="text-zinc-400">Test your AI agent across Voice, Text, and WhatsApp before deploying to production.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8 relative overflow-hidden group mb-6">
        <div className="relative space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Select Agent to Test</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[var(--lp-accent)]/50 transition-all"
            >
              <option value="">Default Agent (Fallback)</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button 
          onClick={() => setActiveMode('phone')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
            activeMode === 'phone' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-black/40 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          <Phone className="w-4 h-4" /> Phone Call
        </button>
        <button 
          onClick={() => setActiveMode('chat')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
            activeMode === 'chat' ? 'bg-[var(--lp-accent)]/20 text-[var(--lp-accent)] border border-[var(--lp-accent)]/30' : 'bg-black/40 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Web Chat
        </button>
        <button 
          onClick={() => setActiveMode('whatsapp')}
          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${
            activeMode === 'whatsapp' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-black/40 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
          }`}
        >
          <Smartphone className="w-4 h-4" /> WhatsApp
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--lp-accent)]/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          {activeMode === 'phone' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Destination Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">Include country code. Twilio will dial this number immediately.</p>
              </div>

              <button
                onClick={handleTestCall}
                disabled={isCalling}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium px-6 py-4 rounded-xl hover:from-indigo-400 hover:to-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initiating Call...
                  </>
                ) : (
                  <>
                    <PhoneOutgoing className="w-5 h-5" />
                    Make Test Call
                  </>
                )}
              </button>
            </div>
          )}

          {activeMode === 'chat' && (
            <div className="flex flex-col h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p>Start a conversation to test your agent's knowledge.</p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user' 
                          ? 'bg-[var(--lp-accent)] text-white rounded-br-sm' 
                          : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-zinc-700'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    </div>
                  </div>
                )}
              </div>
              <div className="relative mt-auto">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Type a message to your agent..."
                  className="w-full bg-black/40 border border-zinc-800 rounded-xl pl-4 pr-12 py-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[var(--lp-accent)]/50"
                />
                <button 
                  onClick={handleChatSend}
                  disabled={isChatting || !chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[var(--lp-accent)] text-white rounded-lg hover:bg-[var(--lp-accent)]/80 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeMode === 'whatsapp' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Destination WhatsApp Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">Include country code. Ensure your number is opted-in to the Twilio WhatsApp Sandbox.</p>
              </div>

              <button
                onClick={handleWhatsAppTest}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium px-6 py-4 rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]"
              >
                <MessageSquare className="w-5 h-5" />
                Send Test WhatsApp Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
