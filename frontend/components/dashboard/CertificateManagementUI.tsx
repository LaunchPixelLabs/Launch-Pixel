"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Award, 
  QrCode, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users,
  FileText,
  ExternalLink,
  Copy,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"

const API_BASE = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787"

interface Certificate {
  id: number
  verificationId: string
  candidateName: string
  candidateEmail?: string
  candidatePhone?: string
  certificateType: string
  programName: string
  programDuration?: string
  issueDate: string
  expiryDate?: string
  grade?: string
  skillsAcquired?: string
  projectsCompleted?: string
  performanceNotes?: string
  issuedBy: string
  issuerTitle?: string
  status: 'active' | 'revoked' | 'expired'
  verificationCount: number
  lastVerifiedAt?: string
  qrCodeUrl: string
  publicVerificationUrl: string
  createdAt: string
}

export default function CertificateManagementUI() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    expired: 0,
    totalVerifications: 0
  })

  // Fetch certificates
  const fetchCertificates = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/certificates/list`, {
        headers: {
          'x-user-id': 'current-user-id', // TODO: Get from auth context
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates || [])
        setFilteredCertificates(data.certificates || [])
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
      toast.error('Failed to load certificates')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/certificates/stats/overview`, {
        headers: {
          'x-user-id': 'current-user-id',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchCertificates()
    fetchStats()
  }, [])

  // Filter certificates
  useEffect(() => {
    let filtered = certificates

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(cert =>
        cert.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.verificationId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(cert => cert.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(cert => cert.certificateType === typeFilter)
    }

    setFilteredCertificates(filtered)
  }, [searchQuery, statusFilter, typeFilter, certificates])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleRevoke = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this certificate?')) return

    try {
      const response = await fetch(`${API_BASE}/api/certificates/${id}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user-id',
        },
        body: JSON.stringify({
          reason: 'Revoked by administrator'
        })
      })

      if (response.ok) {
        toast.success('Certificate revoked successfully')
        fetchCertificates()
        fetchStats()
      } else {
        toast.error('Failed to revoke certificate')
      }
    } catch (error) {
      console.error('Revoke error:', error)
      toast.error('An error occurred')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award className="w-7 h-7 text-[var(--lp-accent)]" />
            Certificate Management
          </h2>
          <p className="text-gray-400 mt-1">Issue, verify, and manage certificates with QR codes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            Bulk Create
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[var(--lp-accent)] hover:bg-[var(--lp-accent-deep)] text-white rounded-xl flex items-center gap-2 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Certificate
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total</span>
            <Award className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Active</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Revoked</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.revoked}</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Expired</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.expired}</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Verifications</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.totalVerifications}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, program, or verification ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--lp-accent)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--lp-accent)]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--lp-accent)]"
        >
          <option value="all">All Types</option>
          <option value="internship">Internship</option>
          <option value="course">Course</option>
          <option value="achievement">Achievement</option>
          <option value="participation">Participation</option>
        </select>
      </div>

      {/* Certificates List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[var(--lp-accent)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading certificates...</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/30 border border-white/5 rounded-xl">
            <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No certificates found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-[var(--lp-accent)] hover:bg-[var(--lp-accent-deep)] text-white rounded-xl inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Your First Certificate
            </button>
          </div>
        ) : (
          filteredCertificates.map((cert) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{cert.candidateName}</h3>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      cert.status === 'active' ? 'bg-green-500/10 text-green-400' :
                      cert.status === 'revoked' ? 'bg-red-500/10 text-red-400' :
                      'bg-orange-500/10 text-orange-400'
                    }`}>
                      {cert.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400">
                      {cert.certificateType}
                    </span>
                  </div>
                  <p className="text-gray-400 mb-3">{cert.programName}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                    {cert.grade && <span>Grade: {cert.grade}</span>}
                    <span>Verified: {cert.verificationCount} times</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(cert.qrCodeUrl, '_blank')}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
                    title="View QR Code"
                  >
                    <QrCode className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(cert.publicVerificationUrl)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
                    title="Copy Verification URL"
                  >
                    <Copy className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => window.open(cert.publicVerificationUrl, '_blank')}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
                    title="View Certificate"
                  >
                    <ExternalLink className="w-5 h-5 text-white" />
                  </button>
                  {cert.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(cert.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Revoke Certificate"
                    >
                      <XCircle className="w-5 h-5 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Certificate</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-all"
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-[var(--lp-accent)] mx-auto mb-4" />
              <p className="text-gray-400">Certificate creation form coming soon!</p>
              <p className="text-sm text-gray-500 mt-2">Use the API endpoint for now</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
