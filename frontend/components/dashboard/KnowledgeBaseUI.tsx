'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Globe, FileText, Type, FolderPlus, Loader2, CheckCircle2, Database, Zap, Search, Brain, Share2, Shield, Activity, Network, Layers, Trash2, XCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface KnowledgeBaseUIProps {
  userId?: string;
  workerBase?: string;
  getAuthHeaders?: () => Promise<Record<string, string>>;
}

export default function KnowledgeBaseUI({ userId, workerBase, getAuthHeaders }: KnowledgeBaseUIProps) {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [textSnippet, setTextSnippet] = useState("")
  const [textTitle, setTextTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeInput, setActiveInput] = useState<'url' | 'text' | null>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null)
  
  const WORKER_BASE = workerBase || process.env.NEXT_PUBLIC_NODE_API_URL || process.env.NEXT_PUBLIC_WORKER_URL || "https://launch-pixel-backend.onrender.com"

  const fetchSources = async () => {
    try {
      const res = await fetch(`${WORKER_BASE}/api/knowledge-sources/sources`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.sources) {
          setUploadedDocuments(data.sources.map((s: any) => ({
            id: s.id,
            name: s.title || s.fileName || s.sourceUrl || "Untitled Document",
            type: s.type === 'url' ? 'URL' : s.type?.toUpperCase() || 'TXT',
            chunks: s.chunksCount || 0,
            status: s.status || 'pending',
            createdAt: s.createdAt,
          })))
        }
      }
    } catch (e) {
      console.error("Failed to fetch knowledge sources:", e)
    }
  }

  useEffect(() => {
    fetchSources()
    // Poll for status updates every 10s
    const interval = setInterval(fetchSources, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleScrape = async () => {
    if (!websiteUrl) return
    setIsLoading(true)
    setStatusMessage(null)
    try {
      const res = await fetch(`${WORKER_BASE}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, agentId: 1, userId: userId || 'system' }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStatusMessage({ text: `✅ Scraped "${data.stats?.title || websiteUrl}" — indexing in background...`, type: 'success' })
        setWebsiteUrl("")
        setActiveInput(null)
        fetchSources()
      } else {
        setStatusMessage({ text: `❌ ${data.error || 'Failed to scrape'}`, type: 'error' })
      }
    } catch (e: any) {
      setStatusMessage({ text: `❌ Network error: ${e.message}`, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!textSnippet) return
    setIsLoading(true)
    setStatusMessage(null)
    try {
      const res = await fetch(`${WORKER_BASE}/api/agent-configurations/document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: userId || 'system',
          agentId: '1',
          filename: textTitle || 'Text Snippet',
          fileType: 'txt',
          extractedText: textSnippet,
        }),
      })
      if (res.ok) {
        setStatusMessage({ text: '✅ Text snippet added to knowledge base!', type: 'success' })
        setTextSnippet("")
        setTextTitle("")
        setActiveInput(null)
        fetchSources()
      }
    } catch (e: any) {
      setStatusMessage({ text: `❌ Failed: ${e.message}`, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsLoading(true)
    setStatusMessage(null)
    try {
      // Read file as text (for PDF we'd need server-side parsing)
      const text = await file.text()
      const res = await fetch(`${WORKER_BASE}/api/agent-configurations/document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: userId || 'system',
          agentId: '1',
          filename: file.name,
          fileType: file.name.endsWith('.pdf') ? 'pdf' : 'txt',
          extractedText: text,
        }),
      })
      if (res.ok) {
        setStatusMessage({ text: `✅ "${file.name}" uploaded! Indexing...`, type: 'success' })
        fetchSources()
      }
    } catch (e: any) {
      setStatusMessage({ text: `❌ Upload failed: ${e.message}`, type: 'error' })
    } finally {
      setIsLoading(false)
      if (event.target) event.target.value = ''
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${WORKER_BASE}/api/knowledge-sources/sources/${id}`, { method: 'DELETE' })
      setUploadedDocuments(prev => prev.filter(d => d.id !== id))
      setStatusMessage({ text: '🗑️ Source removed', type: 'success' })
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const totalChunks = uploadedDocuments.reduce((acc, d) => acc + (d.chunks || 0), 0)
  const storageEstimate = (totalChunks * 0.8).toFixed(1) // ~800 bytes per chunk avg

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto space-y-10 p-4 lg:p-8">
      {/* Knowledge Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#FEED01] font-bold text-[10px] uppercase tracking-[0.4em]">
            <Brain className="w-4 h-4" />
            Knowledge Base
          </div>
          <h2 className="text-5xl font-sketch text-white tracking-tight">Shared Context</h2>
          <p className="text-zinc-500 font-sketch max-w-lg leading-relaxed">The central repository for your agent's knowledge. Upload documents and URLs to improve accuracy and response quality.</p>
        </div>

        <div className="flex gap-4">
           <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-3xl text-center min-w-[140px]">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Storage Used</div>
              <div className="text-3xl font-sketch text-[#FEED01]">{storageEstimate} KB</div>
           </div>
           <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-3xl text-center min-w-[140px]">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Data Chunks</div>
              <div className="text-3xl font-sketch text-emerald-500">{totalChunks}</div>
           </div>
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl font-sketch text-sm ${statusMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
          >
            {statusMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Grid - High-End Ingestion */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <IngestCard icon={<Globe />} title="Website Import" desc="Crawl & ingest websites" onClick={() => setActiveInput(activeInput === 'url' ? null : 'url')} active={activeInput === 'url'} />
        <IngestCard icon={<FileText />} title="PDF Document" desc="Upload technical docs" isFile onFileChange={handleDocumentUpload} loading={isLoading} />
        <IngestCard icon={<Type />} title="Text Snippet" desc="Paste raw text logic" onClick={() => setActiveInput(activeInput === 'text' ? null : 'text')} active={activeInput === 'text'} />
        <IngestCard icon={<Share2 />} title="External API" desc="Connect live data sources" comingSoon />
      </div>

      {/* URL Input */}
      <AnimatePresence>
        {activeInput === 'url' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-zinc-950/60 border border-[#FEED01]/20 rounded-[2.5rem] p-8 backdrop-blur-3xl"
          >
            <div className="flex gap-4">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://your-business-website.com"
                className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-[#FEED01]/50 transition-all shadow-inner"
                onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
              />
              <Button 
                onClick={handleScrape}
                disabled={isLoading || !websiteUrl}
                className="h-full px-10 bg-[#FEED01] text-black font-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(254,237,1,0.2)]"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "START INGESTION"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Text Snippet Input */}
        {activeInput === 'text' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-zinc-950/60 border border-[#FEED01]/20 rounded-[2.5rem] p-8 backdrop-blur-3xl space-y-4"
          >
            <input
              type="text"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              placeholder="Title (e.g., Company FAQ, Pricing Info)"
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#FEED01]/50 transition-all"
            />
            <textarea
              value={textSnippet}
              onChange={(e) => setTextSnippet(e.target.value)}
              placeholder="Paste your text content here... (FAQ answers, product info, company policies, etc.)"
              rows={6}
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-sm focus:outline-none focus:border-[#FEED01]/50 transition-all resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-600 font-mono">{textSnippet.length} chars</span>
              <Button 
                onClick={handleTextSubmit}
                disabled={isLoading || !textSnippet}
                className="px-10 bg-[#FEED01] text-black font-black rounded-2xl hover:scale-105 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "ADD TO KNOWLEDGE"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Knowledge Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-sketch text-white tracking-tight">Active Knowledge Sources</h3>
            <div className="flex gap-2">
               <button className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all"><Layers className="w-4 h-4" /></button>
               <button className="p-2 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all"><Network className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="space-y-4">
            {uploadedDocuments.map(doc => (
              <div key={doc.id} className="group bg-zinc-900/40 border border-white/5 hover:border-[#FEED01]/20 rounded-[1.5rem] p-6 flex items-center justify-between transition-all duration-500">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-[#FEED01]/30 transition-all">
                      {doc.type === 'URL' ? <Globe className="w-5 h-5 text-[#FEED01]" /> : <FileText className="w-5 h-5 text-[#FEED01]" />}
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white font-sketch tracking-wide line-clamp-1">{doc.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{doc.type}</span>
                         <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">•</span>
                         <StatusBadge status={doc.status} />
                         {doc.chunks > 0 && (
                           <>
                             <span className="text-[9px] font-mono text-zinc-600">•</span>
                             <span className="text-[9px] font-mono text-zinc-500">{doc.chunks} chunks</span>
                           </>
                         )}
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => handleDelete(doc.id)}
                     className="p-3 rounded-full bg-white/5 hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
            {uploadedDocuments.length === 0 && !isLoading && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                 <Database className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                 <p className="text-zinc-600 font-sketch">No knowledge sources detected. Add documents to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Content Insights */}
        <div className="space-y-6">
           <div className="bg-zinc-950/60 border border-[#FEED01]/10 rounded-[2.5rem] p-8 h-full flex flex-col space-y-8">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-[#FEED01] font-bold text-[9px] uppercase tracking-widest">
                    <Activity className="w-4 h-4" />
                    Real-time Telemetry
                 </div>
                 <h3 className="text-2xl font-sketch text-white tracking-tight">System Health</h3>
              </div>

              <div className="space-y-8 flex-1">
                 <StatRow label="Sources" value={`${uploadedDocuments.length} active`} color="text-[#FEED01]" />
                 <StatRow label="Total Chunks" value={`${totalChunks}`} color="text-emerald-500" />
                 <StatRow label="Embedding Model" value="OpenAI v3-small" color="text-[#FEED01]" />
                 <StatRow label="Search Method" value={totalChunks > 0 ? "Vector + Keyword" : "Awaiting Data"} color={totalChunks > 0 ? "text-emerald-500" : "text-zinc-600"} />
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <p className="text-[9px] text-zinc-500 font-sketch leading-relaxed uppercase tracking-widest">
                    The RAG system utilizes OpenAI text-embedding-3-small with hybrid vector + keyword search for enterprise-grade retrieval.
                 </p>
                 <Button 
                   onClick={fetchSources}
                   className="w-full bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] h-12"
                 >
                    Refresh Sources
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string, label: string }> = {
    completed: { color: 'text-emerald-500', label: 'Indexed' },
    processing: { color: 'text-[#FEED01] animate-pulse', label: 'Processing...' },
    pending: { color: 'text-amber-500 animate-pulse', label: 'Queued' },
    failed: { color: 'text-red-400', label: 'Failed' },
  }
  const c = config[status] || config.pending
  return <span className={`text-[9px] font-mono uppercase tracking-widest ${c.color}`}>{c.label}</span>
}

function IngestCard({ icon, title, desc, onClick, active, isFile, onFileChange, loading, comingSoon }: any) {
  return (
    <div 
      onClick={!comingSoon ? onClick : undefined}
      className={`relative group bg-zinc-900/40 border border-white/5 hover:border-[#FEED01]/30 rounded-[2rem] p-8 cursor-pointer transition-all duration-500 ${active ? 'border-[#FEED01]/50 bg-[#FEED01]/5 shadow-[0_0_30px_rgba(254,237,1,0.1)]' : ''} ${comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isFile && !loading && <input type="file" accept=".txt,.md,.csv,.json,.pdf" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
      <div className="space-y-6">
        <div className={`w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-white border border-white/5 group-hover:border-[#FEED01]/50 group-hover:scale-110 transition-all duration-500 shadow-xl`}>
           {loading ? <Loader2 className="w-7 h-7 text-[#FEED01] animate-spin" /> : React.cloneElement(icon, { className: 'w-7 h-7 text-[#FEED01]' })}
        </div>
        <div>
           <h4 className="text-lg font-sketch text-white tracking-tight group-hover:text-[#FEED01] transition-colors">{title}</h4>
           <p className="text-xs text-zinc-500 font-sketch leading-relaxed mt-1">{desc}</p>
        </div>
        {comingSoon && <Badge className="absolute top-4 right-4 bg-zinc-800 text-[8px] font-mono uppercase tracking-widest">Coming Soon</Badge>}
      </div>
    </div>
  )
}

function StatRow({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
       <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
    </div>
  )
}
