'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { logger } from './logger'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://launch-pixel-backend.onrender.com"
const WORKER_BASE = process.env.NEXT_PUBLIC_NODE_API_URL || process.env.NEXT_PUBLIC_WORKER_URL || "https://launch-pixel-backend.onrender.com"

export interface AgentActionData {
  label?: string
  description?: string
  icon?: string
  agentType?: string
  template?: string
  [key: string]: any
}

export class AgentActionHandler {
  private router: ReturnType<typeof useRouter>
  private getAuthHeaders: () => Promise<Record<string, string>>

  constructor(
    router: ReturnType<typeof useRouter>,
    getAuthHeaders: () => Promise<Record<string, string>>
  ) {
    this.router = router
    this.getAuthHeaders = getAuthHeaders
  }

  async handleAction(action: string, data: AgentActionData) {
    switch (action) {
      case 'create_agent':
        return this.handleCreateAgent(data)
      case 'test_agent':
        return this.handleTestAgent(data)
      case 'deploy_agent':
        return this.handleDeployAgent(data)
      case 'configure_agent':
        return this.handleConfigureAgent(data)
      case 'view_analytics':
        return this.handleViewAnalytics(data)
      case 'optimize_agent':
        return this.handleOptimizeAgent(data)
      case 'clone_agent':
        return this.handleCloneAgent(data)
      default:
        toast.error(`Unknown action: ${action}`)
    }
  }

  private async handleCreateAgent(data: AgentActionData) {
    try {
      const headers = await this.getAuthHeaders()

      // Create new agent configuration
      const response = await fetch(`${API_BASE}/api/agent-configurations`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.label || 'New Agent',
          agentType: data.agentType || 'outbound',
          template: data.template,
          systemPrompt: '',
          firstMessage: '',
          voiceId: 'rachel',
          language: 'en',
          canvasState: null,
          enabledTools: [],
          approvalStatus: 'draft'
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Agent created successfully!')

        // Navigate to configure tab with new agent
        this.router.push(`/call/dashboard?tab=configure&agentId=${result.id}`)
        return { success: true, agentId: result.id }
      } else {
        throw new Error('Failed to create agent')
      }
    } catch (error) {
      logger.error('Error creating agent', error instanceof Error ? error : undefined)
      toast.error('Failed to create agent')
      return { success: false }
    }
  }

  private async handleTestAgent(data: AgentActionData) {
    try {
      const headers = await this.getAuthHeaders()

      // Navigate to test tab
      this.router.push(`/call/dashboard?tab=test`)

      toast.success('Opening testing interface...')
      return { success: true }
    } catch (error) {
      logger.error('Error opening test interface', error instanceof Error ? error : undefined)
      toast.error('Failed to open test interface')
      return { success: false }
    }
  }

  private async handleDeployAgent(data: AgentActionData) {
    try {
      const headers = await this.getAuthHeaders()

      if (!data.agentId) {
        toast.error('Please select an agent first')
        return { success: false }
      }

      const stage = data.label?.toLowerCase().includes('test') ? 'test' : 'production'

      const response = await fetch(`${API_BASE}/api/agent-configurations/${data.agentId}/deploy`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
      })

      if (response.ok) {
        toast.success(`Agent deployed to ${stage}!`)
        return { success: true, stage }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Deployment failed')
      }
    } catch (error) {
      logger.error('Error deploying agent', error instanceof Error ? error : undefined)
      toast.error('Failed to deploy agent')
      return { success: false }
    }
  }

  private async handleConfigureAgent(data: AgentActionData) {
    try {
      if (data.agentId) {
        this.router.push(`/call/dashboard?tab=configure&agentId=${data.agentId}`)
      } else {
        this.router.push(`/call/dashboard?tab=configure`)
      }

      toast.success('Opening configuration panel...')
      return { success: true }
    } catch (error) {
      console.error('Error opening configuration:', error)
      toast.error('Failed to open configuration')
      return { success: false }
    }
  }

  private async handleViewAnalytics(data: AgentActionData) {
    try {
      this.router.push(`/call/dashboard?tab=conversations`)

      toast.success('Opening analytics dashboard...')
      return { success: true }
    } catch (error) {
      console.error('Error opening analytics:', error)
      toast.error('Failed to open analytics')
      return { success: false }
    }
  }

  private async handleOptimizeAgent(data: AgentActionData) {
    try {
      if (!data.agentId) {
        toast.error('Please select an agent first')
        return { success: false }
      }

      const headers = await this.getAuthHeaders()

      // Trigger AI optimization
      const response = await fetch(`${API_BASE}/api/agent-configurations/${data.agentId}/optimize`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        toast.success('Agent optimization started!')
        return { success: true }
      } else {
        throw new Error('Optimization failed')
      }
    } catch (error) {
      console.error('Error optimizing agent:', error)
      toast.error('Failed to optimize agent')
      return { success: false }
    }
  }

  private async handleCloneAgent(data: AgentActionData) {
    try {
      if (!data.agentId) {
        toast.error('Please select an agent first')
        return { success: false }
      }

      const headers = await this.getAuthHeaders()

      // Clone agent configuration
      const response = await fetch(`${API_BASE}/api/agent-configurations/${data.agentId}/clone`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Agent cloned successfully!')

        this.router.push(`/call/dashboard?tab=configure&agentId=${result.id}`)
        return { success: true, agentId: result.id }
      } else {
        throw new Error('Clone failed')
      }
    } catch (error) {
      console.error('Error cloning agent:', error)
      toast.error('Failed to clone agent')
      return { success: false }
    }
  }
}

export function useAgentActions(
  getAuthHeaders: () => Promise<Record<string, string>>
) {
  const router = useRouter()

  const handler = useMemo(
    () => new AgentActionHandler(router, getAuthHeaders),
    [router, getAuthHeaders]
  )

  return {
    handleAction: handler.handleAction.bind(handler)
  }
}
