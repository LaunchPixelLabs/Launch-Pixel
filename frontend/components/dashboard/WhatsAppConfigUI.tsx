'use client'
import React, { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle2, Loader2, QrCode, RefreshCw, Wifi, Shield, Smartphone } from 'lucide-react'
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
  const [isSaving, setIsSaving] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const API_BASE = apiBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/status`)
      const data = await res.json()
      setStatus(data.status)
      if (data.status === "connected") setQr(null)
    } catch (e) {
      console.error("Failed to fetch status", e)
    }
  }

  const fetchQR = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/qr`)
      const data = await res.json()
      if (data.qr) setQr(data.qr)
      setStatus(data.status)
    } catch (e) {
      console.error("Failed to fetch QR", e)
    }
  }

  const handleConnectDirect = async () => {
    setLoadingQR(true)
    try {
      await fetch(`${API_BASE}/api/whatsapp/connect`, { method: "POST" })
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
  }, [status])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em]">
          <Wifi className="w-3 h-3 animate-pulse" />
          Synaptic WhatsApp Uplink
        </div>
        <h2 className="text-5xl font-sketch text-white tracking-tight">WhatsApp Matrix</h2>
        <p className="text-zinc-500 font-sketch max-w-lg mx-auto leading-relaxed">
          Uplink your physical device to the AI Matrix. This allows your agent to send messages, request approvals, and maintain human-in-the-loop synchronization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Connection Card */}
        <div className="bg-zinc-900/40 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Smartphone className="w-32 h-32 text-white" />
          </div>
          
          <AnimatePresence mode="wait">
            {status === "connected" ? (
              <motion.div 
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 bg-zinc-950 border border-emerald-500/50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-sketch text-white">Node Synchronized</h3>
                  <p className="text-sm text-zinc-500 font-sketch">Matrix Uplink is active and stable.</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">ENCRYPTED</Badge>
              </motion.div>
            ) : qr ? (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="p-6 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] relative">
                  <QRCodeSVG value={qr} size={220} />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black text-white text-[9px] font-bold tracking-widest rounded-full border border-white/10 uppercase">
                    Scan to Synchronize
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-sketch max-w-[200px] mx-auto">
                  Open WhatsApp on your phone {'>'} Settings {'>'} Linked Devices {'>'} Link a Device.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8"
              >
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl border border-white/5 flex items-center justify-center mx-auto">
                  <QrCode className="w-10 h-10 text-zinc-700" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-sketch text-white">Awaiting Uplink</h3>
                  <p className="text-sm text-zinc-500 font-sketch">Generate a pairing code to link your device.</p>
                </div>
                <Button 
                  onClick={handleConnectDirect}
                  disabled={loadingQR}
                  className="bg-[#FEED01] text-black font-black px-10 py-7 rounded-2xl text-base hover:scale-105 transition-all shadow-[0_0_30px_rgba(254,237,1,0.2)]"
                >
                  {loadingQR ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-3 w-5 h-5" />}
                  INITIALIZE UPLINK
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Configuration/Info Card */}
        <div className="space-y-6">
          <div className="bg-zinc-950/60 border border-white/5 rounded-[2.5rem] p-8 space-y-8 h-full flex flex-col">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#FEED01] font-bold text-[10px] uppercase tracking-widest">
                <Shield className="w-4 h-4" />
                Matrix Protocols
              </div>
              <h3 className="text-2xl font-sketch text-white">Uplink Capabilities</h3>
            </div>

            <div className="space-y-6 flex-1">
              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#FEED01]/50 transition-colors">
                  <MessageCircle className="w-6 h-6 text-[#FEED01]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-sketch">Neural Messaging</h4>
                  <p className="text-xs text-zinc-500 font-sketch leading-relaxed">Agent can send follow-up materials, links, and documents instantly after a call.</p>
                </div>
              </div>

              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#FEED01]/50 transition-colors">
                  <Shield className="w-6 h-6 text-[#FEED01]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-sketch">Human Approval (HITL)</h4>
                  <p className="text-xs text-zinc-500 font-sketch leading-relaxed">Matrix will ping your device for approval on sensitive operations or discounts.</p>
                </div>
              </div>

              <div className="flex gap-5 group cursor-default">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-[#FEED01]/50 transition-colors">
                  <Smartphone className="w-6 h-6 text-[#FEED01]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-sketch">Device Persistence</h4>
                  <p className="text-xs text-zinc-500 font-sketch leading-relaxed">Uplink remains active even when the dashboard is closed or the user is offline.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                <span>Node Identity</span>
                <span>{userId?.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
