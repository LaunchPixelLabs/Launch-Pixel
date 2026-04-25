'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, PhoneOutgoing, PhoneIncoming, Upload, Download, 
  Loader2, CheckCircle2, AlertCircle, X, Zap, Target,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { Contact, ValidationError } from "@/lib/csvParser"

interface OutboundTabProps {
  agentType: "outbound" | "inbound"
  contacts: any[]
  manualName: string
  setManualName: (v: string) => void
  manualPhone: string
  setManualPhone: (v: string) => void
  handleManualCall: () => void
  isLoading: boolean
  handleCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  showValidationReport: boolean
  csvSummary: any
  csvFile: File | null
  handleCloseValidationReport: () => void
  csvValidationErrors: ValidationError[]
  csvValidContacts: Contact[]
  handleImportValidOnly: () => void
  handleDownloadCorrectedCSV: () => void
  handleQuickCall: (phone: string, name?: string) => void
  handleBatchCall: () => void
}

export default function OutboundTab({
  agentType,
  contacts,
  manualName,
  setManualName,
  manualPhone,
  setManualPhone,
  handleManualCall,
  isLoading,
  handleCSVUpload,
  showValidationReport,
  csvSummary,
  csvFile,
  handleCloseValidationReport,
  csvValidationErrors,
  csvValidContacts,
  handleImportValidOnly,
  handleDownloadCorrectedCSV,
  handleQuickCall,
  handleBatchCall
}: OutboundTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'hot': return <TrendingUp className="w-3 h-3 text-emerald-400" />
      case 'cold': return <TrendingDown className="w-3 h-3 text-red-400" />
      default: return <Minus className="w-3 h-3 text-zinc-500" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'called': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'in-progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse'
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-white/5 text-zinc-500 border-white/5'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 h-full flex flex-col"
    >
      {/* Quick Dial Matrix */}
      {agentType === "outbound" && (
        <div className="bg-[#0d0d0f] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#FEED0105_0%,transparent_30%)]" />
          
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FEED01]/10 border border-[#FEED01]/20 group-hover:rotate-6 transition-transform">
              <Phone className="w-5 h-5 text-[#FEED01]" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">Manual Uplink</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Direct Neural Dialing</p>
            </div>
          </div>

          <div className="flex flex-col sm:row gap-4 relative z-10">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="PROSPECT IDENTITY"
                className="w-full px-5 py-4 rounded-2xl bg-black border border-white/10 text-white placeholder-zinc-700 focus:ring-1 focus:ring-[#FEED01]/50 focus:border-[#FEED01]/50 text-[11px] font-black uppercase tracking-widest outline-none transition-all"
              />
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 text-[11px] font-black">+91</span>
                <input
                  type="tel"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                  placeholder="DIGITAL ADDRESS"
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-black border border-white/10 text-white placeholder-zinc-700 focus:ring-1 focus:ring-[#FEED01]/50 focus:border-[#FEED01]/50 text-[11px] font-black uppercase tracking-widest outline-none transition-all font-mono"
                />
              </div>
            </div>
            <button
              onClick={handleManualCall}
              disabled={!manualPhone || isLoading}
              className="px-8 py-4 bg-[#FEED01] hover:bg-[#e6d501] text-black rounded-2xl font-black italic tracking-tighter uppercase text-sm flex items-center justify-center gap-3 disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(254,237,1,0.1)] hover:shadow-[0_0_30px_rgba(254,237,1,0.2)]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
              Initialize Link
            </button>
          </div>
        </div>
      )}

      {/* Campaign Matrix */}
      <div className="flex-1 bg-[#0d0d0f] border border-white/5 rounded-3xl flex flex-col min-h-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,#FEED0105_0%,transparent_30%)]" />
        
        <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <Target className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">Campaign Matrix</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">{contacts.length} Targets Synchronized</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className={`flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl border border-white/5 transition-all font-bold text-[10px] uppercase tracking-widest cursor-pointer ${
                isLoading ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="w-3 h-3" />
              {isLoading ? "Ingesting..." : "Ingest Matrix"}
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0d0d0f] z-20">
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Neural Sync Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Agent Intel</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Sentiment</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <div className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-full" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Campaign Feed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="group hover:bg-[#FEED01]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-[#FEED01] transition-colors">{contact.name}</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest font-mono">{contact.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 border rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(contact.status)}`}>
                        {contact.status || 'READY'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] text-zinc-400 font-medium italic max-w-[200px] truncate">
                        {contact.lastAgentNote || "Awaiting neural processing..."}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(contact.sentiment)}
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{contact.sentiment || 'NEUTRAL'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleQuickCall(contact.phone)} 
                        disabled={isLoading} 
                        className="p-2.5 rounded-xl bg-white/5 text-zinc-500 hover:text-[#FEED01] hover:bg-[#FEED01]/10 border border-white/5 hover:border-[#FEED01]/20 transition-all disabled:opacity-30"
                      >
                        <PhoneOutgoing className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {agentType === "outbound" && contacts.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-[#0d0d0f] relative z-10">
            <button 
              onClick={handleBatchCall}
              disabled={isLoading}
              className="w-full py-4 bg-white hover:bg-zinc-200 text-black rounded-2xl font-black italic tracking-tighter uppercase text-sm flex items-center justify-center gap-3 transition-all shadow-xl"
            >
              <Zap className="w-4 h-4 fill-current" />
              Initialize Collective Neural Link
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
