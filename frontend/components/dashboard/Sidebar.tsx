'use client'

import React, { Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, PhoneOutgoing, Phone, FileText, Database, Zap, LogOut, LucideIcon 
} from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei'

interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
}

interface SidebarZone {
  title: string
  items: SidebarItem[]
}

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onSignOut: () => void
}

function FloatingOrb() {
  return (
    <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] pointer-events-none opacity-40">
      <Canvas>
        <ambientLight intensity={1} />
        <Float speed={5} rotationIntensity={2} floatIntensity={2}>
          <Sphere args={[1, 100, 200]} scale={2.4}>
            <MeshDistortMaterial
              color="#FEED01"
              attach="material"
              distort={0.4}
              speed={4}
              roughness={0}
            />
          </Sphere>
        </Float>
      </Canvas>
    </div>
  )
}

export default function Sidebar({ activeTab, setActiveTab, onSignOut }: SidebarProps) {
  const zones: SidebarZone[] = [
    { 
      title: "Agent Controls", 
      items: [
        { id: "agents", label: "My Agents", icon: Bot },
        { id: "outbound", label: "Campaigns", icon: PhoneOutgoing },
        { id: "whatsapp", label: "Link WhatsApp", icon: Phone },
        { id: "conversations", label: "Performance", icon: FileText },
      ] 
    },
    { 
      title: "Knowledge Hub", 
      items: [
        { id: "knowledge", label: "Knowledge Base", icon: Database },
        { id: "test", label: "Test Lab", icon: Zap },
      ] 
    }
  ]

  return (
    <aside className="w-72 bg-[#08080a] border-r border-white/5 flex flex-col relative z-20 overflow-hidden">
      {/* Glossy Overlay */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#FEED01]/5 to-transparent pointer-events-none opacity-30" />
      
      {/* Background 3D Element */}
      <Suspense fallback={null}>
        <FloatingOrb />
      </Suspense>

      <div className="p-8 relative z-10">
        <div className="flex items-center gap-4 mb-14 group cursor-pointer">
          <div className="w-12 h-12 bg-[#FEED01] rounded-[1.25rem] flex items-center justify-center shadow-[0_0_30px_rgba(254,237,1,0.4)] group-hover:rotate-[15deg] transition-all duration-500">
            <Zap className="w-6 h-6 text-black fill-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Launch Pixel</h1>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-1">Enterprise AI</span>
          </div>
        </div>

        <nav className="space-y-12">
          {zones.map((zone, zi) => (
            <div key={zone.title}>
              <h3 className="px-4 text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-6">{zone.title}</h3>
              <div className="space-y-2">
                {zone.items.map((item, ii) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group ${
                      activeTab === item.id 
                        ? "bg-[#FEED01]/10 text-[#FEED01]" 
                        : "text-zinc-500 hover:text-zinc-200"
                    }`}
                  >
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[#FEED01]/5 border border-[#FEED01]/20 rounded-2xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`w-4 h-4 relative z-10 transition-colors ${activeTab === item.id ? "text-[#FEED01]" : "text-zinc-700 group-hover:text-zinc-400"}`} />
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] relative z-10">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5 relative z-10 backdrop-blur-sm bg-black/20">
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-[10px] uppercase tracking-[0.2em]">Disconnect</span>
        </button>
      </div>
    </aside>
  )
}
