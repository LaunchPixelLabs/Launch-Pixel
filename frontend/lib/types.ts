/**
 * Shared TypeScript Types
 * Centralized type definitions to replace `any` types
 */

// ============================================================================
// AGENT TYPES
// ============================================================================

export type AgentType = "outbound" | "inbound" | "both"

export type AgentStatus = "draft" | "testing" | "approved" | "deployed" | "archived"

export type DeploymentStage = "draft" | "test" | "production"

export interface AgentConfiguration {
  id: number
  userId: string
  agentType: AgentType
  name: string
  systemPrompt: string
  firstMessage?: string
  voiceId: string
  language: string
  canvasState?: CanvasState
  enabledTools: string[]
  transferPhoneNumber?: string
  steeringInstructions?: string
  adminWhatsAppNumber?: string
  approvalStatus: AgentStatus
  deploymentStatus: DeploymentStage
  spos?: SPOs
  kpis?: KPIs
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// CANVAS / WORKFLOW TYPES
// ============================================================================

export type NodeType = "start" | "response" | "question" | "action" | "condition" | "end"

export interface Node {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: NodeData
}

export interface NodeData {
  label: string
  content?: string
  voiceSettings?: VoiceSettings
  tools?: string[]
  conditions?: Condition[]
  nextNodeId?: string
}

export interface VoiceSettings {
  speed?: number
  pitch?: number
  emotion?: string
}

export interface Condition {
  condition: string
  nextNodeId: string
}

export interface Connection {
  id: string
  from: string
  to: string
}

export interface CanvasState {
  nodes: Node[]
  edges: Connection[]
}

// ============================================================================
// SPOs and KPIs TYPES
// ============================================================================

export interface SPOs {
  customerSatisfaction?: number
  leadConversionRate?: number
  callEfficiency?: number
  knowledgeAccuracy?: number
  responseTime?: number
}

export interface KPIs {
  totalCalls?: number
  averageDuration?: number
  successRate?: number
  escalationRate?: number
  customerFeedbackScore?: number
  firstCallResolution?: number
}

export interface MetricTrend {
  current: number
  previous: number
  trend: "up" | "down" | "stable"
  change: number
}

// ============================================================================
// APPROVAL TYPES
// ============================================================================

export interface ApprovalAction {
  action: "request" | "approve" | "reject"
  performedBy: string
  notes?: string
  timestamp: string
}

export interface ApprovalChecklist {
  configuration: boolean
  voice: boolean
  knowledge: boolean
  testing: boolean
  performance: boolean
  security: boolean
}

// ============================================================================
// TESTING TYPES
// ============================================================================

export type TestType = "voice" | "chat" | "whatsapp"

export interface TestResult {
  id: string
  timestamp: Date
  type: TestType
  score: number
  duration: number
  transcript: string
  feedback: TestFeedback
  issues: string[]
  suggestions: string[]
}

export interface TestFeedback {
  clarity: number
  relevance: number
  tone: number
  accuracy: number
}

// ============================================================================
// DEPLOYMENT TYPES
// ============================================================================

export interface DeploymentStageConfig {
  id: string
  name: string
  description: string
  status: "pending" | "in_progress" | "completed" | "failed"
  icon: any
  checks: DeploymentCheck[]
}

export interface DeploymentCheck {
  id: string
  name: string
  status: "pending" | "passed" | "failed"
  message?: string
}

export interface DeploymentHistory {
  id: string
  version: string
  stage: DeploymentStage
  status: "success" | "failed" | "rolled_back"
  timestamp: Date
  duration: number
  deployedBy: string
}

// ============================================================================
// CONTACT TYPES
// ============================================================================

export interface Contact {
  id?: number
  name: string
  phone: string
  email?: string
  company?: string
  status?: "pending" | "called" | "interested" | "completed"
  notes?: string
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ValidationError {
  row: number
  field: string
  value: string
  message: string
}

// ============================================================================
// CALL TYPES
// ============================================================================

export type CallStatus = "initiated" | "in_progress" | "completed" | "failed" | "cancelled"

export type CallOutcome = "answered" | "no_answer" | "busy" | "voicemail" | "failed"

export interface CallLog {
  id: number
  agentId: number
  contactId?: number
  contactPhone: string
  contactName?: string
  status: CallStatus
  outcome?: CallOutcome
  duration?: number
  transcript?: string
  recordingUrl?: string
  sentiment?: "positive" | "neutral" | "negative"
  leadScore?: number
  timestamp: Date
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsData {
  totalCalls: number
  totalDuration: number
  averageDuration: number
  successRate: number
  conversionRate: string
  totalPipeline: number
  callsByStatus: Record<string, number>
  callsByOutcome: Record<string, number>
  sentimentDistribution: Record<string, number>
}

// ============================================================================
// KNOWLEDGE BASE TYPES
// ============================================================================

export type KnowledgeSourceType = "url" | "file" | "text"

export interface KnowledgeSource {
  id?: number
  type: KnowledgeSourceType
  url?: string
  filename?: string
  content?: string
  status: "processing" | "completed" | "failed"
  chunks?: number
  createdAt?: Date
  updatedAt?: Date
}

export interface KnowledgeChunk {
  id: number
  sourceId: number
  content: string
  embedding?: number[]
  metadata?: Record<string, any>
}

// ============================================================================
// BILLING TYPES
// ============================================================================

export type SubscriptionTier = "starter" | "growth" | "enterprise"

export type BillingStatus = "active" | "past_due" | "cancelled" | "trialing"

export interface Billing {
  id?: number
  userId: string
  stripeCustomerId?: string
  subscriptionId?: string
  tier: SubscriptionTier
  status: BillingStatus
  minutesUsed: number
  minutesLimit: number
  agentsUsed: number
  agentsLimit: number
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
}

// ============================================================================
// WHATSAPP TYPES
// ============================================================================

export interface WhatsAppConfig {
  id?: number
  agentId: number
  phoneNumber: string
  status: "disconnected" | "connecting" | "connected" | "error"
  qrCode?: string
  lastActivity?: Date
}

export interface WhatsAppMessage {
  id: string
  from: string
  to: string
  content: string
  timestamp: Date
  direction: "inbound" | "outbound"
  status: "sent" | "delivered" | "read" | "failed"
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// UI TYPES
// ============================================================================

export type TabId =
  | "agents"
  | "configure"
  | "outbound"
  | "conversations"
  | "knowledge"
  | "whatsapp"
  | "test"
  | "deployed"
  | "billing"

export interface TabConfig {
  id: TabId
  label: string
  icon: any
  disabled?: boolean
}

export interface NotificationType {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

// ============================================================================
// GLOBAL AGENT TYPES
// ============================================================================

export interface AgentActionData {
  label?: string
  description?: string
  icon?: string
  agentType?: string
  template?: string
  agentId?: string
  [key: string]: any
}

export interface AgentMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "action" | "suggestion" | "error"
  actionData?: AgentActionData
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export type Nullable<T> = T | null

export type Maybe<T> = T | undefined | null
