'use client'
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Phone, CheckCircle2, ShieldAlert, Loader2, Power, PowerOff } from 'lucide-react'
import gsap from 'gsap'
import { toast } from 'sonner'

interface WhatsAppConfigUIProps {
  userId?: string;
  agentId?: string;
  apiBase?: string;
}

export default function WhatsAppConfigUI({ userId, agentId, apiBase }: WhatsAppConfigUIProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const API_BASE = apiBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // Load existing config on mount
  useEffect(() => {
    if (!userId) return
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/agent-configurations?userId=${userId}`)
        const data = await res.json()
        if (data.configurations && data.configurations.length > 0) {
          const config = data.configurations[0]
          setWhatsappNumber(config.whatsappNumber || '')
          setWhatsappEnabled(config.whatsappEnabled || false)
        }
        setIsLoaded(true)
      } catch (err) {
        console.error('Failed to load WhatsApp config:', err)
        setIsLoaded(true)
      }
    }
    fetchConfig()
  }, [userId, API_BASE])

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current.children, 
        { opacity: 0, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
      )
    }
  }, [])

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d+]/g, '')
    // Auto-add + prefix if missing
    if (value.length > 0 && !value.startsWith('+')) {
      value = '+' + value
    }
    setWhatsappNumber(value)
  }

  const handleSave = async () => {
    if (whatsappEnabled && !whatsappNumber) {
      toast.error('Please enter your WhatsApp number first.')
      return
    }

    // Validate E.164 format
    if (whatsappEnabled && whatsappNumber && !/^\+[1-9]\d{1,14}$/.test(whatsappNumber)) {
      toast.error('Invalid number format. Use international format: +919876543210')
      return
    }

    setIsSaving(true)
    try {
      // Save WhatsApp config by updating the agent configuration
      const res = await fetch(`${API_BASE}/api/agent-configurations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          agentType: 'outbound', // default
          elevenLabsAgentId: agentId || 'default',
          name: 'Default Agent',
          systemPrompt: 'default', // won't overwrite if config exists
          voiceId: 'default',
          whatsappNumber: whatsappNumber || null,
          whatsappEnabled,
        }),
      })

      if (res.ok) {
        toast.success(whatsappEnabled 
          ? `WhatsApp alerts enabled! Reports will be sent to ${whatsappNumber}`
          : 'WhatsApp alerts disabled.'
        )
      } else {
        const error = await res.json()
        toast.error('Failed to save: ' + (error.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save WhatsApp configuration.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl max-w-4xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-400 p-[1px] mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
           <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
             <MessageCircle className="w-8 h-8 text-emerald-400" />
           </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">WhatsApp Notifications</h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Get instant WhatsApp alerts after every qualifying call. Hot leads, booked meetings, and follow-ups — delivered straight to your phone.
        </p>
      </div>

      <div ref={panelRef} className="space-y-6">
        {/* How it works */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Enter your number', desc: 'Your WhatsApp number in international format (+91...)' },
              { step: '2', title: 'Agent calls a lead', desc: 'Your AI agent calls contacts from your list automatically' },
              { step: '3', title: 'Get instant alerts', desc: 'Hot leads & meetings get sent to your WhatsApp in real-time' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">{item.step}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-black/60 border border-white/5 rounded-2xl p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {whatsappEnabled ? (
                <Power className="w-5 h-5 text-emerald-400" />
              ) : (
                <PowerOff className="w-5 h-5 text-zinc-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-white">WhatsApp Alerts</p>
                <p className="text-xs text-zinc-500">{whatsappEnabled ? 'Enabled — you will receive alerts' : 'Disabled — no alerts will be sent'}</p>
              </div>
            </div>
            <button
              onClick={() => setWhatsappEnabled(!whatsappEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${
                whatsappEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow-sm ${
                whatsappEnabled ? 'translate-x-[26px]' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Phone Number Input */}
          <div className={`space-y-3 transition-opacity duration-200 ${whatsappEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-zinc-400" /> Your WhatsApp Number
            </label>
            <div className="flex gap-3">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={handlePhoneChange}
                placeholder="+919876543210"
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-emerald-500/50 transition placeholder:text-zinc-600"
              />
            </div>
            <div className="flex items-start gap-2 mt-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Use international format with country code. Example: <span className="text-zinc-300 font-mono">+919876543210</span> for India, <span className="text-zinc-300 font-mono">+14155238886</span> for US. This number will receive all hot lead alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Notification criteria */}
        <div className="bg-black/60 border border-white/5 rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-white mb-3">You'll be notified when:</h4>
          <div className="space-y-2">
            {[
              { emoji: '🔥', text: 'Lead shows interest (outcome: "interested")' },
              { emoji: '📅', text: 'Meeting is booked via the book_meeting tool' },
              { emoji: '🔄', text: 'Follow-up is requested (outcome: "follow-up")' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span>{item.emoji}</span>
                <span className="text-zinc-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 mt-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save WhatsApp Configuration'}
        </button>
      </div>
    </div>
  )
}
