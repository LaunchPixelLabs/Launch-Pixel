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
        <div ref={listRef} className="w-full space-y-4 flex flex-col bg-zinc-950/40 border border-white/5 rounded-3xl p-6">
           {uploadedDocuments.map((doc, idx) => (
             <div key={idx} className="kb-list-item flex justify-between items-center bg-zinc-900/30 p-5 rounded-2xl border border-white/5 opacity-0 hover:bg-[#FEED01]/5 transition-colors">
                <span className="text-sm font-sketch text-white flex gap-4 items-center">
                  <div className="p-2 rounded-lg bg-[#FEED01]/10">
                    <FileText className="text-[#FEED01] w-5 h-5"/> 
                  </div>
                  {doc.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Uplinked: {doc.time}</span>
             </div>
           ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 w-full bg-zinc-900/40 border border-white/5 rounded-2xl">
           <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-4">
             <div className="w-6 h-6 border-2 border-dashed border-zinc-600 rounded-sm" />
           </div>
           <h3 className="text-white font-bold mb-1 tracking-wide">No documents found</h3>
           <p className="text-zinc-500 text-sm">You don't have any documents yet. Upload a PDF or add a website URL.</p>
        </div>
      )}
    </div>
  )
}
