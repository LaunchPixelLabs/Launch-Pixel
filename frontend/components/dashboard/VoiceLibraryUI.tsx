'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, Mic2, Sparkles, CheckCircle2 } from 'lucide-react'
import gsap from 'gsap'

interface VoiceLibraryUIProps {
  currentVoiceId?: string;
  onSelectVoice?: (voiceId: string) => void;
}

const voices = [
  { id: 'rachel', name: 'Rachel', gender: 'Female', style: 'Professional', useCase: 'Support & Greeting', previewUrl: 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream' },
  { id: 'drew', name: 'Drew', gender: 'Male', style: 'Deep & Trustworthy', useCase: 'Corporate Sales', previewUrl: '' },
  { id: 'sarah', name: 'Sarah', gender: 'Female', style: 'Energetic', useCase: 'Lead Generation', previewUrl: '' },
  { id: 'josh', name: 'Josh', gender: 'Male', style: 'Calm', useCase: 'Customer Support', previewUrl: '' },
  { id: 'eric', name: 'Eric', gender: 'Male', style: 'Conversational', useCase: 'General Purpose', previewUrl: '' },
]

export default function VoiceLibraryUI({ currentVoiceId, onSelectVoice }: VoiceLibraryUIProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedVoice, setSelectedVoice] = useState(currentVoiceId || 'rachel')

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { opacity: 0, scale: 0.95, y: 15 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)", delay: 0.1 }
      )
    }
  }, [])

  const handleSelect = (voiceId: string) => {
    setSelectedVoice(voiceId)
    onSelectVoice?.(voiceId)
  }

  return (
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><Mic2 className="text-[var(--lp-accent)] w-6 h-6"/> Voice Library</h2>
          <p className="text-sm text-zinc-400">Select a voice profile for your AI agents. Powered by ElevenLabs.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-zinc-400">Custom voice cloning available on <span className="text-amber-400 font-semibold">Teams</span> plan</span>
        </div>
      </div>

      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 no-scrollbar pb-10">
        {voices.map(voice => (
          <div 
            key={voice.id} 
            onClick={() => handleSelect(voice.id)}
            className={`group relative bg-zinc-900/50 border rounded-2xl p-5 transition-all duration-300 cursor-pointer ${
              selectedVoice === voice.id 
                ? 'border-[var(--lp-accent)] ring-1 ring-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/5' 
                : 'border-white/5 hover:border-white/20'
            }`}
          >
            {selectedVoice === voice.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--lp-accent)] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Volume2 className="w-5 h-5 text-zinc-300" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-1">{voice.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">{voice.gender}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">{voice.style}</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium pb-2 border-b border-white/5">Perfect for:</p>
              <p className="text-sm text-zinc-300 mt-2">{voice.useCase}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
