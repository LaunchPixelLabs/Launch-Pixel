'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Globe, FileText, Type, FolderPlus, Loader2, CheckCircle2 } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function KnowledgeBaseUI() {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [scrapedData, setScrapedData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  
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

  const fetchSources = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const headers = token ? { "Authorization": `Bearer ${token}` } : {}
      const res = await fetch(`${API_BASE}/api/knowledge-sources`, { headers })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.sources) {
          setUploadedDocuments(data.sources.map((s: any) => ({
            id: s.id,
            name: s.title || s.fileName || s.sourceUrl || "Untitled Document",
            time: new Date(s.createdAt).toLocaleDateString(),
            size: s.chunksCount ? `${(s.chunksCount * 0.5).toFixed(1)} KB` : 'Unknown',
            rawSize: s.chunksCount ? s.chunksCount * 500 : 0
          })))
        }
      }
    } catch (e) {
      console.error("Failed to fetch knowledge sources:", e)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const handleScrape = async () => {
    if (!websiteUrl) return
    setIsLoading(true)
    try {
      // Fetching auth headers would ideally be passed via props or context here
      // For standalone component logic without full context hook:
      const token = localStorage.getItem("auth_token") // Fallback
      const headers = { 
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
      const res = await fetch(`${API_BASE}/api/call/scrape`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url: websiteUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        setScrapedData("Successfully scraped content from " + websiteUrl + "\nFound: " + (data.sections?.join(", ") || "Website Content"))
        setWebsiteUrl("")
        setShowUrlInput(false)
        fetchSources() // Refresh list
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
      const token = localStorage.getItem("auth_token")
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${API_BASE}/api/call/train`, {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
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
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this knowledge source?")) return;
    
    try {
      const token = localStorage.getItem("auth_token")
      const headers = token ? { "Authorization": `Bearer ${token}` } : {}
      const res = await fetch(`${API_BASE}/api/knowledge-sources/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (res.ok) {
        fetchSources(); // Refresh
      } else {
        alert("Failed to delete source");
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }

  // Calculate storage (approximate based on chunk size)
  const totalStorageBytes = uploadedDocuments.reduce((acc, doc) => acc + (doc.rawSize || 0), 0);
  const totalStorageKB = (totalStorageBytes / 1024).toFixed(1);

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full max-w-6xl mx-auto space-y-6 flex flex-col items-center bg-black/40 border border-white/10 rounded-2xl backdrop-blur-2xl">
      <div className="w-full flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-white flex items-center gap-3">Knowledge Base</h2>
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--lp-accent)]/10 border border-[var(--lp-accent)]/20 text-xs font-medium text-[var(--lp-accent)]">
            <div className="w-2 h-2 rounded-full bg-[var(--lp-accent)] animate-pulse" />
            RAG Storage: {totalStorageKB} KB / 50 MB
         </div>
      </div>

      {/* Action Tabs Top Row (Based on Screenshot: Add URL | Add Files | Create Text | Create Folder) */}
      <div className="w-full flex flex-wrap justify-start gap-4 mb-4">
        <div className="relative group flex flex-col">
          <button 
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/20 transition"
          >
            <Globe strokeWidth={1.5} className="text-zinc-400 group-hover:text-white" />
            <span className="font-semibold text-white">Add URL</span>
          </button>
        </div>
        {/* Add Files Group */}
        <div className="relative group flex flex-col">
          <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-zinc-900 border border-white/5 group-hover:border-[var(--lp-accent)] transition">
            <input 
              type="file" 
              accept=".pdf,.docx,.txt" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleDocumentUpload} 
              disabled={isLoading} 
            />
            {isLoading ? <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" /> : <FileText strokeWidth={1.5} className="text-zinc-400 group-hover:text-white" />}
            <span className="font-semibold text-white">Add Files</span>
          </button>
        </div>
        <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/20 transition group">
          <Type strokeWidth={1.5} className="text-zinc-400 group-hover:text-white" />
          <span className="font-semibold text-white">Create Text</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/20 transition group">
          <FolderPlus strokeWidth={1.5} className="text-zinc-400 group-hover:text-white" />
          <span className="font-semibold text-white">Create Folder</span>
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
          placeholder="Search Knowledge Base..." 
          className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-black"
        />
        <div className="flex gap-2 mt-3">
           <button className="text-xs text-zinc-500 border border-white/10 rounded px-2 py-1">+ Type</button>
           <button className="text-xs text-zinc-500 border border-white/10 rounded px-2 py-1">+ Creator</button>
        </div>
      </div>

       {/* Document List State */}
      {uploadedDocuments.length > 0 ? (
        <div ref={listRef} className="w-full space-y-3 flex flex-col bg-black/40 border border-white/10 rounded-xl p-4">
           {uploadedDocuments.map((doc, idx) => (
             <div key={idx} className="kb-list-item flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg border border-white/5 opacity-0 group">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white flex gap-3"><FileText className="text-[var(--lp-accent)] w-5 h-5"/> {doc.name}</span>
                  <span className="text-xs text-zinc-500 ml-8 mt-1">{doc.size} • Ingested on {doc.time}</span>
                </div>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
