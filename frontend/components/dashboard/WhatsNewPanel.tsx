'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, ChevronRight, Zap, Rocket, Bot, Workflow, BarChart3, Shield } from 'lucide-react'

interface WhatsNewItem {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  tag: 'new' | 'improved' | 'beta'
  date: string
  action?: { label: string; tab?: string }
}

interface WhatsNewPanelProps {
  onNavigate?: (tab: string) => void
}

const WHATS_NEW_ITEMS: WhatsNewItem[] = [
  {
    id: 'pixelflow-builder',
    icon: <Workflow className="w-5 h-5" />,
    title: 'PixelFlow Visual Builder',
    description: 'Drag-and-drop workflow builder for creating complex agent conversation flows with zero code.',
    tag: 'new',
    date: 'Apr 2026',
    action: { label: 'Try Builder', tab: 'builder' }
  },
  {
    id: 'responsive-dashboard',
    icon: <Zap className="w-5 h-5" />,
    title: 'Mobile-First Dashboard',
    description: 'Full responsive support — manage your agents from any device. Optimized for phone, tablet, and desktop.',
    tag: 'new',
    date: 'Apr 2026'
  },
  {
    id: 'deployment-pipeline',
    icon: <Rocket className="w-5 h-5" />,
    title: 'Deployment Pipeline',
    description: 'Multi-stage deployment with staging, canary releases, and one-click rollbacks.',
    tag: 'new',
    date: 'Apr 2026',
    action: { label: 'Deploy Now', tab: 'pipeline' }
  },
  {
    id: 'testing-hub',
    icon: <Bot className="w-5 h-5" />,
    title: 'Agent Testing Hub',
    description: 'Comprehensive testing suite with automated QA, conversation replays, and approval workflows.',
    tag: 'improved',
    date: 'Apr 2026',
    action: { label: 'Run Tests', tab: 'testing' }
  },
  {
    id: 'performance-analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Advanced Analytics',
    description: 'Deep performance metrics with sentiment analysis, conversion tracking, and lead quality scoring.',
    tag: 'improved',
    date: 'Apr 2026',
    action: { label: 'View Metrics', tab: 'metrics' }
  },
  {
    id: 'whatsapp-admin',
    icon: <Shield className="w-5 h-5" />,
    title: 'WhatsApp Admin Commands',
    description: 'Manage agents via WhatsApp — send commands like !status, !pause, !report to your deployed agents.',
    tag: 'beta',
    date: 'Coming Soon'
  }
]

const TAG_STYLES = {
  new: 'bg-[#FEED01]/15 text-[#FEED01] border-[#FEED01]/30',
  improved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  beta: 'bg-violet-500/15 text-violet-400 border-violet-500/30'
}

export default function WhatsNewPanel({ onNavigate }: WhatsNewPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)

  // Check localStorage for last seen
  useEffect(() => {
    const lastSeen = localStorage.getItem('pf_whats_new_seen')
    if (lastSeen === 'v2') {
      setHasUnread(false)
    }
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    setHasUnread(false)
    localStorage.setItem('pf_whats_new_seen', 'v2')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FEED01]/30 transition-all group"
        aria-label="What's New"
      >
        <Sparkles className="w-4 h-4 text-[#FEED01] group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white hidden sm:inline">What&apos;s New</span>
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FEED01] rounded-full animate-pulse shadow-[0_0_8px_rgba(254,237,1,0.6)]" />
        )}
      </button>

      {/* Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-[#111115]/98 border-l border-white/10 backdrop-blur-xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEED01] to-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(254,237,1,0.3)]">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">What&apos;s New</h2>
                    <p className="text-xs text-zinc-400">Latest updates & features</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {WHATS_NEW_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 text-[#FEED01] group-hover:bg-[#FEED01]/10 transition-colors">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${TAG_STYLES[item.tag]} flex-shrink-0`}>
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.date}</span>
                          {item.action && onNavigate && (
                            <button
                              onClick={() => {
                                if (item.action?.tab) {
                                  onNavigate(item.action.tab)
                                  setIsOpen(false)
                                }
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold text-[#FEED01] hover:text-[#FEED01]/80 transition-colors"
                            >
                              {item.action.label}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex-shrink-0">
                <p className="text-[10px] text-zinc-500 text-center uppercase tracking-wider">
                  PixelFlow Builder v2.0 · Powered by Launch Pixel
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
