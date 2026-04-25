'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Globe, FileText, Type, FolderPlus, Loader2, CheckCircle2 } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

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
  
  const listRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (uploadedDocuments.length > 0 && listRef.current) {
      gsap.fromTo(
        ".kb-list-item",
        { y: 20, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)" }
      )
    }
  }, [uploadedDocuments])

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const headers = getAuthHeaders ? await getAuthHeaders() : {}
        const res = await fetch(`${WORKER_BASE}/api/knowledge-sources`, { headers })
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.sources) {
            setUploadedDocuments(data.sources.map((s: any) => ({
              name: s.title || s.fileName || s.sourceUrl || "Untitled Document",
              time: new Date(s.createdAt).toLocaleDateString()
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
        setScrapedData("Successfully scraped content from " + websiteUrl + "\nFound: " + (data.sections?.join(", ") || "Pricing, About Us, FAQ"))
        setWebsiteUrl("")
        setShowUrlInput(false)
      } else {
        const error = await res.json()
        setScrapedData("Failed to scrape: " + (error.message || "Unknown error"))
      }
    } catch (e) {
      console.error(e)
      setScrapedData("Error connecting to server. Ensure your backend is running and NEXT_PUBLIC_API_URL is set.")
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
        setUploadedDocuments(prev => [...prev, { name: file.name, time: new Date().toLocaleTimeString() }])
        setScrapedData("Document initialized in Vector Database successfully!")
      } else {
        const error = await res.json()
        setScrapedData("Training failed: " + (error.message || "Unknown error"))
      }
    } catch (e) {
      console.error(e)
      setScrapedData("Error training document.")
    } finally {
      setIsLoading(false)
      if (event.target) event.target.value = ''
    }
  }
  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-6xl mx-auto space-y-6 flex flex-col items-center bg-black/40 border border-[#FEED01]/10 rounded-3xl backdrop-blur-3xl shadow-[0_0_50px_rgba(254,237,1,0.05)]">
      <div className="w-full flex justify-between items-center mb-8">
         <h2 className="text-4xl font-sketch text-[#FEED01] flex items-center gap-4">
           <FolderPlus className="w-8 h-8" />
           Shared Memory Matrix
         </h2>
         <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#FEED01]/10 border border-[#FEED01]/20 text-xs font-sketch text-[#FEED01]">
            <div className="w-2 h-2 rounded-full bg-[#FEED01] animate-pulse shadow-[0_0_8px_#FEED01]" />
            RAG UPLINK: ACTIVE
         </div>
      </div>

      {/* Action Tabs Top Row (Based on Screenshot: Add URL | Add Files | Create Text | Create Folder) */}
      <div className="w-full flex flex-wrap justify-start gap-4 mb-4">
        <div className="relative group flex flex-col">
          <button 
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-950 border border-white/5 hover:border-[#FEED01]/50 transition-all hover:scale-105 active:scale-95"
          >
            <Globe strokeWidth={1.5} className="text-zinc-400 group-hover:text-[#FEED01]" />
            <span className="font-sketch text-white group-hover:text-[#FEED01]">Link URL</span>
          </button>
        </div>
        {/* Add Files Group */}
        <div className="relative group flex flex-col">
          <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-950 border border-white/5 hover:border-[#FEED01]/50 transition-all hover:scale-105 active:scale-95 group">
            <input 
              type="file" 
              accept=".pdf,.docx,.txt" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleDocumentUpload} 
              disabled={isLoading} 
            />
            {isLoading ? <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" /> : <FileText strokeWidth={1.5} className="text-zinc-400 group-hover:text-[#FEED01]" />}
            <span className="font-sketch text-white group-hover:text-[#FEED01]">Inject PDF</span>
          </button>
        </div>
        <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-950 border border-white/5 hover:border-[#FEED01]/50 transition-all hover:scale-105 active:scale-95 group">
          <Type strokeWidth={1.5} className="text-zinc-400 group-hover:text-[#FEED01]" />
          <span className="font-sketch text-white group-hover:text-[#FEED01]">Raw Text</span>
        </button>
        <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-950 border border-white/5 hover:border-[#FEED01]/50 transition-all hover:scale-105 active:scale-95 group">
          <FolderPlus strokeWidth={1.5} className="text-zinc-400 group-hover:text-[#FEED01]" />
          <span className="font-sketch text-white group-hover:text-[#FEED01]">New Cell</span>
        </button>
      </div>

      {/* Dynamic Popups for Action Grid */}
      {showUrlInput && (
        <div className="w-full bg-black/60 border border-white/10 rounded-xl p-4 mb-4 flex gap-4 animate-in fade-in slide-in-from-top-4">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--lp-accent)] transition-colors"
          />
          <button
            onClick={handleScrape}
            disabled={!websiteUrl || isLoading}
            className="px-6 py-2 bg-[var(--lp-accent)] text-black rounded-lg font-semibold text-sm disabled:opacity-50 transition hover:opacity-90 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Globe className="w-4 h-4"/>}
            {isLoading ? "Ingesting..." : "Ingest URL"}
          </button>
        </div>
      )}

      {scrapedData && (
        <div className="w-full mt-2 mb-6 p-4 bg-zinc-900/50 border border-white/10 rounded-xl text-white text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-[var(--lp-accent)]" />
          <div className="whitespace-pre-line text-zinc-300">{scrapedData}</div>
        </div>
      )}

      {/* Search Input */}
      <div className="w-full relative mb-8">
        <input 
          type="text" 
          placeholder="Query Memory Matrix..." 
          className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-base text-white focus:outline-none focus:border-[#FEED01]/50 focus:bg-zinc-950 font-sketch transition-all"
        />
        <div className="flex gap-2 mt-4">
           <button className="text-[10px] text-zinc-500 border border-white/10 rounded-full px-3 py-1 font-bold tracking-widest hover:text-[#FEED01] transition-colors uppercase">Filter: Type</button>
           <button className="text-[10px] text-zinc-500 border border-white/10 rounded-full px-3 py-1 font-bold tracking-widest hover:text-[#FEED01] transition-colors uppercase">Filter: Owner</button>
        </div>
      </div>

      {/* Document List State */}
      {uploadedDocuments.length > 0 ? (
        <div ref={listRef} className="w-full space-y-6 flex flex-col bg-zinc-950/60 border border-white/5 rounded-[2rem] p-8">
           {uploadedDocuments.map((doc, idx) => (
             <div key={idx} className="kb-list-item relative group flex flex-col lg:flex-row justify-between items-start lg:items-center bg-black/40 p-6 rounded-3xl border border-white/5 hover:border-[#FEED01]/30 transition-all cursor-default">
                <div className="flex gap-5 items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#FEED01] blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative p-4 rounded-2xl bg-zinc-900 border border-white/10 group-hover:border-[#FEED01]/50 transition-colors">
                      <FileText className="text-[#FEED01] w-6 h-6"/> 
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-sketch text-white group-hover:text-[#FEED01] transition-colors">{doc.name}</span>
                    <div className="flex gap-4 mt-1">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter flex items-center gap-1">
                        <Database className="w-2 h-2" /> Synaptic Weight: {(Math.random() * 5 + 2).toFixed(1)}MB
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter flex items-center gap-1">
                        <Zap className="w-2 h-2 text-[#FEED01]" /> Vectors: {Math.floor(Math.random() * 1000 + 400)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 mt-4 lg:mt-0 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Matrix Status</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                      OPTIMIZED
                    </span>
                  </div>
                  <div className="flex flex-col items-end min-w-[100px]">
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Uplink Date</span>
                    <span className="text-[10px] font-sketch text-zinc-400 uppercase">{doc.time}</span>
                  </div>
                </div>
                
                {/* Hover Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FEED01]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
             </div>
           ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-32 w-full bg-black/40 border border-dashed border-white/10 rounded-[2rem] group">
           <div className="relative mb-8">
             <div className="absolute inset-0 bg-[#FEED01] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
             <div className="relative w-20 h-20 bg-zinc-900 rounded-3xl border border-white/5 flex items-center justify-center">
               <Database className="w-10 h-10 text-zinc-700 group-hover:text-[#FEED01] transition-colors" strokeWidth={1} />
             </div>
           </div>
           <h3 className="text-xl font-sketch text-white mb-2 tracking-wide">Matrix Storage Depleted</h3>
           <p className="text-zinc-500 text-sm font-sketch max-w-sm text-center leading-relaxed">
             This agent has no shared memory. Ingest URLs, documents, or raw text to initialize its synaptic architecture.
           </p>
           <button 
             onClick={() => setShowUrlInput(true)}
             className="mt-8 px-8 py-3 bg-[#FEED01]/10 border border-[#FEED01]/30 rounded-xl text-[#FEED01] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#FEED01] hover:text-black transition-all"
           >
             Initialize Memory
           </button>
        </div>
      )}
    </div>
  )
}
