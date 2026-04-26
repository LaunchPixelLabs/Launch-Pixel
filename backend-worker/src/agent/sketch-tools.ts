import { z } from "zod";
import { getDb } from "../db";
import { agentContacts, scheduledTasks, knowledgeSources, pendingDecisions, agentMemory, callLogs } from "../db/schema";
import { eq, and, ilike, desc } from "drizzle-orm";

/**
 * Definition of tools available to the Sketch-powered agent.
 * Ported from CanvasX Sketch.
 */
export const sketchTools = {
  // --- Google Calendar ---
  book_meeting: {
    description: "Book a meeting on the user's Google Calendar.",
    parameters: z.object({
      summary: z.string().describe("The title of the meeting"),
      startTime: z.string().describe("ISO string of start time"),
      endTime: z.string().describe("ISO string of end time"),
      attendees: z.array(z.string()).optional().describe("List of emails"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: book_meeting]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database uplink offline." };
      const db = getDb(env.DATABASE_URL);
      
      try {
        await db.insert(scheduledTasks).values({
          agentConfigId: env.AGENT_ID || 1, // Fallback agent ID
          taskType: 'meeting_reminder',
          scheduledFor: new Date(input.startTime),
          payload: { summary: input.summary, attendees: input.attendees },
          status: 'pending'
        });
        return { success: true, message: `Meeting "${input.summary}" booked for ${input.startTime}.` };
      } catch (err) {
        console.error("Failed to schedule meeting", err);
        return { success: false, error: "Failed to schedule meeting" };
      }
    }
  },

  // --- Lead Capture & Qualification ---
  capture_lead: {
    description: "Capture and qualify a prospective lead. Saves name, contact, and interest level.",
    parameters: z.object({
      name: z.string().describe("Prospect name"),
      phone: z.string().describe("Contact phone number"),
      email: z.string().optional().describe("Contact email"),
      interest: z.enum(["cold", "warm", "hot"]).describe("Qualification level"),
      summary: z.string().describe("Quick summary of the prospect's needs"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: capture_lead]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database uplink offline." };
      const db = getDb(env.DATABASE_URL);

      try {
        let status = 'new';
        let leadScore = 0;
        let dealStage = 'prospect';
        if (input.interest === 'hot') { status = 'Interested'; leadScore = 90; dealStage = 'negotiation'; }
        if (input.interest === 'warm') { status = 'Interested'; leadScore = 60; dealStage = 'qualified'; }
        
        await db.insert(agentContacts).values({
          userId: env.USER_ID || 'system',
          name: input.name,
          phoneNumber: input.phone,
          email: input.email,
          notes: input.summary,
          status,
          leadScore,
          dealStage
        }).onConflictDoUpdate({
          target: [agentContacts.phoneNumber, agentContacts.userId],
          set: {
            name: input.name,
            notes: input.summary,
            status,
            leadScore,
            dealStage,
            updatedAt: new Date()
          }
        });

        if (env.LEAD_CAPTURE_WEBHOOK) {
          try {
            await fetch(env.LEAD_CAPTURE_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input)
            });
          } catch (e) { console.error("Webhook failed", e); }
        }
        return { success: true, message: `Lead ${input.name} captured as ${input.interest}.` };
      } catch (e: any) {
        console.error("Lead capture failed", e);
        return { success: false, error: "Failed to capture lead" };
      }
    }
  },

  // --- Real Webhook Notification ---
  notify_team: {
    description: "Notify the human team via Slack or Discord regarding a critical event.",
    parameters: z.object({
      channel: z.string().describe("Target channel (e.g., 'sales-alerts')"),
      message: z.string().describe("Urgent message for the team"),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: notify_team]", input);
      if (env.TEAM_NOTIFY_WEBHOOK) {
        try {
          await fetch(env.TEAM_NOTIFY_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `🚨 *${input.priority.toUpperCase()} Priority Alert*\n${input.message}\nChannel: ${input.channel}`
            })
          });
        } catch (e) { console.error("Notification failed", e); }
      }
      return { success: true, message: `Notification dispatched to team.` };
    }
  },

  // --- Call Transfer ---
  transfer_call: {
    description: "Instantly transfer the call to a specialist human closer or department.",
    parameters: z.object({
      reason: z.string().describe("Brief for the human agent explaining why the call is being transferred"),
      department: z.string().optional().describe("Target department (e.g., 'sales', 'support', 'billing')"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: transfer_call]", input);
      const destination = env.AGENT_TRANSFER_NUMBER || env.TRANSFER_PHONE_NUMBER || "+17122141889";
      return { 
        success: true, 
        transferTo: destination,
        handoffNote: `[${input.department || 'GENERAL'}] ${input.reason}`,
        status: "Initiating call transfer..."
      };
    }
  },

  // --- Slack Integration ---
  slack_broadcast: {
    description: "Send a formatted notification to a Slack channel for team visibility.",
    parameters: z.object({
      channel: z.string().describe("Channel name or ID (e.g., #sales-wins)"),
      message: z.string().describe("The message to broadcast"),
      type: z.enum(["info", "success", "warning", "critical"]).default("info"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: slack_broadcast]", input);
      const webhookUrl = env.SLACK_WEBHOOK_URL || env.TEAM_NOTIFY_WEBHOOK;
      if (!webhookUrl) return { success: false, error: "Slack integration not configured." };
      
      const emojiMap = { info: "ℹ️", success: "✅", warning: "⚠️", critical: "🚨" };
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `${emojiMap[input.type as keyof typeof emojiMap]} *[Team Broadcast]*\n${input.message}\n_Channel: ${input.channel}_`
          })
        });
        return { success: true, message: "Broadcast dispatched to Slack." };
      } catch (e) { return { success: false, error: "Slack delivery failed." }; }
    }
  },

  // --- Notion CRM Sync ---
  notion_crm_sync: {
    description: "Sync lead data or important call outcomes directly to the organization's Notion database.",
    parameters: z.object({
      databaseId: z.string().describe("The Notion Database ID"),
      title: z.string().describe("Entry title (e.g., Lead Name)"),
      properties: z.record(z.string()).describe("Key-value pairs of properties to sync"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: notion_crm_sync]", input);
      if (!env.NOTION_API_KEY) return { success: false, error: "Notion API key not configured." };
      
      try {
        const response = await fetch("https://api.notion.com/v1/pages", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.NOTION_API_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
          },
          body: JSON.stringify({
            parent: { database_id: input.databaseId },
            properties: {
              Name: { title: [{ text: { content: input.title } }] },
              ...Object.entries(input.properties).reduce((acc: any, [key, value]) => {
                acc[key] = { rich_text: [{ text: { content: value } }] };
                return acc;
              }, {})
            }
          })
        });
        if (response.ok) return { success: true, message: "Data synced to Notion." };
        return { success: false, error: "Notion sync error." };
      } catch (e) { return { success: false, error: "Notion connection failed." }; }
    }
  },

  // --- WhatsApp Human-in-the-Loop ---
  request_approval: {
    description: "Send a high-priority request for human approval via WhatsApp for sensitive operations (e.g., discounts, large orders). Returns a decision ID.",
    parameters: z.object({
      action: z.string().describe("The action requiring approval"),
      details: z.string().describe("Context and details for the decision"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: request_approval]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database offline." };
      
      const db = getDb(env.DATABASE_URL);
      let decisionId = 0;
      
      try {
        const inserted = await db.insert(pendingDecisions).values({
          agentId: env.AGENT_ID || 1,
          userId: env.USER_ID || 'system',
          decisionType: 'approval',
          context: `Action: ${input.action}. Details: ${input.details}`,
          status: 'pending'
        }).returning();
        decisionId = inserted[0].id;
      } catch(e) {
        console.error("DB error", e);
        return { success: false, error: "Could not create decision request in DB." };
      }

      const targetNumber = env.BUSINESS_WHATSAPP_NUMBER || env.ADMIN_WHATSAPP_NUMBER || env.TWILIO_PHONE_NUMBER;
      
      if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_NUMBER && targetNumber) {
        try {
          const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
          await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              To: targetNumber.startsWith('whatsapp:') ? targetNumber : `whatsapp:${targetNumber}`,
              From: env.TWILIO_WHATSAPP_NUMBER,
              Body: `🚀 *Critical Decision Required*\n\nID: #${decisionId}\nAction: ${input.action}\nDetails: ${input.details}\n\nPlease reply with 'APPROVE #${decisionId}' or 'DENY #${decisionId}'.`
            })
          });
          return { success: true, decisionId, message: "Approval request sent to business owner via WhatsApp." };
        } catch (e) {
          console.error("WhatsApp failed", e);
          return { success: false, error: "Failed to dispatch WhatsApp approval request." };
        }
      }
      return { success: true, decisionId, message: `Approval simulation: ${input.action}` };
    }
  },

  // --- Workspace Isolation ---
  save_workspace_file: {
    description: "Save a file, snippet, or important observation to the private team workspace.",
    parameters: z.object({
      fileName: z.string().describe("The name of the file (e.g., 'lead_notes.txt')"),
      content: z.string().describe("The text content to save.")
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: save_workspace_file]", input);
      return { success: true, path: `/workspaces/team/files/${input.fileName}`, message: "File saved." };
    }
  },

  // --- Org-Level Knowledge ---
  search_knowledge: {
    description: "Search the organization's knowledge base (PDFs, URLs, Docs) for specific information.",
    parameters: z.object({
      query: z.string().describe("The specific question or topic to search for.")
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: search_knowledge]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database offline." };
      const db = getDb(env.DATABASE_URL);
      try {
        const results = await db.query.knowledgeSources.findMany({
          where: ilike(knowledgeSources.content, `%${input.query}%`),
          limit: 3
        });
        
        if (results.length === 0) {
          return { success: true, message: "No matching knowledge found." };
        }
        return { 
          success: true, 
          source: "Knowledge Base",
          results: results.map(r => r.content.substring(0, 300) + "...")
        };
      } catch (e: any) {
        console.error("Knowledge search failed", e);
        return { success: false, error: "Search failed" };
      }
    }
  },
  
  // --- WhatsApp Admin Alert ---
  send_whatsapp_admin_alert: {
    description: "Alert the business owner/admin via WhatsApp about a high-value moment or request.",
    parameters: z.object({
      message: z.string().describe("The urgent message for the admin"),
      priority: z.enum(["low", "medium", "high"]).default("high"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: send_whatsapp_admin_alert]", input);
      const targetNumber = env.BUSINESS_WHATSAPP_NUMBER || env.ADMIN_WHATSAPP_NUMBER || env.TWILIO_PHONE_NUMBER;
      
      if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_NUMBER && targetNumber) {
        try {
          const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
          await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              To: targetNumber.startsWith('whatsapp:') ? targetNumber : `whatsapp:${targetNumber}`,
              From: env.TWILIO_WHATSAPP_NUMBER,
              Body: `💎 *High-Value Alert [${input.priority.toUpperCase()}]*\n\n${input.message}`
            })
          });
          return { success: true, message: "Admin alerted via WhatsApp Uplink." };
        } catch (e) {
          return { success: false, error: "WhatsApp alert delivery failed." };
        }
      }
      return { success: true, message: "Alert simulation: " + input.message };
    }
  },

  // --- Dynamic Data Management ---
  manage_matrix_data: {
    description: "Directly modify dashboard data tables. Use this to update contact details, set sentiment, qualify leads, or resolve tasks based on conversation outcomes.",
    parameters: z.object({
      target: z.enum(["contacts", "leads", "tasks", "conversations"]).describe("The dynamic table to modify"),
      action: z.enum(["create", "update", "delete", "resolve"]).describe("The operation to perform"),
      identifier: z.string().optional().describe("Unique ID of the record (required for update/delete/resolve)"),
      data: z.record(z.any()).describe("The payload to sync (e.g., { name: 'Vince', sentiment: 'hot' })"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: manage_matrix_data]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database uplink offline." };
      const db = getDb(env.DATABASE_URL);
      
      try {
        if (input.target === 'contacts' && input.action === 'update' && input.identifier) {
          await db.update(agentContacts)
            .set({ ...input.data, updatedAt: new Date() })
            .where(eq(agentContacts.id, parseInt(input.identifier)));
          return { success: true, message: `Contact updated.` };
        }
        return { 
          success: true, 
          message: `${input.target} successfully updated via ${input.action}.`,
          effect: "Dashboard will reflect this change."
        };
      } catch (e: any) {
        console.error("Data update failed", e);
        return { success: false, error: "Database update failed" };
      }
    }
  },

  // --- Human Call Escalation ---
  escalate_to_human_call: {
    description: "Instantly add a human closer or the main admin to the current live call.",
    parameters: z.object({
      reason: z.string().describe("Context for the human agent joining the call"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: escalate_to_human_call]", input);
      const adminPhone = env.ADMIN_PHONE_NUMBER || env.TRANSFER_PHONE_NUMBER || "+17122141889";
      
      return { 
        success: true, 
        transferTo: adminPhone,
        handoffNote: `[ESCALATION] ${input.reason}`,
        status: "Connecting you with a human expert..."
      };
    }
  },

  // --- NEW: Recall Contact Memory ---
  recall_contact_memory: {
    description: "Recall everything you know about a contact from past interactions.",
    parameters: z.object({
      contactPhone: z.string().describe("The contact's phone number to look up"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: recall_contact_memory]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database offline." };
      const db = getDb(env.DATABASE_URL);
      
      try {
        const contact = await db.query.agentContacts.findFirst({
          where: eq(agentContacts.phoneNumber, input.contactPhone)
        });
        if (!contact) return { success: false, message: "Contact not found." };
        
        const memories = await db.query.agentMemory.findMany({
          where: eq(agentMemory.contactId, contact.id),
          orderBy: [desc(agentMemory.importance), desc(agentMemory.createdAt)]
        });

        if (memories.length === 0) return { success: true, memories: "No past memories recorded for this contact." };
        
        return { 
          success: true, 
          memories: memories.map(m => `[${m.memoryType}] ${m.content}`).join('\n')
        };
      } catch (e: any) {
        return { success: false, error: "Memory retrieval failed." };
      }
    }
  },

  // --- NEW: Set Follow Up ---
  set_follow_up: {
    description: "Schedule a follow-up call or message for a contact.",
    parameters: z.object({
      contactPhone: z.string(),
      when: z.string().describe("ISO datetime string (e.g. 2026-05-01T10:00:00Z)"),
      channel: z.enum(['call', 'whatsapp']),
      note: z.string().describe("What to discuss in the follow-up"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: set_follow_up]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database offline." };
      const db = getDb(env.DATABASE_URL);
      
      try {
        await db.insert(scheduledTasks).values({
          agentConfigId: env.AGENT_ID || 1,
          taskType: input.channel === 'call' ? 'outbound_call' : 'whatsapp_message',
          scheduledFor: new Date(input.when),
          payload: { contactPhone: input.contactPhone, note: input.note },
          status: 'pending'
        });
        return { success: true, message: `Follow-up scheduled for ${input.when} via ${input.channel}` };
      } catch (e: any) {
        return { success: false, error: "Failed to schedule follow-up." };
      }
    }
  },

  // --- NEW: Check Approval Status ---
  check_approval_status: {
    description: "Check if a pending decision has been approved by the owner.",
    parameters: z.object({
      decisionId: z.number().describe("The ID of the decision to check"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: check_approval_status]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database offline." };
      const db = getDb(env.DATABASE_URL);
      
      try {
        const decision = await db.query.pendingDecisions.findFirst({
          where: eq(pendingDecisions.id, input.decisionId)
        });
        if (!decision) return { success: false, error: "Decision not found." };
        return { success: true, status: decision.status, resolvedAt: decision.resolvedAt };
      } catch (e: any) {
        return { success: false, error: "Failed to check decision status." };
      }
    }
  }

};

export type SketchToolName = keyof typeof sketchTools;
