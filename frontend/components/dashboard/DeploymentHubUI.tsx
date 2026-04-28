'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Phone, MessageSquare, Smartphone, Loader2, Bot, User, Cpu, Activity, Zap, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import gsap from 'gsap'

const API_BASE = process.env.NEXT_PUBLIC_NODE_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://launch-pixel-backend.onrender.com"

function GlassOrb() {
  return (
    <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] pointer-events-none opacity-20 z-0">
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[var(--lp-accent)] to-transparent blur-[100px] animate-pulse" />
    </div>
  )
}

interface Agent {
  id: string;
  name: string;
}

interface Message {
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
}

export default function DeploymentHubUI({ currentUser }: { currentUser: any }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  
  // Unified interface state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  
  // Connection states
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [isWhatsAppActive, setIsWhatsAppActive] = useState(true)

  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Fetch agents on load
  useEffect(() => {
    const fetchAgents = async () => {
      if (!currentUser) return;
      try {
        const token = await currentUser.getIdToken();
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
    
    // GSAP Entrance
    gsap.from(".hub-animate-in", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power4.out"
    })
  }, [currentUser])

  // Load chat history & animate entrance
  useEffect(() => {
    if (selectedAgent) {
      const saved = localStorage.getItem(`deployed_chatHistory_${selectedAgent}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved).map((m: any) => ({...m, timestamp: new Date(m.timestamp)}))
          setMessages(parsed);
        } catch (e) {
          console.error("Failed to parse history", e);
          setMessages([]);
        }
      } else {
        setMessages([{
          role: 'system',
          text: `Agent initialized. Connected to Knowledge Base & Engine. Ready for direct interaction.`,
          timestamp: new Date()
        }]);
      }
    }
  }, [selectedAgent]);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent) return;
    
    const userMsg: Message = { role: 'user', text: inputMessage.trim(), timestamp: new Date() };
    setMessages(prev => {
      const newMessages = [...prev, userMsg];
      localStorage.setItem(`deployed_chatHistory_${selectedAgent}`, JSON.stringify(newMessages));
      return newMessages;
    });
    
    setInputMessage('');
    setIsProcessing(true);
    const startTime = Date.now();

    // Placeholder for stream
    setMessages(prev => [...prev, { role: 'agent', text: '', timestamp: new Date() }]);

    try {
      const token = currentUser ? await currentUser.getIdToken() : null;
      
      const formattedHistory = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'agent' ? 'assistant' : m.role,
        content: m.text
      }));

      const res = await fetch(`${API_BASE}/api/call/chat-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: userMsg.text,
          agentId: selectedAgent,
          history: formattedHistory
        })
      });

      if (!res.ok || !res.body) throw new Error("Stream connection failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text !== undefined) {
                fullText += data.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...updated[updated.length - 1], text: fullText };
                  return updated;
                });
              }
              if (data.message && !data.text) {
                fullText += `\n[System]: ${data.message}`;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...updated[updated.length - 1], text: fullText };
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }

      setLatency(Date.now() - startTime);
      
      // Save final state
      setMessages(prev => {
        localStorage.setItem(`deployed_chatHistory_${selectedAgent}`, JSON.stringify(prev));
        return prev;
      });

    } catch (e) {
      console.error(e);
      toast.error("Agent execution failed");
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], text: "⚠️ Connection error or Agent Timeout." };
        return updated;
      });
    } finally {
      setIsProcessing(false);
    }
  }

  const clearChat = () => {
    setMessages([{ role: 'system', text: 'Conversation reset.', timestamp: new Date() }]);
    localStorage.removeItem(`deployed_chatHistory_${selectedAgent}`);
    setLatency(null);
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col relative">
      <GlassOrb />
      <div className="flex items-center justify-between mb-6 flex-shrink-0 z-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 hub-animate-in">
            Deployed Hub <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </h2>
          <p className="text-zinc-400 mt-1 hub-animate-in">Live production interaction, super-intelligence memory, and unified monitoring.</p>
        </div>
        
        <div className="flex gap-4 items-center hub-animate-in">
          <div className="bg-black/40 border border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Engine</span>
            {latency ? (
              <span className={`text-sm font-mono ${latency < 1000 ? 'text-green-400' : latency < 3000 ? 'text-yellow-400' : 'text-red-400'}`}>
                {latency}ms
              </span>
            ) : (
              <span className="text-sm font-mono text-zinc-600">-- ms</span>
            )}
          </div>
          
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-black/60 border border-[var(--lp-accent)]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--lp-accent)]/50 transition-all cursor-pointer backdrop-blur-md"
          >
            {agents.length === 0 && <option value="">Loading agents...</option>}
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Main Chat Interface */}
        <div className="flex-1 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex flex-col relative overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--lp-accent)]/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-black/20 z-10">
            <div className="flex items-center gap-3">
              <div className="bg-[var(--lp-accent)]/20 p-2 rounded-lg">
                <Bot className="w-5 h-5 text-[var(--lp-accent)]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Live Terminal</h3>
                <p className="text-xs text-zinc-400">Claude/OpenAI Multi-Agent Engine</p>
              </div>
            </div>
            <button onClick={clearChat} className="text-xs text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5">
              Reset Session
            </button>
          </div>

          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  {msg.role === 'system' ? (
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-full px-4 py-1.5 flex items-center gap-2 backdrop-blur-sm">
                      <ShieldCheck className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs text-zinc-400">{msg.text}</span>
                    </div>
                  ) : (
                    <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500/20' : 'bg-[var(--lp-accent)]/20'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-400" /> : <Bot className="w-4 h-4 text-[var(--lp-accent)]" />}
                      </div>
                      <div className={`rounded-2xl px-5 py-3.5 backdrop-blur-md shadow-lg ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm' 
                          : 'bg-zinc-800/80 text-zinc-200 rounded-tl-sm border border-zinc-700/50'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[10px] opacity-40 mt-2 block w-full text-right">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-[var(--lp-accent)]/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[var(--lp-accent)]" />
                </div>
                <div className="bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 bg-black/40 border-t border-zinc-800/50 z-10">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Message your agent or use /train to feed knowledge..."
                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl pl-4 pr-14 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--lp-accent)]/50 transition-all shadow-inner"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isProcessing || !inputMessage.trim()}
                className="absolute right-2 p-2.5 bg-[var(--lp-accent)] text-black rounded-lg hover:bg-[var(--lp-accent)]/90 transition-colors disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 text-center mt-3">
              This is the live production engine. Responses are driven by actual agent memory and tools.
            </p>
          </div>
        </div>

        {/* Live Metrics & Integrations Sidebar */}
        <div className="w-80 flex flex-col gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Active Channels
            </h3>
            
            <div className="space-y-3">
              <div className="bg-black/30 border border-zinc-800 rounded-xl p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-white">Web Chat</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>

              <div className="bg-black/30 border border-zinc-800 rounded-xl p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-lg">
                    <Smartphone className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">WhatsApp</span>
                    <span className="text-[10px] text-zinc-500 block">Autonomy Active</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsWhatsAppActive(!isWhatsAppActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isWhatsAppActive ? 'bg-green-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isWhatsAppActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="bg-black/30 border border-zinc-800 rounded-xl p-3 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <Phone className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white block">Voice Call</span>
                    <span className="text-[10px] text-zinc-500 block">11Labs Relaying</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVoiceActive(!isVoiceActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isVoiceActive ? 'bg-purple-500' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isVoiceActive ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl flex-1">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--lp-accent)]" /> Autonomy Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">RAG Memory Sync</span>
                  <span className="text-emerald-400">Synced</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Context Window</span>
                  <span className="text-zinc-300">4k / 128k</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--lp-accent)] w-[5%]" />
                </div>
              </div>
              
          </div>
          
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-xl flex-[1.5] flex flex-col overflow-hidden">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Learning Log
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              <div className="border-l-2 border-emerald-500/30 pl-3 py-1">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Fact Extracted</p>
                <p className="text-[11px] text-zinc-300 leading-snug">"Customer prefers Friday call-backs."</p>
                <span className="text-[8px] text-zinc-600">Source: WhatsApp</span>
              </div>
              <div className="border-l-2 border-[var(--lp-accent)]/30 pl-3 py-1">
                <p className="text-[10px] text-[var(--lp-accent)] font-bold uppercase tracking-tighter">Rule Updated</p>
                <p className="text-[11px] text-zinc-300 leading-snug">Added rejection handler for 'Out of budget'.</p>
                <span className="text-[8px] text-zinc-600">Source: Admin Direct</span>
              </div>
              <div className="border-l-2 border-blue-500/30 pl-3 py-1">
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Knowledge Synced</p>
                <p className="text-[11px] text-zinc-300 leading-snug">Pricing PDF v2.1 successfully indexed.</p>
                <span className="text-[8px] text-zinc-600">Source: Webhook</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">Auto-Refining Intelligence</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-[var(--lp-accent)] animate-ping" />
                <div className="w-1 h-1 rounded-full bg-[var(--lp-accent)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
