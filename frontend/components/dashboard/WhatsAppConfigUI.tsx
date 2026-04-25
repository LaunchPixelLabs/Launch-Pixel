'use client'

import React, { useState, useEffect } from 'react'
import { 
  MessageCircle, CheckCircle2, Loader2, QrCode, RefreshCw, 
  Wifi, Shield, Smartphone, Terminal, Send, Activity
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface WhatsAppConfigUIProps {
  userId?: string;
  agentId?: string;
  apiBase?: string;
}

export default function WhatsAppConfigUI({ userId, agentId, apiBase }: WhatsAppConfigUIProps) {
  const [status, setStatus] = useState<string>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [logs, setLogs] = useState<{ id: string, msg: string, time: string, type: 'in' | 'out' }[]>([
    { id: '1', msg: 'Neural Matrix standby...', time: 'INIT', type: 'out' }
  ]);

  const API_BASE = apiBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchStatus = async () => {
    if (!agentId) return;
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/status/${agentId}`)
      const data = await res.json()
      setStatus(data.status)
      if (data.status === "connected") setQr(null)
    } catch (e) {
      console.error("Failed to fetch status", e)
    }
  }

  const fetchQR = async () => {
    if (!agentId) return;
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/qr/${agentId}`)
      const data = await res.json()
      if (data.qr) setQr(data.qr)
      setStatus(data.status)
    } catch (e) {
      console.error("Failed to fetch QR", e)
    }
  }

  const handleConnectDirect = async () => {
    if (!agentId) return;
    setLoadingQR(true)
    try {
      await fetch(`${API_BASE}/api/whatsapp/connect/${agentId}`, { method: "POST" })
      setLogs(prev => [{ id: Date.now().toString(), msg: 'Initializing synaptic handshake...', time: new Date().toLocaleTimeString(), type: 'out' }, ...prev])
      setTimeout(fetchQR, 2000)
    } catch (e) {
      console.error("Failed to connect", e)
      toast.error("Failed to initiate Matrix Uplink.")
    } finally {
      setLoadingQR(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(() => {
      if (status !== "connected") fetchQR()
      else fetchStatus()
    }, 5000)
    return () => clearInterval(interval)
  }, [status, agentId])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEED01]/10 border border-[#FEED01]/20 text-[#FEED01] text-[10px] font-bold uppercase tracking-[0.2em]">
            <Activity className="w-3 h-3 animate-pulse" />
            Live Neural Uplink
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">WhatsApp Matrix</h2>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest max-w-lg leading-relaxed">
            Synchronize your physical node with the Sales Monster brain for autonomous out-of-band communication.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#0d0d0f] p-4 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Node Status</p>
            <p className={`text-xs font-black uppercase ${status === 'connected' ? 'text-emerald-400' : 'text-[#FEED01]'}`}>
              {status.toUpperCase()}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#FEED01]/10 text-[#FEED01]'}`}>
            <Wifi className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Pairing Matrix */}
        <div className="lg:col-span-5 bg-[#0d0d0f] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#FEED0105_0%,transparent_50%)]" />
          
          <AnimatePresence mode="wait">
            {status === "connected" ? (
              <motion.div 
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 relative z-10"
              >
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                  <div className="relative w-32 h-32 bg-zinc-950 border-2 border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Uplink Stable</h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Continuous neural sync active</p>
                </div>
              </motion.div>
            ) : qr ? (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 relative z-10"
              >
                <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(254,237,1,0.15)] relative group-hover:scale-105 transition-transform duration-500">
                  <QRCodeSVG value={qr} size={200} level="H" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black text-[#FEED01] text-[10px] font-black tracking-[0.2em] rounded-full border border-[#FEED01]/30 uppercase shadow-2xl">
                    Scan Matrix
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
                  Devices {'>'} Link Device {'>'} Scan to initialize link.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8 relative z-10"
              >
                <div className="w-24 h-24 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center mx-auto group-hover:border-[#FEED01]/30 transition-colors">
                  <QrCode className="w-10 h-10 text-zinc-700 group-hover:text-[#FEED01] transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">Awaiting Uplink</h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Request pairing code from server</p>
                </div>
                <button 
                  onClick={handleConnectDirect}
                  disabled={loadingQR}
                  className="bg-[#FEED01] text-black font-black italic tracking-tighter px-10 py-5 rounded-2xl text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(254,237,1,0.2)] active:scale-95 uppercase"
                >
                  {loadingQR ? <Loader2 className="animate-spin" /> : "Initialize Uplink"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Neural Log Matrix */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex-1 bg-[#0d0d0f] border border-white/5 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Neural Uplink Log</h3>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar font-mono">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 group">
                  <span className="text-[9px] text-zinc-700 font-bold shrink-0">{log.time}</span>
                  <div className="flex items-start gap-2">
                    {log.type === 'out' ? <Send className="w-3 h-3 text-[#FEED01] mt-0.5" /> : <Activity className="w-3 h-3 text-blue-400 mt-0.5" />}
                    <p className="text-[10px] text-zinc-400 group-hover:text-zinc-200 transition-colors leading-relaxed">
                      <span className="text-zinc-600">[{log.type.toUpperCase()}]</span> {log.msg}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Encryption: AES-256-GCM</p>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase">Uplink Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0d0d0f] border border-white/5 p-5 rounded-3xl group cursor-pointer hover:border-[#FEED01]/20 transition-all">
              <Shield className="w-4 h-4 text-[#FEED01] mb-3" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">HITL Protocol</p>
              <p className="text-[11px] font-bold text-white uppercase italic">Human Approval On</p>
            </div>
            <div className="bg-[#0d0d0f] border border-white/5 p-5 rounded-3xl group cursor-pointer hover:border-[#FEED01]/20 transition-all">
              <Smartphone className="w-4 h-4 text-[#FEED01] mb-3" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Persistence</p>
              <p className="text-[11px] font-bold text-white uppercase italic">Active Background</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
