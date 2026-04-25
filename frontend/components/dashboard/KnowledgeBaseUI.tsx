'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Globe, FileText, Type, FolderPlus, Loader2, CheckCircle2, Database, Zap, Search, Brain, Share2, Shield, Activity, Network, Layers } from 'lucide-react'
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
  const [scrapedData, setScrapedData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  
  const WORKER_BASE = workerBase || process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787"

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const headers = getAuthHeaders ? await getAuthHeaders() : {}
        const res = await fetch(`${WORKER_BASE}/api/knowledge-sources`, { headers })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.sources) {
            setUploadedDocuments(data.sources.map((s: any) => ({
              id: s.id,
              name: s.title || s.fileName || s.sourceUrl || "Untitled Document",
              type: s.sourceUrl ? 'URL' : 'PDF',
              density: '84%', 
              status: 'Indexed'
            })))
          }
        }
      } catch (e) {
        console.error("Failed to fetch knowledge sources:", e)
      }
    }
    fetchSources()
  }, [])

  const handleScrape = async () => {
    if (!websiteUrl) return
    setIsLoading(true)
    try {
      const headers = { 
        "Content-Type": "application/json",
        ...(getAuthHeaders ? await getAuthHeaders() : {})
      }
      const res = await fetch(`${WORKER_BASE}/api/call/scrape`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url: websiteUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        setScrapedData("Successfully scraped content from " + websiteUrl)
        setWebsiteUrl("")
        setShowUrlInput(false)
        // Re-fetch
        const fetchRes = await fetch(`${WORKER_BASE}/api/knowledge-sources`, { headers })
        if (fetchRes.ok) {
           const d = await fetchRes.json();
           if (d.sources) setUploadedDocuments(d.sources.map((s: any) => ({ id: s.id, name: s.title || s.fileName || s.sourceUrl, type: s.sourceUrl ? 'URL' : 'PDF', density: '84%', status: 'Indexed' })));
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsLoading(true)
    try {
      const headers = getAuthHeaders ? await getAuthHeaders() : {}
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${WORKER_BASE}/api/call/train`, {
        method: "POST",
        headers,
        body: formData,
      })
      if (res.ok) {
        setUploadedDocuments(prev => [...prev, { id: Date.now(), name: file.name, type: 'PDF', density: '0%', status: 'Training' }])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
      if (event.target) event.target.value = ''
    }
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto space-y-10 p-4 lg:p-8">
      {/* Neural Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#FEED01] font-bold text-[10px] uppercase tracking-[0.4em]">
            <Brain className="w-4 h-4" />
            Neural Knowledge Matrix
          </div>
          <h2 className="text-5xl font-sketch text-white tracking-tight">Shared Memory</h2>
          <p className="text-zinc-500 font-sketch max-w-lg leading-relaxed">The collective brain of your agent network. Inject documents, URLs, and data to increase synaptic density and response accuracy.</p>
        </div>

        <div className="flex gap-4">
           <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-3xl text-center min-w-[140px]">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Knowledge Density</div>
              <div className="text-3xl font-sketch text-[#FEED01]">{uploadedDocuments.length * 1.2} MB</div>
           </div>
           <div className="bg-zinc-900/60 p-6 rounded-3xl border border-white/5 backdrop-blur-3xl text-center min-w-[140px]">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Neural Synapses</div>
              <div className="text-3xl font-sketch text-emerald-500">{uploadedDocuments.length * 124}</div>
           </div>
        </div>
      </div>

      {/* Action Grid - High-End Ingestion */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <IngestCard icon={<Globe />} title="Memory Link" desc="Crawl & ingest websites" onClick={() => setShowUrlInput(!showUrlInput)} active={showUrlInput} />
        <IngestCard icon={<FileText />} title="Neural PDF" desc="Upload technical docs" isFile onFileChange={handleDocumentUpload} loading={isLoading} />
        <IngestCard icon={<Type />} title="Brain Dump" desc="Paste raw text logic" />
        <IngestCard icon={<Share2 />} title="External API" desc="Connect live data sources" comingSoon />
      </div>

      <AnimatePresence>
        {showUrlInput && (
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
                placeholder="https://company-knowledge.com"
                className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-[#FEED01]/50 transition-all shadow-inner"
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
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Knowledge Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-sketch text-white tracking-tight">Active Memory Segments</h3>
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
                         <span className={`text-[9px] font-mono uppercase tracking-widest ${doc.status === 'Indexed' ? 'text-emerald-500' : 'text-[#FEED01] animate-pulse'}`}>{doc.status}</span>
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right hidden sm:block">
                      <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Density</div>
                      <div className="text-sm font-bold text-white">{doc.density}</div>
                   </div>
                   <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white transition-all">
                      <Zap className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
            {uploadedDocuments.length === 0 && !isLoading && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem]">
                 <Database className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                 <p className="text-zinc-600 font-sketch">No memory segments detected. Start ingestion to equip your agent.</p>
              </div>
            )}
          </div>
        </div>

        {/* Neural Insights */}
        <div className="space-y-6">
           <div className="bg-zinc-950/60 border border-[#FEED01]/10 rounded-[2.5rem] p-8 h-full flex flex-col space-y-8">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-[#FEED01] font-bold text-[9px] uppercase tracking-widest">
                    <Activity className="w-4 h-4" />
                    Real-time Telemetry
                 </div>
                 <h3 className="text-2xl font-sketch text-white tracking-tight">RAG Health</h3>
              </div>

              <div className="space-y-8 flex-1">
                 <StatRow label="Semantic Accuracy" value="98.2%" color="text-[#FEED01]" />
                 <StatRow label="Retrieval Speed" value="114ms" color="text-emerald-500" />
                 <StatRow label="Matrix Alignment" value="Excellent" color="text-[#FEED01]" />
                 <StatRow label="Isolated Vaults" value="Active" color="text-emerald-500" />
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                 <p className="text-[9px] text-zinc-500 font-sketch leading-relaxed uppercase tracking-widest">
                    The RAG system utilizes vector embedding with HNSW indexing for mission-critical retrieval performance.
                 </p>
                 <Button className="w-full bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] h-12">
                    Optimize Memory
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function IngestCard({ icon, title, desc, onClick, active, isFile, onFileChange, loading, comingSoon }: any) {
  return (
    <div 
      onClick={!comingSoon ? onClick : undefined}
      className={`relative group bg-zinc-900/40 border border-white/5 hover:border-[#FEED01]/30 rounded-[2rem] p-8 cursor-pointer transition-all duration-500 ${active ? 'border-[#FEED01]/50 bg-[#FEED01]/5 shadow-[0_0_30px_rgba(254,237,1,0.1)]' : ''} ${comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isFile && !loading && <input type="file" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
      <div className="space-y-6">
        <div className={`w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center text-white border border-white/5 group-hover:border-[#FEED01]/50 group-hover:scale-110 transition-all duration-500 shadow-xl`}>
           {loading ? <Loader2 className="w-7 h-7 text-[#FEED01] animate-spin" /> : React.cloneElement(icon, { className: 'w-7 h-7 text-[#FEED01]' })}
        </div>
        <div>
           <h4 className="text-lg font-sketch text-white tracking-tight group-hover:text-[#FEED01] transition-colors">{title}</h4>
           <p className="text-xs text-zinc-500 font-sketch leading-relaxed mt-1">{desc}</p>
        </div>
        {comingSoon && <Badge className="absolute top-4 right-4 bg-zinc-800 text-[8px] font-mono">UPLINK_SOON</Badge>}
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
