'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  MessageCircle, CheckCircle2, Loader2, QrCode, RefreshCw, 
  Wifi, Shield, Smartphone, Terminal, Send, Activity, AlertTriangle
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'


interface WhatsAppConfigUIProps {
  userId?: string;
  agentId?: string;
  apiBase?: string; // Ignored — always uses Render backend
}

// Always route to Render backend (Baileys needs persistent Node.js runtime)
const API_BASE = process.env.NEXT_PUBLIC_NODE_API_URL || 'https://launch-pixel-backend.onrender.com'

export default function WhatsAppConfigUI({ userId, agentId }: WhatsAppConfigUIProps) {
  const [status, setStatus] = useState<string>("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [logs, setLogs] = useState<{ id: string, msg: string, time: string, type: 'in' | 'out' | 'error' }[]>([
    { id: '1', msg: 'System ready for connection...', time: 'INIT', type: 'out' }
  ]);
  const [agents, setAgents] = useState<{ id: string | number, name: string }[]>([]);
  const [localAgentId, setLocalAgentId] = useState<string | undefined>(agentId);

  // Refs to avoid stale closures in intervals/timeouts
  const statusRef = useRef(status);
  const qrRef = useRef(qr);
  const isConnectingRef = useRef(isConnecting);
  
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { qrRef.current = qr; }, [qr]);
  useEffect(() => { isConnectingRef.current = isConnecting; }, [isConnecting]);

  const addLog = useCallback((msg: string, type: 'in' | 'out' | 'error' = 'in') => {
    setLogs(prev => [
      { id: `log-${Date.now()}-${Math.random().toString(36).slice(2)}`, msg, time: new Date().toLocaleTimeString(), type },
      ...prev.slice(0, 49) // Keep max 50 logs
    ]);
  }, []);

  useEffect(() => {
    if (agentId) setLocalAgentId(agentId);
  }, [agentId]);

  // Fetch agent list for dropdown
  useEffect(() => {
    if (!userId) return;
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/agent-configurations?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          const configs = data.configurations || [];
          setAgents(configs);
          if (!localAgentId && configs.length > 0) {
            setLocalAgentId(String(configs[0].id));
          }
        }
      } catch (e) { console.error("Failed to fetch agents", e); }
    };
    fetchAgents();
  }, [userId]);

  const fetchStatus = useCallback(async () => {
    if (!localAgentId) return;
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/status/${localAgentId}`)
      if (!res.ok) {
        addLog(`Status check failed (HTTP ${res.status})`, 'error');
        return;
      }
      const data = await res.json()
      if (data?.status) {
        const oldStatus = statusRef.current;
        setStatus(data.status);
        if (data.status === "connected") {
          setQr(null);
          if (oldStatus !== 'connected') {
            addLog('✅ WhatsApp connected successfully!', 'in');
            setIsConnecting(false);
          }
        }
        if (data.qr && data.qr !== qrRef.current) {
          setQr(data.qr);
          addLog('New QR Code received. Scan with your phone.', 'out');
        }
      }
    } catch (e: any) {
      // Suppress "Failed to fetch" noise — only log unexpected errors
      if (e.message && !e.message.includes('Failed to fetch')) {
        addLog(`Status check error: ${e.message}`, 'error');
      }
    }
  }, [localAgentId, addLog]);

  const fetchQR = useCallback(async () => {
    if (!localAgentId) return;
    try {
      const res = await fetch(`${API_BASE}/api/whatsapp/qr/${localAgentId}`)
      if (!res.ok) {
        addLog(`QR fetch failed (HTTP ${res.status})`, 'error');
        return;
      }
      const data = await res.json()
      if (data) {
        if (data.qr && data.qr !== qrRef.current) {
          setQr(data.qr);
          addLog('QR Code updated. Awaiting scan...', 'out');
        }
        if (data.status) {
          const oldStatus = statusRef.current;
          setStatus(data.status);
          if (data.status === 'connected' && oldStatus !== 'connected') {
            addLog('✅ WhatsApp connected successfully!', 'in');
            setIsConnecting(false);
          }
        }
      }
    } catch (e: any) {
      // Suppress "Failed to fetch" noise during cold starts
      if (e.message && !e.message.includes('Failed to fetch')) {
        addLog(`QR fetch error: ${e.message}`, 'error');
      }
    }
  }, [localAgentId, addLog]);

  const handleConnectDirect = async () => {
    if (!localAgentId) return toast.error("Please select an agent first.");
    
    setIsConnecting(true);
    setLoadingQR(true);
    addLog('Initiating connection to WhatsApp servers...', 'out');
    addLog('⏳ First connection may take 10-30s (server wake-up)', 'out');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for cold starts
      
      const res = await fetch(`${API_BASE}/api/whatsapp/connect/${localAgentId}`, { 
        method: "POST",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok || data.error) {
        const errorMsg = data.error || `Connection failed (HTTP ${res.status})`;
        toast.error(errorMsg);
        addLog(`❌ ${errorMsg}`, 'error');
        setIsConnecting(false);
        return;
      }
      
      addLog('Connection established. Waiting for QR code from WhatsApp...', 'in');
      
      // Check if QR was returned in the connect response
      if (data.qr) {
        setQr(data.qr);
        addLog('✅ QR Code ready — scan it with WhatsApp on your phone', 'in');
        setLoadingQR(false);
        return;
      }
      
      if (data.status === 'connected') {
        setStatus('connected');
        addLog('✅ Already connected!', 'in');
        setIsConnecting(false);
        setLoadingQR(false);
        return;
      }
      
      // Poll for QR code with retries (backend may not have QR immediately)
      let retries = 0;
      const maxRetries = 15;
      const pollQR = async () => {
        retries++;
        await fetchQR();
        
        // Stop if: QR received, connected, or max retries
        if (qrRef.current || statusRef.current === 'connected') {
          if (qrRef.current) addLog('✅ QR Code ready — scan it with WhatsApp on your phone', 'in');
          setLoadingQR(false);
          return;
        }
        
        if (retries < maxRetries) {
          setTimeout(pollQR, 3000);
        } else {
          addLog('⚠️ QR code not received after max retries. Try again.', 'error');
          setLoadingQR(false);
          setIsConnecting(false);
        }
      };
      setTimeout(pollQR, 3000);
      
    } catch (e: any) {
      console.error("Failed to connect", e);
      if (e.name === 'AbortError') {
        toast.error("Connection timed out — the server may be starting up. Try again in 30s.");
        addLog('⏱️ Connection timed out. Server may be cold-starting. Retry in 30s.', 'error');
      } else {
        toast.error("Network error — check if backend is running.");
        addLog(`❌ Network error: ${e.message}`, 'error');
      }
      setIsConnecting(false);
    } finally {
      setLoadingQR(false);
    }
  };

  // Auto-poll status when agent changes
  useEffect(() => {
    if (!localAgentId) return;
    setStatus("disconnected");
    setQr(null);
    addLog(`Agent ${localAgentId} selected. Checking status...`, 'out');
    fetchStatus();
    
    // Poll faster when connecting (catch 'connected' event quickly)
    // Slower when idle or already connected
    const interval = setInterval(() => {
      if (isConnectingRef.current || qrRef.current) {
        fetchQR(); // Fast poll: every 5s during active connection
      } else if (statusRef.current === 'connected') {
        fetchStatus(); // Slow poll: every 5s when connected
      } else {
        fetchStatus(); // Normal poll when idle
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [localAgentId, fetchStatus, fetchQR, addLog]);

  const getLogIcon = (type: string) => {
    if (type === 'error') return <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5" />;
    if (type === 'out') return <Send className="w-3 h-3 text-[#FEED01] mt-0.5" />;
    return <Activity className="w-3 h-3 text-blue-400 mt-0.5" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEED01]/10 border border-[#FEED01]/20 text-[#FEED01] text-[10px] font-bold uppercase tracking-[0.2em]">
            <Activity className="w-3 h-3 animate-pulse" />
            Connection Status
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">WhatsApp Integration</h2>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest max-w-lg leading-relaxed">
            Connect your personal or business WhatsApp to enable automated AI messaging.
          </p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-[#0d0d0f] p-4 rounded-2xl border border-white/5">
            <button 
              onClick={() => { addLog('Manual status refresh...', 'out'); fetchStatus(); }}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
              title="Refresh Status"
            >
              <RefreshCw className="w-4 h-4 text-zinc-600 group-hover:text-[#FEED01]" />
            </button>
            <div className="text-right">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Connection</p>
              <p className={`text-xs font-black uppercase ${(status || 'disconnected') === 'connected' ? 'text-emerald-400' : isConnecting ? 'text-amber-400 animate-pulse' : 'text-[#FEED01]'}`}>
                {isConnecting ? 'CONNECTING...' : (status || 'disconnected').toUpperCase()}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : isConnecting ? 'bg-amber-500/10 text-amber-400' : 'bg-[#FEED01]/10 text-[#FEED01]'}`}>
              {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wifi className="w-5 h-5" />}
            </div>
          </div>
          
          <select 
            value={localAgentId || ''} 
            onChange={(e) => setLocalAgentId(e.target.value)}
            className="bg-[#0d0d0f] border border-white/5 text-white text-xs font-bold uppercase p-3 rounded-xl focus:border-[#FEED01]/50 outline-none w-full"
          >
            <option value="" disabled>Select an Agent</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Pairing Interface */}
        <div className="lg:col-span-5 bg-[#0d0d0f] border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#FEED0105_0%,transparent_50%)]" />
          
          <AnimatePresence mode="wait">
            {status === "connected" ? (
              <motion.div 
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 relative z-10"
              >
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
                  <div className="relative w-32 h-32 bg-zinc-950 border-2 border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic tracking-tighter text-white uppercase">Connected</h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">WhatsApp session is active</p>
                </div>
              </motion.div>
            ) : qr ? (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 relative z-10"
              >
                <div className="p-8 bg-white rounded-[2.5rem] shadow-[0_0_80px_rgba(254,237,1,0.15)] relative group-hover:scale-105 transition-transform duration-500">
                  <QRCodeSVG value={qr} size={200} level="H" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black text-[#FEED01] text-[10px] font-black tracking-[0.2em] rounded-full border border-[#FEED01]/30 uppercase shadow-2xl">
                    Scan QR Code
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
                  Devices {'>'} Link Device {'>'} Scan to initialize link.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8 relative z-10"
              >
                <div className="w-24 h-24 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-center mx-auto group-hover:border-[#FEED01]/30 transition-colors">
                  {isConnecting ? (
                    <Loader2 className="w-10 h-10 text-[#FEED01] animate-spin" />
                  ) : (
                    <QrCode className="w-10 h-10 text-zinc-700 group-hover:text-[#FEED01] transition-colors" />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">
                    {isConnecting ? 'Connecting...' : 'Waiting for Device'}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    {isConnecting ? 'Establishing secure connection' : 'Request pairing code to begin'}
                  </p>
                </div>
                <button 
                  onClick={handleConnectDirect}
                  disabled={isConnecting || loadingQR}
                  className="bg-[#FEED01] text-black font-black italic tracking-tighter px-10 py-5 rounded-2xl text-sm hover:scale-105 transition-all shadow-[0_0_40px_rgba(254,237,1,0.2)] active:scale-95 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Connecting...</span>
                  ) : "Connect Device"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity Log */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex-1 bg-[#0d0d0f] border border-white/5 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Connection Logs</h3>
                <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">{logs.length}</span>
              </div>
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500' : isConnecting ? 'bg-amber-500 animate-pulse' : 'bg-red-500/20'}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500' : 'bg-yellow-500/20'}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-emerald-500' : 'bg-emerald-500/20'}`} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar font-mono max-h-[300px]">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-4 group">
                  <span className="text-[9px] text-zinc-700 font-bold shrink-0 w-16">{log.time}</span>
                  <div className="flex items-start gap-2">
                    {getLogIcon(log.type)}
                    <p className={`text-[10px] group-hover:text-zinc-200 transition-colors leading-relaxed ${
                      log.type === 'error' ? 'text-red-400' : 'text-zinc-400'
                    }`}>
                      <span className="text-zinc-600">[{(log.type || 'out').toUpperCase()}]</span> {log.msg}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Encryption: AES-256-GCM</p>
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span className={`text-[9px] font-black uppercase ${status === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {status === 'connected' ? 'System Active' : 'Standby'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0d0d0f] border border-white/5 p-5 rounded-3xl group cursor-pointer hover:border-[#FEED01]/20 transition-all">
              <Shield className="w-4 h-4 text-[#FEED01] mb-3" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">HITL Protocol</p>
              <p className="text-[11px] font-bold text-white uppercase italic">Human Approval On</p>
            </div>
            <div className="bg-[#0d0d0f] border border-white/5 p-5 rounded-3xl group cursor-pointer hover:border-[#FEED01]/20 transition-all">
              <Smartphone className="w-4 h-4 text-[#FEED01] mb-3" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Persistence</p>
              <p className="text-[11px] font-bold text-white uppercase italic">Active Background</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
