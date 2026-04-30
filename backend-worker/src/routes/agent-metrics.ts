import { Hono } from "hono"
import { z } from "zod"
import { db } from "../db"
import { agentConfigurations } from "../db/schema"
import { eq } from "drizzle-orm"

const metricsRouter = new Hono()

// Validation schemas
const metricsUpdateSchema = z.object({
  agentId: z.number(),
  metrics: z.object({
    customerSatisfaction: z.number().optional(),
    leadConversionRate: z.number().optional(),
    callEfficiency: z.number().optional(),
    knowledgeAccuracy: z.number().optional(),
    responseTime: z.number().optional(),
    totalCalls: z.number().optional(),
    averageDuration: z.number().optional(),
    successRate: z.number().optional(),
    escalationRate: z.number().optional(),
    customerFeedbackScore: z.number().optional(),
    firstCallResolution: z.number().optional()
  })
})

// Get agent metrics
metricsRouter.get("/:agentId", async (c) => {
  try {
    const agentId = parseInt(c.req.param("agentId"))

    const agent = await db.query.agentConfigurations.findFirst({
      where: (agent, { eq }) => eq(agent.id, agentId)
    })

    if (!agent) {
      return c.json({ success: false, error: "Agent not found" }, 404)
    }

    return c.json({
      success: true,
      spos: agent.spos || {},
      kpis: agent.kpis || {}
    })
  } catch (error) {
    console.error("Error fetching agent metrics:", error)
    return c.json({ success: false, error: "Failed to fetch agent metrics" }, 500)
  }
})

// Update agent metrics
metricsRouter.post("/:agentId", async (c) => {
  try {
    const agentId = parseInt(c.req.param("agentId"))
    const body = await c.req.json()
    const validated = metricsUpdateSchema.parse(body)

    // Check if agent exists
    const agent = await db.query.agentConfigurations.findFirst({
      where: (agent, { eq }) => eq(agent.id, agentId)
    })

    if (!agent) {
      return c.json({ success: false, error: "Agent not found" }, 404)
    }

    // Update agent metrics
    await db.update(agentConfigurations)
      .set({
        spos: {
          ...(agent.spos || {}),
          ...validated.metrics
        },
        kpis: {
          ...(agent.kpis || {}),
          ...validated.metrics
        }
      })
      .where((agent) => eq(agent.id, agentId))

    return c.json({
      success: true,
      message: "Agent metrics updated successfully"
    })
  } catch (error) {
    console.error("Error updating agent metrics:", error)
    return c.json({ success: false, error: "Failed to update agent metrics" }, 500)
  }
})

// Get metric trends
metricsRouter.get("/:agentId/trends", async (c) => {
  try {
    const agentId = parseInt(c.req.param("agentId"))
    const timeRange = c.req.query("range") || "30d"

    // Simulate trend data (in production, this would query historical data)
    const trends = {
      customerSatisfaction: {
        current: 4.3,
        previous: 4.1,
        trend: "up",
        change: 4.9
      },
      leadConversionRate: {
        current: 22,
        previous: 19,
        trend: "up",
        change: 15.8
      },
      callEfficiency: {
        current: 165,
        previous: 180,
        trend: "up",
        change: -8.3
      },
      knowledgeAccuracy: {
        current: 92,
        previous: 89,
        trend: "up",
        change: 3.4
      },
      responseTime: {
        current: 28,
        previous: 32,
        trend: "down",
        change: -12.5
      }
    }

    return c.json({
      success: true,
      trends,
      timeRange
    })
  } catch (error) {
    console.error("Error fetching metric trends:", error)
    return c.json({ success: false, error: "Failed to fetch metric trends" }, 500)
  }
})

// Get all agents metrics summary
metricsRouter.get("/summary/all", async (c) => {
  try {
    const agents = await db.query.agentConfigurations.findMany()

    const summary = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      spos: agent.spos || {},
      kpis: agent.kpis || {},
      approvalStatus: agent.approvalStatus
    }))

    return c.json({
      success: true,
      summary
    })
  } catch (error) {
    console.error("Error fetching metrics summary:", error)
    return c.json({ success: false, error: "Failed to fetch metrics summary" }, 500)
  }
})

export default metricsRouter
