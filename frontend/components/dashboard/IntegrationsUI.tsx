'use client'
import React, { useEffect, useRef } from 'react'
import { Link2, Code2, ExternalLink, Key, Info, Lock } from 'lucide-react'
import gsap from 'gsap'

const platforms = [
  { id: 'twilio', name: 'Twilio', type: 'Voice & Telephony', connected: false, color: 'text-red-400', docsUrl: 'https://www.twilio.com/docs', essential: true },
  { id: 'elevenlabs', name: 'ElevenLabs', type: 'AI Voice Synthesis', connected: true, color: 'text-white', docsUrl: 'https://elevenlabs.io/docs', essential: true },
  { id: 'stripe', name: 'Stripe', type: 'Payment Processing', connected: false, color: 'text-[#635bff]', docsUrl: 'https://stripe.com/docs', essential: false },
  { id: 'hubspot', name: 'HubSpot CRM', type: 'Sales & Contact Import', connected: false, color: 'text-[#ff7a59]', docsUrl: 'https://developers.hubspot.com', essential: false },
  { id: 'razorpay', name: 'Razorpay', type: 'Indian Payment Gateway', connected: false, color: 'text-blue-400', docsUrl: 'https://razorpay.com/docs/api', essential: false },
]

export default function IntegrationsUI() {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      gsap.fromTo(listRef.current.children, 
        { opacity: 0, x: -20 }, 
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.1 }
      )
    }
  }, [])

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl max-w-5xl mx-auto w-full">
      <div className="mb-8 p-6 bg-gradient-to-r from-[var(--lp-accent)]/10 to-transparent border border-[var(--lp-accent)]/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Link2 className="text-[var(--lp-accent)]" /> Platform Integrations</h2>
           <p className="text-sm text-zinc-400 max-w-lg">
             Connect external services to power your AI agents. API keys are encrypted and stored securely.
           </p>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 bg-zinc-900/50 border border-white/5 rounded-xl p-4 mb-6">
        <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-500 leading-relaxed">
          ElevenLabs is pre-connected for voice synthesis. To enable calling, connect Twilio with your Account SID and Auth Token. 
          CRM integrations will sync contact lists and call outcomes automatically.
        </p>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider px-2">Available Integrations</h3>
        
        <div ref={listRef} className="space-y-4">
          {platforms.map(platform => (
            <div key={platform.id} className="group bg-black/40 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between hover:border-[var(--lp-accent)]/50 transition duration-300 gap-4">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 ${platform.color}`}>
                   <Code2 className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-lg font-bold text-white flex items-center gap-2">
                     {platform.name}
                     {platform.essential && (
                       <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20 font-semibold">CORE</span>
                     )}
                   </h4>
                   <p className="text-xs text-zinc-500">{platform.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 {platform.connected ? (
                   <span className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
                   </span>
                 ) : (
                   <button className="flex items-center gap-2 text-sm text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition">
                     <Key className="w-4 h-4 text-zinc-400" /> Connect API
                   </button>
                 )}
                 <a href={platform.docsUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-zinc-500 hover:text-white transition">
                   <ExternalLink className="w-4 h-4" />
                 </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
