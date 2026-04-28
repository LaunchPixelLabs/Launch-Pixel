'use client'
import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "../lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { parseAndValidateCSV, Contact, ValidationError } from "../lib/csvParser"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://launch-pixel-backend.onrender.com"
const WORKER_BASE = process.env.NEXT_PUBLIC_NODE_API_URL || process.env.NEXT_PUBLIC_WORKER_URL || "https://launch-pixel-backend.onrender.com"

export function useDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  
  // Tab State
  const [activeTab, setActiveTab] = useState<string>("agents")
  
  // Agent State
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState("My Calling Agent")
  const [agentLanguage, setAgentLanguage] = useState("en")
  const [agentType, setAgentType] = useState<"outbound" | "inbound">("outbound")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [firstMessage, setFirstMessage] = useState("")
  const [voiceId, setVoiceId] = useState("rachel")
  const [steeringInstructions, setSteeringInstructions] = useState("")
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState("")
  const [interruptible, setInterruptible] = useState(true)
  const [promptInjectionProtection, setPromptInjectionProtection] = useState(true)
  const [hallucinationGuard, setHallucinationGuard] = useState(false)
  const [canvasState, setCanvasState] = useState<{ nodes: any[]; edges: any[] } | null>(null)
  const [enabledTools, setEnabledTools] = useState<string[]>([])
  const [transferPhoneNumber, setTransferPhoneNumber] = useState("")

  // Operational Data
  const [contacts, setContacts] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [callLogs, setCallLogs] = useState<any[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  
  // Outbound/CSV States
  const [manualPhone, setManualPhone] = useState("")
  const [manualName, setManualName] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvValidationErrors, setCsvValidationErrors] = useState<ValidationError[]>([])
  const [csvValidContacts, setCsvValidContacts] = useState<Contact[]>([])
  const [showValidationReport, setShowValidationReport] = useState(false)
  const [csvSummary, setCsvSummary] = useState<any>(null)

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!auth.currentUser) return {}
    try {
      const token = await auth.currentUser.getIdToken()
      return { Authorization: `Bearer ${token}` }
    } catch {
      return {}
    }
  }, [])

  const fetchContacts = useCallback(async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/contacts?userId=${auth.currentUser?.uid || ''}`, { headers })
      if (res.ok) {
        const json = await res.json()
        setContacts(json.contacts || [])
      }
    } catch (e) { console.error(e) }
  }, [getAuthHeaders])

  const fetchAnalytics = useCallback(async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/analytics`, { headers })
      if (res.ok) {
        const json = await res.json()
        if (json.success) setAnalyticsData(json.data)
      }
    } catch (e) { console.error(e) }
  }, [getAuthHeaders])

  const fetchCallLogs = useCallback(async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/call-logs?userId=${auth.currentUser?.uid || ''}`, { headers })
      if (res.ok) {
        const json = await res.json()
        setCallLogs(json.logs || json.data || [])
      }
    } catch (e) { console.error(e) }
  }, [getAuthHeaders])

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
          setSteeringInstructions(config.steeringInstructions || "")
          setAdminWhatsAppNumber(config.adminWhatsAppNumber || "")
        }
      }
    } catch (e) {
      toast.error('Failed to load agent configuration')
    }
    setActiveTab("configure")
  }

  const refreshAgentConfig = useCallback(async () => {
    if (!selectedAgentId) return;
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${API_BASE}/api/agent-configurations/${selectedAgentId}`, { headers })
      if (res.ok) {
        const data = await res.json()
        const config = data.configuration
        if (config) {
          // Only update the live data (canvas, tools) to prevent overwriting user typing in the inputs
          setCanvasState(config.canvasState || null)
          setEnabledTools(config.enabledTools || [])
        }
      }
    } catch (e) {}
  }, [selectedAgentId, getAuthHeaders])

  const handleSaveConfig = async (canvasData?: any, overrides?: any) => {
    setIsLoading(true)
    try {
      const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" }
      const finalVoiceId = overrides?.voiceId !== undefined ? overrides.voiceId : voiceId
      
      const configRes = await fetch(`${API_BASE}/api/agent-configurations`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: selectedAgentId ? Number(selectedAgentId) : undefined,
          userId: auth.currentUser?.uid,
          agentType,
          name: agentName,
          systemPrompt,
          voiceId: finalVoiceId,
          firstMessage,
          language: agentLanguage,
          canvasState: canvasData ? { nodes: canvasData.nodes, edges: canvasData.edges } : canvasState,
          enabledTools: canvasData?.enabledTools || enabledTools,
          transferPhoneNumber,
          steeringInstructions,
          adminWhatsAppNumber,
        }),
      })

      if (configRes.ok) {
        toast.success("Agent configuration saved!")
      } else {
        toast.error("Save failed")
      }
    } catch (e) {
      toast.error("Error saving agent configuration.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeploy = async (stage: 'test' | 'production' = 'production') => {
    if (!selectedAgentId) return toast.error("Select an agent first")
    setIsLoading(true)
    try {
      const headers = { ...(await getAuthHeaders()), "Content-Type": "application/json" }
      const res = await fetch(`${API_BASE}/api/agent-configurations/${selectedAgentId}/deploy`, {
        method: "POST",
        headers,
        body: JSON.stringify({ stage })
      })
      if (res.ok) {
        toast.success(`Agent successfully deployed to ${stage}!`)
        loadAgentConfig(selectedAgentId)
      } else {
        const data = await res.json()
        toast.error(`Deployment failed: ${data.error || "Unknown error"}`)
      }
    } catch (e) {
      toast.error("Error during deployment.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/call")
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setIsAuthLoading(false)
      if (!user) router.push("/call/auth")
    })
    return unsubscribe
  }, [router])

  useEffect(() => {
    if (currentUser) {
      // Initial fetch
      fetchContacts()
      fetchAnalytics()
      fetchCallLogs()
      
      // Live automatic refresh every 30 seconds (was 5s — too aggressive)
      const interval = setInterval(() => {
        fetchContacts()
        fetchAnalytics()
        fetchCallLogs()
        refreshAgentConfig()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [currentUser, fetchContacts, fetchAnalytics, fetchCallLogs, refreshAgentConfig])

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setCsvFile(file)
    setIsLoading(true)
    try {
      const result = await parseAndValidateCSV(file, "1")
      setCsvValidContacts(result.valid)
      setCsvValidationErrors(result.invalid)
      setCsvSummary(result.summary)
      setShowValidationReport(true)
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
      const res = await fetch(`${API_BASE}/api/agent-contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ contacts: validContacts }),
      })
      if (res.ok) {
        toast.success(`Successfully imported ${validContacts.length} contacts!`)
        fetchContacts()
        setShowValidationReport(false)
      }
    } catch (e) { toast.error("Import failed") }
  }

  const handleQuickCall = async (phone: string, name?: string) => {
    if (!phone) return
    setIsLoading(true)
    try {
      const res = await fetch(`${WORKER_BASE}/api/call/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          toPhone: phone, 
          contactName: name,
          agentId: selectedAgentId
        }),
      })
      if (res.ok) {
        toast.success("Call initiated")
        fetchContacts()
      } else {
        toast.error("Call failed")
      }
    } catch (e) { toast.error("Error initiating call") }
    finally { setIsLoading(false) }
  }

  const handleBatchCall = async () => {
    const callable = contacts.filter(c => !['Called', 'Interested', 'Completed'].includes(c.status))
    if (callable.length === 0) return toast.info("No pending contacts")
    if (!confirm(`Call ${callable.length} contacts?`)) return
    setIsLoading(true)
    try {
      for (const contact of callable) {
        await fetch(`${WORKER_BASE}/api/call/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            toPhone: contact.phone, 
            contactName: contact.name,
            agentId: selectedAgentId
          }),
        })
        await new Promise(r => setTimeout(r, 10000))
      }
      toast.success("Batch complete")
      fetchContacts()
    } finally { setIsLoading(false) }
  }

  const handleManualCall = async () => {
    if (!manualPhone) return
    let phone = manualPhone.trim()
    if (!phone.startsWith("+")) phone = "+91" + phone.replace(/^0/, "")
    await handleQuickCall(phone, manualName || undefined)
    setManualPhone("")
    setManualName("")
  }

  const handleExportCSV = () => {
    if (callLogs.length === 0) return
    const headers = ["Date", "Phone", "Name", "Duration", "Status", "Outcome"]
    const rows = callLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.contactPhone,
      log.AgentContact?.name || '',
      log.duration,
      log.status,
      log.outcome || "-"
    ])
    let csv = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "call_logs.csv"
    a.click()
  }

  return {
    currentUser, isAuthLoading, isLoading, activeTab, setActiveTab,
    selectedAgentId, agentName, setAgentName, systemPrompt, setSystemPrompt,
    firstMessage, setFirstMessage, voiceId, setVoiceId, agentLanguage, setAgentLanguage,
    agentType, setAgentType, canvasState, setCanvasState, enabledTools, setEnabledTools,
    transferPhoneNumber, setTransferPhoneNumber, steeringInstructions, setSteeringInstructions,
    adminWhatsAppNumber, setAdminWhatsAppNumber, interruptible, setInterruptible,
    promptInjectionProtection, setPromptInjectionProtection, hallucinationGuard, setHallucinationGuard,
    contacts, analyticsData, callLogs, uploadedDocuments,
    manualPhone, setManualPhone, manualName, setManualName,
    csvFile, setCsvFile, csvValidationErrors, setCsvValidationErrors,
    csvValidContacts, setCsvValidContacts, showValidationReport, setShowValidationReport,
    csvSummary, setCsvSummary,
    loadAgentConfig, handleSaveConfig, handleDeploy, handleSignOut, getAuthHeaders,
    fetchContacts, fetchAnalytics, fetchCallLogs,
    handleCSVUpload, handleQuickCall, handleBatchCall, handleManualCall, handleExportCSV,
    handleCloseValidationReport: () => setShowValidationReport(false)
  }
}
