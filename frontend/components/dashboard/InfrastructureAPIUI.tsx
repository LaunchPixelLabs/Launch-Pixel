'use client'
import React, { useState, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, Check, Shield, Globe, Terminal, Loader2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function InfrastructureAPIUI() {
  const [keys, setKeys] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    // Simulated fetch - in production this hits /api/v1/external/keys
    setTimeout(() => {
      setKeys([
        { id: 1, name: 'Main Production Key', apiKey: 'lp_live_4f8k2l9s1a0p3x', createdAt: '2026-04-25', lastUsed: '2 hours ago', status: 'active' },
        { id: 2, name: 'Development Sandbox', apiKey: 'lp_test_9z2m1n5b8v7c6x', createdAt: '2026-04-24', lastUsed: 'Never', status: 'active' }
      ])
      setIsLoading(false)
    }, 800)
  }, [])

  const generateKey = () => {
    if (!newKeyName) {
      toast.error("Please enter a name for the key")
      return
    }
    setIsGenerating(true)
    setTimeout(() => {
      const newKey = {
        id: Date.now(),
        name: newKeyName,
        apiKey: `lp_live_${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString().split('T')[0],
        lastUsed: 'Never',
        status: 'active'
      }
      setKeys([newKey, ...keys])
      setNewKeyName('')
      setIsGenerating(false)
      toast.success("Infrastructure API Key Generated")
    }, 1500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    toast.success("Key copied to clipboard")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 backdrop-blur-3xl max-w-6xl mx-auto w-full relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] -mr-48 -mt-48 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
               <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-3xl font-sketch font-bold text-white tracking-tight">Infrastructure API</h2>
          </div>
          <p className="text-sm text-zinc-500 font-sketch">Scale your AI fleet by integrating Launch-Pixel directly into your own applications.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Key Name (e.g. Mobile App)" 
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all w-full md:w-64"
          />
          <button 
            onClick={generateKey}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2 bg-[#FEED01] text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate Key
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Endpoint</span>
          </div>
          <p className="text-white font-mono text-sm truncate">https://api.launchpixel.io/v1</p>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Shield className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Security</span>
          </div>
          <p className="text-white font-mono text-sm">AES-256 Encrypted</p>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Rate Limit</span>
          </div>
          <p className="text-white font-mono text-sm">100 req/min</p>
        </div>
      </div>

      <div className="w-full border border-white/5 rounded-[2rem] overflow-hidden bg-black/40 backdrop-blur-xl relative z-10">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-white/[0.02] text-zinc-500 uppercase text-[10px] font-bold tracking-[0.3em]">
            <tr>
               <th className="px-8 py-5">Key Name</th>
               <th className="px-8 py-5">API Key</th>
               <th className="px-8 py-5">Last Used</th>
               <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center">
                  <Loader2 className="w-8 h-8 text-zinc-700 animate-spin mx-auto" />
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-12 text-center text-zinc-600 italic">
                  No active infrastructure keys found. Generate one to start integrating.
                </td>
              </tr>
            ) : keys.map(key => (
              <tr key={key.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <p className="text-white font-bold">{key.name}</p>
                  <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">Created {key.createdAt}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3 bg-zinc-950/50 border border-white/5 px-4 py-2 rounded-xl w-fit">
                    <code className="text-xs text-amber-500/80 font-mono">
                      {copiedKey === key.apiKey ? key.apiKey : `${key.apiKey.substring(0, 8)}****************`}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(key.apiKey)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      {copiedKey === key.apiKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className="text-[10px] font-mono text-zinc-500 uppercase">{key.lastUsed}</span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 p-8 bg-zinc-900/30 border border-white/5 rounded-[2rem] flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <Key className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-grow">
          <h4 className="text-white font-bold mb-1">Developer Documentation</h4>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl">
            Our External Infrastructure API follows a standard REST pattern. Use your API key in the <code className="text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">x-api-key</code> header for all requests. 
            View the full neural documentation at <span className="text-white underline cursor-pointer">docs.launchpixel.io</span>.
          </p>
        </div>
        <button className="px-6 py-2 border border-white/10 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/5 transition-all">
          View SDKs
        </button>
      </div>
    </div>
  )
}
