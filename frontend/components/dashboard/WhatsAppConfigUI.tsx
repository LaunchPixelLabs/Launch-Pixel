'use client'
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Phone, CheckCircle2, ShieldAlert, Loader2, Power, PowerOff, QrCode, RefreshCw, AlertCircle } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"

interface WhatsAppConfigUIProps {
  userId?: string;
  agentId?: string;
  apiBase?: string;
}

export default function WhatsAppConfigUI({ userId, agentId, apiBase }: WhatsAppConfigUIProps) {
  const [mode, setMode] = useState<'twilio' | 'direct'>('twilio')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [status, setStatus] = useState<string>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);

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
    } finally {
      setLoadingQR(false)
    }
  }

  useEffect(() => {
    if (mode === 'direct') {
      fetchStatus()
      const interval = setInterval(() => {
        if (status !== "connected") fetchQR()
        else fetchStatus()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [mode, status])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${API_BASE}/api/agent-configurations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          whatsappNumber: whatsappNumber || null,
          whatsappEnabled,
          whatsappMode: mode
        }),
      })
      if (res.ok) toast.success('WhatsApp configuration saved!')
    } catch (err) {
      toast.error('Failed to save configuration.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
        <button 
          onClick={() => setMode('twilio')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'twilio' ? 'bg-white text-black' : 'text-zinc-500'}`}
        >
          Cloud API (Twilio)
        </button>
        <button 
          onClick={() => setMode('direct')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${mode === 'direct' ? 'bg-[var(--lp-accent)] text-black' : 'text-zinc-500'}`}
        >
          Direct Matrix (Sketch)
        </button>
      </div>

      {mode === 'twilio' ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Twilio Integration</h3>
                  <p className="text-sm text-zinc-400">Enterprise-grade cloud messaging</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${whatsappEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`} onClick={() => setWhatsappEnabled(!whatsappEnabled)}>
                   <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${whatsappEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
                </div>
             </div>
             <div className="space-y-4">
                <label className="text-sm font-semibold text-zinc-400">Recipient Number (E.164)</label>
                <input 
                  type="tel" 
                  value={whatsappNumber} 
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+14155552671"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-mono focus:border-emerald-500/50 outline-none"
                />
             </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-sketch text-[#FEED01] mb-2 tracking-tight">Matrix Pairing</h3>
                  <p className="text-sm text-zinc-400">Peer-to-peer device synchronization</p>
                </div>
                <Badge className={status === "connected" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-zinc-800"}>
                  {status.toUpperCase()}
                </Badge>
             </div>

             <div className="flex flex-col items-center py-10">
                <AnimatePresence mode="wait">
                   {status === "connected" ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h4 className="text-2xl font-bold text-white">Device Synced</h4>
                        <p className="text-zinc-500 mt-2">Your AI agent is now operating through your phone.</p>
                      </div>
                   ) : qr ? (
                      <div className="bg-white p-6 rounded-2xl">
                        <QRCodeSVG value={qr} size={200} />
                        <p className="text-black text-[10px] mt-4 font-bold text-center">SCAN TO UPLINK</p>
                      </div>
                   ) : (
                      <Button 
                        onClick={handleConnectDirect} 
                        className="bg-[var(--lp-accent)] text-black font-black px-10 py-8 rounded-2xl text-lg hover:scale-105 transition-transform"
                      >
                        {loadingQR ? <Loader2 className="animate-spin mr-2" /> : <QrCode className="mr-3" />}
                        GENERATE MATRIX QR
                      </Button>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </motion.div>
      )}

      <Button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full bg-white text-black font-bold py-6 rounded-2xl text-lg hover:bg-zinc-200"
      >
        {isSaving ? <Loader2 className="animate-spin" /> : "Sync All Settings"}
      </Button>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${className}`}>{children}</span>
}
