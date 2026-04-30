'use client'

import React, { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, PhoneOutgoing, Phone, FileText, Database, Zap, LogOut, LucideIcon, CreditCard,
  Settings, BarChart3, Rocket, TestTube, Workflow, X, Sparkles
} from 'lucide-react'

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
  isMobileOpen?: boolean
  onMobileClose?: () => void
  isCollapsed?: boolean
}

function FloatingOrb() {
  return (
    <div className="absolute bottom-[-150px] left-[-150px] w-[500px] h-[500px] pointer-events-none opacity-30">
      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#FEED01] to-[#FEED01]/20 blur-[80px] animate-pulse" style={{ animationDuration: '4s' }} />
    </div>
  )
}

export default function Sidebar({ activeTab, setActiveTab, onSignOut, isMobileOpen = false, onMobileClose, isCollapsed = false }: SidebarProps) {
  const zones: SidebarZone[] = [
    {
      title: "Main",
      items: [
        { id: "agents", label: "My Agents", icon: Bot },
        { id: "outbound", label: "Campaigns", icon: PhoneOutgoing },
        { id: "whatsapp", label: "WhatsApp", icon: Phone },
        { id: "conversations", label: "Call Log", icon: FileText },
      ]
    },
    {
      title: "Builder",
      items: [
        { id: "configure", label: "Configure", icon: Settings },
        { id: "builder", label: "Workflow Builder", icon: Workflow },
        { id: "testing", label: "Testing Hub", icon: TestTube },
        { id: "metrics", label: "Performance", icon: BarChart3 },
      ]
    },
    {
      title: "Deploy",
      items: [
        { id: "pipeline", label: "Deployment", icon: Rocket },
        { id: "deployed", label: "Deployed Hub", icon: Zap },
      ]
    },
    {
      title: "Tools",
      items: [
        { id: "knowledge", label: "Knowledge Base", icon: Database },
        { id: "test", label: "Test Simulation", icon: Bot },
      ]
    },
    {
      title: "Account",
      items: [
        { id: "billing", label: "Subscription", icon: CreditCard },
      ]
    }
  ]

  const handleItemClick = (id: string) => {
    setActiveTab(id)
    // Close mobile drawer on nav
    if (onMobileClose) onMobileClose()
  }

  // ---------- Sidebar content (shared between drawer & desktop) ----------
  const sidebarContent = (
    <>
      {/* Glossy Overlay */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#FEED01]/5 to-transparent pointer-events-none opacity-50" />
      
      {/* Background 3D Element */}
      <Suspense fallback={null}>
        <FloatingOrb />
      </Suspense>

      <div className={`${isCollapsed ? 'p-3' : 'p-6 lg:p-8'} relative z-10 flex-1 overflow-y-auto no-scrollbar`}>
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center mb-6' : 'gap-4 mb-10 lg:mb-14'} group cursor-pointer`}>
          <div className={`${isCollapsed ? 'w-10 h-10 rounded-xl' : 'w-12 h-12 rounded-[1.25rem]'} bg-[#FEED01] flex items-center justify-center shadow-[0_0_30px_rgba(254,237,1,0.4)] group-hover:rotate-[15deg] transition-all duration-500 flex-shrink-0`}>
            <Zap className={`${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'} text-black fill-black`} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter uppercase leading-none truncate">PixelFlow</h1>
              <span className="text-[9px] font-black uppercase tracking-[0.35em] text-zinc-400 mt-1">Builder</span>
            </div>
          )}
          {/* Mobile close button */}
          {isMobileOpen && onMobileClose && (
            <button
              onClick={onMobileClose}
              className="ml-auto p-2 rounded-xl hover:bg-white/10 transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          )}
        </div>

        <nav className={`${isCollapsed ? 'space-y-4' : 'space-y-8 lg:space-y-12'}`}>
          {zones.map((zone) => (
            <div key={zone.title}>
              {!isCollapsed && (
                <h3 className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 lg:mb-6">{zone.title}</h3>
              )}
              <div className={`${isCollapsed ? 'space-y-1' : 'space-y-1 lg:space-y-2'}`}>
                {zone.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-4 px-5 py-3 lg:py-4 rounded-2xl'} transition-all relative group ${
                      activeTab === item.id 
                        ? "bg-[#FEED01]/10 text-[#FEED01]" 
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {activeTab === item.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-[#FEED01]/5 border border-[#FEED01]/20 ${isCollapsed ? 'rounded-xl' : 'rounded-2xl'}`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} relative z-10 transition-colors ${activeTab === item.id ? "text-[#FEED01]" : "text-zinc-500 group-hover:text-zinc-300"} flex-shrink-0`} />
                    {!isCollapsed && (
                      <span className="font-bold text-[11px] uppercase tracking-[0.15em] relative z-10 truncate">{item.label}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className={`${isCollapsed ? 'p-3' : 'p-6 lg:p-8'} border-t border-white/10 relative z-10 backdrop-blur-sm bg-black/30 flex-shrink-0`}>
        <button 
          onClick={onSignOut}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-4 px-5 py-4 rounded-2xl'} text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all group`}
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform flex-shrink-0" />
          {!isCollapsed && <span className="font-black text-[10px] uppercase tracking-[0.2em]">Sign Out</span>}
        </button>
      </div>
    </>
  )

  // ===== MOBILE: Drawer overlay =====
  // Rendered via portal-like approach: always in DOM, visibility toggled
  return (
    <>
      {/* ---- Mobile Drawer (< 1024px) ---- */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onMobileClose}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#111115]/98 border-r border-white/10 flex flex-col z-50 overflow-hidden backdrop-blur-xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---- Desktop Sidebar (>= 1024px) ---- */}
      <aside className={`hidden lg:flex ${isCollapsed ? 'w-[72px]' : 'w-72'} bg-[#111115]/95 border-r border-white/10 flex-col relative z-20 overflow-hidden backdrop-blur-xl transition-all duration-300`}>
        {sidebarContent}
      </aside>
    </>
  )
}
