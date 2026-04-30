import { Hono } from "hono"
import { z } from "zod"
import { db } from "../db"
import { agentConfigurations } from "../db/schema"
import { eq } from "drizzle-orm"

const approvalRouter = new Hono()

// Validation schemas
const approvalRequestSchema = z.object({
  agentId: z.number(),
  requestedBy: z.string(),
  notes: z.string().optional()
})

const approvalActionSchema = z.object({
  agentId: z.number(),
  action: z.enum(["approve", "reject"]),
  approvedBy: z.string(),
  notes: z.string().optional()
})

const approvalHistorySchema = z.object({
  agentId: z.number(),
  action: z.enum(["request", "approve", "reject"]),
  performedBy: z.string(),
  notes: z.string().optional(),
  timestamp: z.string()
})

// Request approval for an agent
approvalRouter.post("/request", async (c) => {
  try {
    const body = await c.req.json()
    const validated = approvalRequestSchema.parse(body)

    // Check if agent exists
    const agent = await db.query.agentConfigurations.findFirst({
      where: (agent, { eq }) => eq(agent.id, validated.agentId)
    })

    if (!agent) {
      return c.json({ success: false, error: "Agent not found" }, 404)
    }

    // Update agent approval status
    await db.update(agentConfigurations)
      .set({
        approvalStatus: "testing",
        approvalHistory: [
          ...(agent.approvalHistory || []),
          {
            action: "request",
            performedBy: validated.requestedBy,
            notes: validated.notes,
            timestamp: new Date().toISOString()
          }
        ]
      })
      .where((agent) => eq(agent.id, validated.agentId))

    return c.json({
      success: true,
      message: "Approval request submitted successfully"
    })
  } catch (error) {
    console.error("Error requesting approval:", error)
    return c.json({ success: false, error: "Failed to request approval" }, 500)
  }
})

// Approve or reject an agent
approvalRouter.post("/action", async (c) => {
  try {
    const body = await c.req.json()
    const validated = approvalActionSchema.parse(body)

    // Check if agent exists
    const agent = await db.query.agentConfigurations.findFirst({
      where: (agent, { eq }) => eq(agent.id, validated.agentId)
    })

    if (!agent) {
      return c.json({ success: false, error: "Agent not found" }, 404)
    }

    // Update agent approval status
    const newStatus = validated.action === "approve" ? "approved" : "rejected"

    await db.update(agentConfigurations)
      .set({
        approvalStatus: newStatus,
        approvalHistory: [
          ...(agent.approvalHistory || []),
          {
            action: validated.action,
            performedBy: validated.approvedBy,
            notes: validated.notes,
            timestamp: new Date().toISOString()
          }
        ]
      })
      .where((agent) => eq(agent.id, validated.agentId))

    return c.json({
      success: true,
      message: `Agent ${validated.action}d successfully`,
      status: newStatus
    })
  } catch (error) {
    console.error("Error processing approval action:", error)
    return c.json({ success: false, error: "Failed to process approval action" }, 500)
  }
})

// Get approval history for an agent
approvalRouter.get("/history/:agentId", async (c) => {
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
      history: agent.approvalHistory || [],
      currentStatus: agent.approvalStatus
    })
  } catch (error) {
    console.error("Error fetching approval history:", error)
    return c.json({ success: false, error: "Failed to fetch approval history" }, 500)
  }
})

// Get all pending approvals
approvalRouter.get("/pending", async (c) => {
  try {
    const pendingAgents = await db.query.agentConfigurations.findMany({
      where: (agent, { eq }) => eq(agent.approvalStatus, "testing")
    })

    return c.json({
      success: true,
      agents: pendingAgents
    })
  } catch (error) {
    console.error("Error fetching pending approvals:", error)
    return c.json({ success: false, error: "Failed to fetch pending approvals" }, 500)
  }
})

export default approvalRouter
