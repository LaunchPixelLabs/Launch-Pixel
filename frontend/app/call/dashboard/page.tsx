"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Upload, Mic, Users, BarChart3, Settings, Play, Link as LinkIcon, FileText, CheckCircle2, ChevronRight, PhoneOutgoing, PhoneIncoming, Save, AlertCircle, Phone, Loader2, LogOut, Download, X, CreditCard, Code, Database, PhoneCall } from "lucide-react"
import Navigation from "../../../components/Navigation"
import Link from "next/link"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "../../../lib/firebase"
import { parseAndValidateCSV, generateCorrectedCSV, downloadCSV, ValidationError, Contact } from "../../../lib/csvParser"
import { toast } from "sonner"
import SteeringCanvas from "../../../components/SteeringCanvas"
import AdvancedAgentUI from "../../../components/dashboard/AdvancedAgentUI"
import AgentListView from "../../../components/dashboard/AgentListView"
import KnowledgeBaseUI from "../../../components/dashboard/KnowledgeBaseUI"
import ToolsMarketplaceUI from "../../../components/dashboard/ToolsMarketplaceUI"
import IntegrationsUI from "../../../components/dashboard/IntegrationsUI"
import VoiceLibraryUI from "../../../components/dashboard/VoiceLibraryUI"
import UserManagementUI from "../../../components/dashboard/UserManagementUI"
import NumberManagementUI from "../../../components/dashboard/NumberManagementUI"
import WhatsAppConfigUI from "../../../components/dashboard/WhatsAppConfigUI"
import WorkflowBuilderUI from "../../../components/dashboard/WorkflowBuilderUI"
import ThemeSwitcher from "../../../components/ThemeSwitcher"
import TestAgentUI from "../../../components/dashboard/TestAgentUI"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const WORKER_BASE = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787"

