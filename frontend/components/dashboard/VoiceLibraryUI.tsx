'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, Mic2, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'
import gsap from 'gsap'

interface VoiceLibraryUIProps {
  currentVoiceId?: string;
  onSelectVoice?: (voiceId: string) => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://launch-pixel-backend.onrender.com"

const voices = [
  { id: '21m00Tcm4TlvDq8ikWAM', key: 'rachel', name: 'Rachel', gender: 'Female', style: 'Professional', useCase: 'Support & Greeting' },
  { id: '29vD33N1CtxCmqQRPOHJ', key: 'drew', name: 'Drew', gender: 'Male', style: 'Deep & Trustworthy', useCase: 'Corporate Sales' },
  { id: 'EXAVITQu4vr4xnSDxMaL', key: 'sarah', name: 'Sarah', gender: 'Female', style: 'Energetic', useCase: 'Lead Generation' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', key: 'josh', name: 'Josh', gender: 'Male', style: 'Calm', useCase: 'Customer Support' },
  { id: 'cjVigY5qzO86Huf0OWal', key: 'eric', name: 'Eric', gender: 'Male', style: 'Conversational', useCase: 'General Purpose' },
]

export default function VoiceLibraryUI({ currentVoiceId, onSelectVoice }: VoiceLibraryUIProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedVoice, setSelectedVoice] = useState(currentVoiceId || 'rachel')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { opacity: 0, scale: 0.95, y: 15 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "back.out(1.2)", delay: 0.1 }
      )
    }
    
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [])

  const handleSelect = (voiceKey: string) => {
    setSelectedVoice(voiceKey)
    onSelectVoice?.(voiceKey)
  }

  const togglePlay = async (e: React.MouseEvent, voiceId: string, voiceName: string) => {
    e.stopPropagation();
    
    // If currently playing the same voice, pause it
    if (playingId === voiceId && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    // Stop current audio if playing something else
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
    }
    window.speechSynthesis.cancel(); // Stop any fallback speech

    setIsLoadingAudio(voiceId);

    try {
      // Create new audio element pointing to our proxy
      const audioUrl = `${API_BASE}/api/voices/preview/${voiceId}`;
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingId(null);
      };
      
      audio.oncanplay = () => {
        setIsLoadingAudio(null);
        audio.play().catch(e => {
            console.warn("Audio play failed, using fallback", e);
            fallbackSpeech(voiceName, voiceId);
        });
        setPlayingId(voiceId);
      };

      audio.onerror = () => {
        setIsLoadingAudio(null);
        console.warn("Failed to load ElevenLabs audio. Falling back to browser speech synthesis.");
        fallbackSpeech(voiceName, voiceId);
      };

      audioRef.current = audio;
      
      // Force load for Safari
      audio.load();
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsLoadingAudio(null);
      fallbackSpeech(voiceName, voiceId);
    }
  }

  const fallbackSpeech = (name: string, id: string) => {
      setPlayingId(id);
      const utterance = new SpeechSynthesisUtterance(`Hello! I'm ${name}, your AI assistant. How can I help you today?`);
      utterance.onend = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
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
            key={voice.key} 
            onClick={() => handleSelect(voice.key)}
            className={`group relative bg-zinc-900/50 border rounded-2xl p-5 transition-all duration-300 cursor-pointer flex flex-col ${
              selectedVoice === voice.key 
                ? 'border-[var(--lp-accent)] ring-1 ring-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/5' 
                : 'border-white/5 hover:border-white/20'
            }`}
          >
            {selectedVoice === voice.key && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--lp-accent)] rounded-full flex items-center justify-center shadow-lg z-10">
                <CheckCircle2 className="w-4 h-4 text-black" />
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                {playingId === voice.id && (
                  <div className="absolute inset-0 bg-[var(--lp-accent)]/20 animate-pulse rounded-full" />
                )}
                <Volume2 className={`w-5 h-5 transition-colors ${playingId === voice.id ? 'text-[var(--lp-accent)]' : 'text-zinc-300'}`} />
              </div>
              
              <button 
                onClick={(e) => togglePlay(e, voice.id, voice.name)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  playingId === voice.id 
                    ? 'bg-[var(--lp-accent)] text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]' 
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {isLoadingAudio === voice.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : playingId === voice.id ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-1" />
                )}
              </button>
            </div>

            <div className="mt-auto">
              <h3 className="text-xl font-bold text-white mb-1">{voice.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5">{voice.gender}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5">{voice.style}</span>
              </div>
              <div className="pt-3 border-t border-white/5">
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">Perfect for:</p>
                <p className="text-xs text-zinc-300">{voice.useCase}</p>
              </div>
            </div>
            
            {/* Waveform visualizer when playing */}
            {playingId === voice.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--lp-accent)]/20 rounded-b-2xl overflow-hidden flex items-end justify-center gap-0.5">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-full bg-[var(--lp-accent)] rounded-t-sm"
                    style={{ 
                      height: `${Math.max(20, Math.random() * 100)}%`,
                      animation: `pulse ${0.5 + Math.random() * 0.5}s infinite alternate`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