type Tab = "agents" | "workflow" | "knowledge" | "configure" | "contacts" | "analytics" | "playground" | "tools" | "integrations" | "voices" | "conversations" | "users" | "numbers" | "whatsapp" | "outbound" | "test"

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("agents")
  const [agentType, setAgentType] = useState<"outbound" | "inbound">("outbound")
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Data states
  const [contacts, setContacts] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [callLogs, setCallLogs] = useState<any[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  
  // No-Code Agent Configuration states
  const [agentName, setAgentName] = useState("My Calling Agent")
  const [agentLanguage, setAgentLanguage] = useState("en")
  const [interruptible, setInterruptible] = useState(true)
  const [promptInjectionProtection, setPromptInjectionProtection] = useState(true)
  const [hallucinationGuard, setHallucinationGuard] = useState(false)
  const [contextMemoryWindow, setContextMemoryWindow] = useState("standard")
  
  // Advanced behavior state
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [scrapedData, setScrapedData] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [firstMessage, setFirstMessage] = useState("")
  const [voiceId, setVoiceId] = useState("rachel")
  
  // Multi-agent state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)

  // Load a specific agent's config into the form
  const loadAgentConfig = async (agentId: string) => {
    setSelectedAgentId(agentId)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/agent-configurations/${agentId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const config = data.configuration
        if (config) {
          setAgentName(config.name || "My Agent")
          setSystemPrompt(config.systemPrompt || "")
          setFirstMessage(config.firstMessage || "")
          setVoiceId(config.voiceId || "rachel")
          setAgentLanguage(config.language || "en")
          setAgentType(config.agentType || "inbound")
          setCanvasState(config.canvasState || null)
          setEnabledTools(config.enabledTools || [])
          setTransferPhoneNumber(config.transferPhoneNumber || "")
        }
      }
    } catch (e) {
      console.error('Failed to load agent config:', e)
    }
    setActiveTab("configure")
  }

  // Manual call state
  const [manualPhone, setManualPhone] = useState("")
  const [manualName, setManualName] = useState("")

  // CSV import states
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvValidationErrors, setCsvValidationErrors] = useState<ValidationError[]>([])
  const [csvValidContacts, setCsvValidContacts] = useState<Contact[]>([])
  const [showValidationReport, setShowValidationReport] = useState(false)
  const [csvSummary, setCsvSummary] = useState<{
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicates: number;
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper: get auth headers with Firebase JWT token
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    if (!currentUser) return {}
    try {
      const token = await currentUser.getIdToken()
      return { Authorization: `Bearer ${token}` }
    } catch {
      return {}
    }
  }

  // Set default system prompt based on agent type
  useEffect(() => {
    if (!systemPrompt) {
      setSystemPrompt(agentType === "outbound"
        ? `You are a professional outbound sales agent for our company.

## CORE BEHAVIOR
- Greet the contact warmly by name if available.
- Introduce yourself and the company briefly (1-2 sentences max).
- State the reason for the call clearly and confidently.
- Listen actively and respond to objections with empathy.
- Never argue. If they're not interested, thank them and end gracefully.

## KNOWLEDGE & GUARDRAILS
- Only discuss information from your knowledge base. Never fabricate facts.
- If you don't know something, say: "That's a great question — let me have our team follow up with the details."
- Never share pricing unless explicitly trained on it.
- Never collect sensitive data (SSN, credit card, passwords).

## CALL FLOW
1. Greeting → 2. Value Pitch → 3. Handle Objections → 4. Book Meeting or Collect Interest → 5. Summarize & Close

## TOOLS
- Use the \"notify_team\" tool to send a WhatsApp summary after every call.
- Use \"book_meeting\" if the contact agrees to a follow-up.

## EDGE CASES
- If you detect voicemail: Leave a brief 15-second message and hang up.
- If silence for >8 seconds: Say "Are you still there?" — if no response after 5 more seconds, end the call politely.
- If the contact asks to be removed: Acknowledge, apologize, and end the call.`
        : `You are a professional inbound support agent for our company.

## CORE BEHAVIOR
- Greet callers warmly and ask how you can help.
- Listen to their query and provide accurate answers from your knowledge base.
- Be patient, empathetic, and professional at all times.

## KNOWLEDGE & GUARDRAILS
- Only use information from your knowledge base. Never fabricate facts.
- If you don't know something, say: "Let me connect you with someone who can help with that."
- Never collect sensitive data (SSN, credit card, passwords).

## CALL FLOW
1. Greeting → 2. Understand Query → 3. Provide Answer → 4. Confirm Resolution → 5. Offer Further Help → 6. Close

## TOOLS
- Use the \"notify_team\" tool to alert the team about important inquiries.
- Use \"book_meeting\" to schedule callbacks when needed.

## EDGE CASES
- If silence for >8 seconds: Say "Are you still there?" — if no response, end politely.
- If caller is upset: Acknowledge their frustration, apologize, and escalate if needed.`
      )
    }
  }, [agentType])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user)
        setIsAuthLoading(false)
      } else {
        router.push("/call/auth")
      }
    })

    // 1-Hour Inactivity Timeout (3,600,000 ms)
    let timeoutId: NodeJS.Timeout;
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut(auth);
        router.push("/call/auth");
        toast.error("Session expired due to inactivity.");
      }, 3600000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimeout));
    resetTimeout();

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimeout));
    }
  }, [router])

  // Fetch data once user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchContacts()
      fetchAnalytics()
      fetchCallLogs()
    }
  }, [currentUser])

  const handleSignOut = async () => {
    try {
      // Sign out from Firebase and clear session
      await signOut(auth)
      // Clear local state
      setCurrentUser(null)
      setContacts([])
      // Redirect to auth page
      router.push("/call/auth")
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const fetchContacts = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/agent-contacts`, { headers })
      if (res.ok) {
        const json = await res.json()
        setContacts(json.contacts || json || [])
      }
    } catch (e) {
      console.error("Failed to load contacts", e)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/analytics`, { headers })
      if (res.ok) {
        const json = await res.json()
        if (json.success) setAnalyticsData(json.data)
      }
    } catch (e) {
      console.error("Failed to load analytics", e)
    }
  }

  const fetchCallLogs = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/call-logs`, { headers })
      if (res.ok) {
        const json = await res.json()
        if (json.success) setCallLogs(json.data)
      }
    } catch (e) {
      console.error("Failed to load call logs", e)
    }
  }

  const handleScrape = async () => {
    if (!websiteUrl) return
    setIsLoading(true)
    try {
      const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" }
      const res = await fetch(`${API_BASE}/api/call/scrape`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url: websiteUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        setScrapedData("Successfully scraped content from " + websiteUrl + "\nFound: " + (data.sections?.join(", ") || "Pricing, About Us, FAQ"))
      } else {
        const error = await res.json()
        setScrapedData("Failed to scrape: " + (error.message || "Unknown error"))
      }
    } catch (e) {
      console.error(e)
      setScrapedData("Error connecting to server.")
    } finally {
      setIsLoading(false)
    }
  }

  // Canvas state (persisted to DB via agent-configurations)
  const [canvasState, setCanvasState] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [enabledTools, setEnabledTools] = useState<string[]>([]);
  const [transferPhoneNumber, setTransferPhoneNumber] = useState("");

  const handleCanvasSave = (state: { nodes: any[]; edges: any[]; enabledTools: string[] }) => {
    setCanvasState({ nodes: state.nodes, edges: state.edges });
    setEnabledTools(state.enabledTools);
    // Trigger full config save
    handleSaveConfig(state);
  };

  const handleSaveConfig = async (canvasData?: { nodes: any[]; edges: any[]; enabledTools: string[] }) => {
    setIsLoading(true)
    try {
      const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" }
      
      // Save to agent-configurations endpoint (primary persistence)
      const configRes = await fetch(`${API_BASE}/api/agent-configurations`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          agentId: selectedAgentId ? Number(selectedAgentId) : undefined,
          userId: currentUser?.uid,
          agentType,
          name: agentName,
          systemPrompt,
          voiceId,
          firstMessage,
          language: agentLanguage,
          canvasState: canvasData ? { nodes: canvasData.nodes, edges: canvasData.edges } : canvasState,
          enabledTools: canvasData?.enabledTools || enabledTools,
          transferPhoneNumber,
        }),
      })

      if (configRes.ok) {
        toast.success("Agent configuration saved!")
        
        // Also sync the tools to ElevenLabs if tools changed
        if (canvasData?.enabledTools && canvasData.enabledTools.length > 0) {
          try {
            await fetch(`${API_BASE}/api/agent-configurations/sync-tools`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                userId: currentUser?.uid,
                enabledTools: canvasData.enabledTools,
              }),
            })
            toast.success("ElevenLabs tools synced!")
          } catch {
            // Non-critical: tools can be synced later
            toast("Tools will sync on next deploy", { icon: "⚠️" })
          }
        }
      } else {
        const error = await configRes.json()
        toast.error("Save failed: " + (error.message || "Unknown error"))
      }
    } catch (e) {
      console.error(e)
      toast.error("Error saving agent configuration.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // File validation
    const validExtensions = ['pdf', 'docx', 'txt']
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !validExtensions.includes(extension)) {
      toast.error("Invalid file format. Only PDF, DOCX, and TXT are allowed.")
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is larger than 10MB limit.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    
    setIsLoading(true)
    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/call/train`, {
        method: "POST",
        headers: authHeaders,
        body: formData,
      })
      if (res.ok) {
        setUploadedDocuments(prev => [...prev, { name: file.name, time: new Date().toLocaleTimeString() }])
        toast.success("Document trained successfully!")
      } else {
        const error = await res.json()
        toast.error("Training failed: " + (error.message || "Unknown error"))
      }
    } catch (e) {
      console.error(e)
      toast.error("Error training document.")
    } finally {
      setIsLoading(false)
      if (event.target) event.target.value = '' // Clear input
    }
  }

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setIsLoading(true)
    setCsvValidationErrors([])
    setCsvValidContacts([])
    setShowValidationReport(false)

    try {
      // Parse and validate CSV with default US country code
      const result = await parseAndValidateCSV(file, "1")
      
      setCsvValidContacts(result.valid)
      setCsvValidationErrors(result.invalid)
      setCsvSummary(result.summary)
      setShowValidationReport(true)

      // If there are valid contacts and no errors, automatically import them
      if (result.valid.length > 0 && result.invalid.length === 0) {
        await importValidContacts(result.valid)
      }
    } catch (error: any) {
      toast.error(`CSV parsing error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const importValidContacts = async (validContacts: Contact[]) => {
    try {
      const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" }
      const response = await fetch(`${API_BASE}/api/agent-contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ contacts: validContacts }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully imported ${validContacts.length} contacts!`)
        fetchContacts() // Refresh contact list
        
        // Reset CSV import state
        setCsvFile(null)
        setCsvValidationErrors([])
        setCsvValidContacts([])
        setShowValidationReport(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        const error = await response.json()
        toast.error(`Import failed: ${error.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Import error:", error)
      toast.error("Failed to import contacts. Please try again.")
    }
  }

  const handleDownloadCorrectedCSV = async () => {
    if (!csvFile || csvValidationErrors.length === 0) return

    try {
      const correctedCSV = await generateCorrectedCSV(csvFile, csvValidationErrors)
      const timestamp = new Date().toISOString().split('T')[0]
      downloadCSV(correctedCSV, `contacts_errors_${timestamp}.csv`)
    } catch (error: any) {
      toast.error(`Failed to generate corrected CSV: ${error.message}`)
    }
  }

  const handleBatchCall = async () => {
    const callableContacts = contacts.filter(c => c.status !== 'Called' && c.status !== 'Interested' && c.status !== 'Completed')
    if (callableContacts.length === 0) {
      toast.info("No pending contacts to call.")
      return
    }
    
    if (!confirm(`Ready to initiate batch calls to ${callableContacts.length} contacts? This will take ~${callableContacts.length * 10} seconds.`)) return

    setIsLoading(true)
    let processed = 0
    
    ;(async () => {
      try {
        for (const contact of callableContacts) {
          await fetch(`${WORKER_BASE}/initiate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toPhone: contact.phone, contactName: contact.name }),
          })
          processed++
          await new Promise(r => setTimeout(r, 10_000))
        }
        toast.success(`Batch call finished! Dispatched ${processed} calls.`)
        fetchContacts()
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    })()

    toast.info("Batch call process started in the background. 1 call every 10 seconds.")
  }

  const handleQuickCall = async (phone: string, name?: string) => {
    if (!phone) return
    setIsLoading(true)
    try {
      const res = await fetch(`${WORKER_BASE}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone: phone, contactName: name }),
      })
      if (res.ok) {
        toast.success("Call initiated to " + phone)
        fetchContacts()
      } else {
        const error = await res.json() as any
        toast.error("Failed to initiate call: " + (error.error || "Unknown error"))
      }
    } catch (e) {
      console.error(e)
      toast.error("Error initiating call.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualCall = async () => {
    if (!manualPhone) return
    // Normalize: if user types a raw number, prepend +91
    let phone = manualPhone.trim()
    if (!phone.startsWith("+")) {
      phone = "+91" + phone.replace(/^0/, "")
    }
    await handleQuickCall(phone, manualName || undefined)
    setManualPhone("")
    setManualName("")
  }

  const handleExportCSV = () => {
    if (callLogs.length === 0) {
      toast.info("No call logs to export.")
      return
    }
    const headers = ["Date", "Contact Phone", "Contact Name", "Duration (s)", "Status", "Outcome", "Voice Quality"]
    const rows = callLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.contactPhone,
      log.AgentContact?.name || '',
      Math.round(log.duration),
      log.status,
      log.outcome || "-",
      log.voiceQuality ? "Poor" : "Good"
    ])
    
    let csvContent = headers.join(",") + "\n"
    rows.forEach(row => {
      const escapedRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`)
      csvContent += escapedRow.join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `call_logs_export.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportValidOnly = async () => {
    if (csvValidContacts.length === 0) return
    
    setIsLoading(true)
    try {
      await importValidContacts(csvValidContacts)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseValidationReport = () => {
    setShowValidationReport(false)
    setCsvFile(null)
    setCsvValidationErrors([])
    setCsvValidContacts([])
    setCsvSummary(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-white/20">
      <Navigation />

      <div className="pt-32 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-800 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 font-display">AI Agent Workspace</h1>
              <p className="text-gray-400">Configure, train, and deploy your autonomous calling agents.</p>
              {currentUser && (
                <p className="text-sm text-gray-500 mt-1">
                  Signed in as {currentUser.email}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition-all"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Mobile Navigation Dropdown */}
            <div className="lg:hidden w-full">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Navigation Menu</label>
              <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as Tab)}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[var(--lp-accent)]/50 appearance-none"
              >
                <optgroup label="Build">
                  <option value="agents">Agents</option>
                  <option value="knowledge">Knowledge Base</option>
                  <option value="tools">Tools</option>
                  <option value="voices">Voices</option>
                </optgroup>
                <optgroup label="Deploy">
                  <option value="integrations">Integrations</option>
                  <option value="numbers">Phone Numbers</option>
                  <option value="whatsapp">WhatsApp</option>
                </optgroup>
                <optgroup label="Operate">
                  <option value="conversations">Conversations</option>
                  <option value="users">Users</option>
                  <option value="outbound">Outbound Campaigns</option>
                </optgroup>
                <optgroup label="Test">
                  <option value="test">Agent Simulator</option>
                </optgroup>
              </select>
            </div>

            {/* Sidebar Navigation */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="bg-black/50 border border-white/10 rounded-2xl p-4 sticky top-28 backdrop-blur-xl">
                <nav className="space-y-6">
                  {/* Build Group */}
                  <div>
                    <h3 className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Build</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setActiveTab("agents")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "agents" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Agents</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("workflow")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "workflow" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Workflow Canvas</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("knowledge")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "knowledge" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Knowledge Base</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("tools")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "tools" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Tools</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("voices")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "voices" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Voices</span>
                      </button>
                    </div>
                  </div>

                  {/* Deploy Group */}
                  <div>
                    <h3 className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 mt-2">Deploy</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setActiveTab("integrations")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "integrations" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Integrations</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab("numbers")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "numbers" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Phone Numbers</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab("whatsapp")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "whatsapp" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Operate Group */}
                  <div>
                    <h3 className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 mt-2">Operate</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => setActiveTab("conversations")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "conversations" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Conversations</span>
                      </button>
                      <button
                        onClick={() => setActiveTab("users")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "users" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Users</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab("outbound")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "outbound" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Outbound Campaigns</span>
                      </button>
                    </div>
                  </div>

                  {/* Test Group */}
                  <div>
                    <h3 className="px-4 text-[10px] font-bold text-[var(--lp-accent)] uppercase tracking-widest mb-3 mt-2">Test</h3>
                    <div className="space-y-1">
                      <button 
                        onClick={() => setActiveTab("test")}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${
                          activeTab === "test" ? "bg-[var(--lp-accent)]/20 text-[var(--lp-accent)] border border-[var(--lp-accent)]/30" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }`}
                      >
                        <span className="font-medium text-sm">Agent Simulator</span>
                      </button>
                    </div>
                  </div>

                  {/* Settings / Upgrade */}
                  <div className="pt-4 border-t border-white/10">
                    <Link
                      href="/call/pricing"
                      className="w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <span className="font-medium text-sm">Upgrade Plan</span>
                    </Link>
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                {/* ----------------- AGENT TEMPLATES LIST ----------------- */}
                {activeTab === "agents" && (
                  <motion.div
                    key="agents"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full flex flex-col"
                  >
                    <AgentListView 
                      currentUser={currentUser} 
                      onAgentSelect={(id) => loadAgentConfig(id)} 
                    />
                  </motion.div>
                )}

                {/* ----------------- KNOWLEDGE BASE ----------------- */}
                {activeTab === "knowledge" && (
                  <motion.div
                    key="knowledge"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full flex flex-col"
                  >
                    <KnowledgeBaseUI />
                  </motion.div>
                )}

                {/* ----------------- TOOLS ----------------- */}
                {activeTab === "tools" && (
                  <motion.div key="tools" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                    <ToolsMarketplaceUI />
                  </motion.div>
                )}

                {/* ----------------- INTEGRATIONS ----------------- */}
                {activeTab === "integrations" && (
                  <motion.div key="integrations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                    <IntegrationsUI />
                  </motion.div>
                )}

                {/* ----------------- VOICES ----------------- */}
                {activeTab === "voices" && (
                  <motion.div key="voices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                    <VoiceLibraryUI currentVoiceId={voiceId} onSelectVoice={setVoiceId} />
                  </motion.div>
                )}

                {/* ----------------- USERS ----------------- */}
                {activeTab === "users" && (
                  <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                    <UserManagementUI currentUserEmail={currentUser?.email || undefined} />
                  </motion.div>
                )}

                {/* ----------------- PHONE NUMBERS ----------------- */}
                {activeTab === "numbers" && (
                  <motion.div key="numbers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                    <NumberManagementUI />
                  </motion.div>
                )}

                {/* ----------------- WHATSAPP ----------------- */}
                {activeTab === "whatsapp" && (
                  <motion.div key="whatsapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full flex flex-col">
                    <WhatsAppConfigUI userId={currentUser?.uid} />
                  </motion.div>
                )}

                {/* ----------------- CONFIGURE TAB (AGENT STUDIO) ----------------- */}
                {activeTab === "configure" && (
                  <motion.div
                    key="configure"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full flex flex-col"
                  >
                    <AdvancedAgentUI 
                      systemPrompt={systemPrompt}
                      setSystemPrompt={setSystemPrompt}
                      firstMessage={firstMessage}
                      setFirstMessage={setFirstMessage}
                      agentLanguage={agentLanguage}
                      setAgentLanguage={setAgentLanguage}
                      voiceId={voiceId}
                      setVoiceId={setVoiceId}
                      interruptible={interruptible}
                      setInterruptible={setInterruptible}
                      promptInjectionProtection={promptInjectionProtection}
                      setPromptInjectionProtection={setPromptInjectionProtection}
                      hallucinationGuard={hallucinationGuard}
                      setHallucinationGuard={setHallucinationGuard}
                      isLoading={isLoading}
                      onSave={() => handleSaveConfig()}
                      onCanvasSave={handleCanvasSave}
                      canvasState={canvasState}
                      transferPhoneNumber={transferPhoneNumber}
                      setTransferPhoneNumber={setTransferPhoneNumber}
                    />
                  </motion.div>
                )}

                {/* ----------------- WORKFLOW TAB ----------------- */}
                {activeTab === "workflow" && (
                  <motion.div
                    key="workflow"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="w-full h-full min-h-[600px]"
                  >
                    <WorkflowBuilderUI />
                  </motion.div>
                )}

                {/* ----------------- TEST TAB ----------------- */}
                {activeTab === "test" && (
                  <motion.div
                    key="test"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <TestAgentUI />
                  </motion.div>
                )}

                {/* ----------------- OUTBOUND TAB (CSV, Quick Dial, Batch calls) ----------------- */}
                {activeTab === "outbound" && (
                  <motion.div
                    key="outbound"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Manual Call Card */}
                    {agentType === "outbound" && (
                      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-500/20">
                            <Phone className="w-5 h-5 text-violet-400" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-white">Quick Dial</h2>
                            <p className="text-xs text-gray-400">Manually call any number instantly</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={manualName}
                            onChange={(e) => setManualName(e.target.value)}
                            placeholder="Contact name (optional)"
                            className="flex-1 px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:ring-2 focus:ring-white text-sm"
                          />
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">+91</span>
                            <input
                              type="tel"
                              value={manualPhone}
                              onChange={(e) => setManualPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                              placeholder="9876543210"
                              className="w-full pl-14 pr-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-zinc-500 focus:ring-2 focus:ring-white text-sm font-mono"
                            />
                          </div>
                          <button
                            onClick={handleManualCall}
                            disabled={!manualPhone || isLoading}
                            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors whitespace-nowrap"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneOutgoing className="w-4 h-4" />}
                            Call Now
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Campaign Audience</h2>
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
                            className={`px-4 py-2 bg-gray-800 text-white rounded-lg text-sm border border-gray-700 hover:bg-gray-700 cursor-pointer flex items-center gap-2 ${
                              isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            {isLoading ? "Processing..." : "Import CSV"}
                          </label>
                        </div>
                      </div>

                      {/* CSV Validation Report */}
                      {showValidationReport && csvSummary && (
                        <div className="mb-6 bg-gray-950 border border-gray-700 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-2">CSV Validation Report</h3>
                              <p className="text-sm text-gray-400">
                                File: {csvFile?.name}
                              </p>
                            </div>
                            <button
                              onClick={handleCloseValidationReport}
                              className="text-gray-400 hover:text-white transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Summary Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                              <p className="text-xs text-gray-400 mb-1">Total Rows</p>
                              <p className="text-2xl font-bold text-white">{csvSummary.totalRows}</p>
                            </div>
                            <div className="bg-gray-900 border border-zinc-500/20 rounded-lg p-4">
                              <p className="text-xs text-gray-400 mb-1">Valid</p>
                              <p className="text-2xl font-bold text-white">{csvSummary.validRows}</p>
                            </div>
                            <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4">
                              <p className="text-xs text-gray-400 mb-1">Invalid</p>
                              <p className="text-2xl font-bold text-red-400">{csvSummary.invalidRows}</p>
                            </div>
                            <div className="bg-gray-900 border border-yellow-500/20 rounded-lg p-4">
                              <p className="text-xs text-gray-400 mb-1">Duplicates</p>
                              <p className="text-2xl font-bold text-yellow-400">{csvSummary.duplicates}</p>
                            </div>
                          </div>

                          {/* Error Details */}
                          {csvValidationErrors.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                Validation Errors ({csvValidationErrors.length})
                              </h4>
                              <div className="bg-gray-900 border border-red-500/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                                <div className="space-y-2">
                                  {csvValidationErrors.slice(0, 10).map((error, index) => (
                                    <div key={index} className="text-sm">
                                      <span className="text-red-400 font-mono">Row {error.row}</span>
                                      <span className="text-gray-500 mx-2">•</span>
                                      <span className="text-gray-300">{error.field}:</span>
                                      <span className="text-gray-400 ml-2">{error.error}</span>
                                      {error.value && (
                                        <span className="text-gray-500 ml-2">({error.value})</span>
                                      )}
                                    </div>
                                  ))}
                                  {csvValidationErrors.length > 10 && (
                                    <p className="text-xs text-gray-500 mt-2">
                                      ... and {csvValidationErrors.length - 10} more errors
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            {csvValidContacts.length > 0 && (
                              <button
                                onClick={handleImportValidOnly}
                                disabled={isLoading}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Import {csvValidContacts.length} Valid Contacts
                              </button>
                            )}
                            {csvValidationErrors.length > 0 && (
                              <button
                                onClick={handleDownloadCorrectedCSV}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 border border-gray-700"
                              >
                                <Download className="w-4 h-4" />
                                Download Error Report
                              </button>
                            )}
                          </div>

                          {csvValidationErrors.length > 0 && (
                            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <p className="text-sm text-blue-400">
                                <strong>Tip:</strong> Download the error report to see which rows need correction. 
                                Fix the errors in your CSV and upload again, or import only the valid contacts now.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="border border-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-400">
                          <thead className="bg-gray-950 text-gray-300 font-medium">
                            <tr>
                              <th className="px-4 py-3">Name</th>
                              <th className="px-4 py-3">Phone</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {contacts.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                  No contacts found in the database. Imports will appear here.
                                </td>
                              </tr>
                            ) : (
                              contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-gray-800/30">
                                  <td className="px-4 py-3 font-medium text-white">{contact.name}</td>
                                  <td className="px-4 py-3">{contact.phone}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 border rounded-full text-xs ${
                                      contact.status === 'Called' ? 'bg-zinc-800 text-white border-zinc-700' : 
                                      'bg-zinc-900 text-zinc-400 border-zinc-800'
                                    }`}>
                                      {contact.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button onClick={() => handleQuickCall(contact.phone)} disabled={isLoading} className="p-1.5 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50">
                                      <Phone className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {agentType === "outbound" && (
                        <div className="mt-6 flex justify-end">
                          <button 
                            onClick={handleBatchCall}
                            disabled={contacts.length === 0 || isLoading}
                            className="px-6 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl font-medium flex items-center gap-2 disabled:opacity-50"
                          >
                            <PhoneOutgoing className="w-5 h-5" />
                            Initiate Batch Call
                          </button>
                        </div>
                      )}
                      
                      {agentType === "inbound" && (
                        <div className="mt-6 p-6 bg-zinc-900/50 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center shrink-0">
                              <PhoneIncoming className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-zinc-400 font-medium mb-1">Assigned Inbound Number</h4>
                              <p className="text-2xl font-mono text-white font-medium tracking-tight">Not configured</p>
                              <p className="text-sm text-zinc-500 mt-1">Configure your Twilio Webhook to activate inbound calling.</p>
                            </div>
                          </div>
                          <button className="px-4 py-2.5 bg-white text-black hover:bg-zinc-200 text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                            Configure Number
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ----------------- CONVERSATIONS TAB (Analytics & Call Logs) ----------------- */}
                {activeTab === "conversations" && (
                  <motion.div
                    key="conversations"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                        <p className="text-sm text-gray-400 mb-1">Total Calls</p>
                        <p className="text-3xl font-bold text-white">{analyticsData ? analyticsData.totalCalls : "0"}</p>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                        <p className="text-sm text-gray-400 mb-1">Minutes Used</p>
                        <p className="text-3xl font-bold text-white">{analyticsData ? Math.round(analyticsData.totalMinutes) : "0"}m</p>
                      </div>
                      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
                        <p className="text-sm text-gray-400 mb-1">Meetings Booked</p>
                        <p className="text-3xl font-bold text-white">{analyticsData ? `${analyticsData.meetingsBooked} (${analyticsData.conversionRate}%)` : "0 (0%)"}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl mt-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Call Logs</h2>
                        <button 
                          onClick={handleExportCSV}
                          disabled={callLogs.length === 0}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm border border-gray-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          Export CSV
                        </button>
                      </div>
                      <div className="border border-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm text-gray-400">
                          <thead className="bg-gray-950 text-gray-300 font-medium">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Contact</th>
                              <th className="px-4 py-3">Duration</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Outcome</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {callLogs.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                  No call logs found.
                                </td>
                              </tr>
                            ) : (
                              callLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800/30">
                                  <td className="px-4 py-3">{new Date(log.timestamp).toLocaleString()}</td>
                                  <td className="px-4 py-3 font-medium text-white">{log.AgentContact?.name || log.contactPhone}</td>
                                  <td className="px-4 py-3">{Math.round(log.duration)}s</td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                                      {log.status === 'completed' ? 'Completed' : log.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-white">{log.outcome || '-'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ----------------- PLAYGROUND CANVAS TAB ----------------- */}
                {activeTab === "playground" && (
                  <motion.div
                    key="playground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-[700px] flex flex-col">
                      <div className="mb-4">
                         <h2 className="text-xl font-bold text-white">Live Workflow Steering</h2>
                         <p className="text-sm text-zinc-400">Map conversational logic flows via nodes. (Beta)</p>
                      </div>
                      <div className="flex-1 w-full relative border border-white/10 rounded-xl overflow-hidden">
                         <SteeringCanvas />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
