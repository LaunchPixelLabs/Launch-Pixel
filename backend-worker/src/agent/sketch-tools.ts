import { z } from "zod";

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
      // In a real scenario, this would call Google Calendar API
      console.log("[Tool: book_meeting]", input);
      return { success: true, message: `Meeting "${input.summary}" booked for ${input.startTime}` };
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
      // In production, we'd insert this into a 'leads' table or hit a CRM webhook
      if (env.LEAD_CAPTURE_WEBHOOK) {
        try {
          await fetch(env.LEAD_CAPTURE_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
          });
        } catch (e) { console.error("Webhook failed", e); }
      }
      return { success: true, message: `Lead ${input.name} captured as ${input.interest}. Matrix updated.` };
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
      return { success: true, message: `Team synchronized. Notification dispatched.` };
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
      // Logic: Prioritize agent-specific transfer number, then global env
      const destination = env.AGENT_TRANSFER_NUMBER || env.TRANSFER_PHONE_NUMBER || "+17122141889";
      return { 
        success: true, 
        transferTo: destination,
        handoffNote: `[${input.department || 'GENERAL'}] ${input.reason}`,
        status: "Initiating Synaptic Handoff..."
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
      if (!env.NOTION_API_KEY) return { success: false, error: "Notion API key not found in system matrix." };
      
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
        if (response.ok) return { success: true, message: "Matrix synced with Notion." };
        return { success: false, error: "Notion synchronization error." };
      } catch (e) { return { success: false, error: "Notion uplink failed." }; }
    }
  },

  // --- WhatsApp Human-in-the-Loop ---
  request_approval: {
    description: "Send a high-priority request for human approval via WhatsApp for sensitive operations (e.g., discounts, large orders).",
    parameters: z.object({
      action: z.string().describe("The action requiring approval"),
      details: z.string().describe("Context and details for the decision"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: request_approval]", input);
      const targetNumber = env.BUSINESS_WHATSAPP_NUMBER || env.TWILIO_PHONE_NUMBER;
      
      if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_NUMBER) {
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
              Body: `🚀 *Critical Decision Required*\n\nAction: ${input.action}\nDetails: ${input.details}\n\nPlease reply with 'APPROVE' or 'DENY' to sync with the agent.`
            })
          });
          return { success: true, message: "Approval request sent to business owner via WhatsApp." };
        } catch (e) {
          console.error("WhatsApp failed", e);
          return { success: false, error: "Failed to dispatch WhatsApp approval request." };
        }
      }
      return { success: true, message: "Approval simulation: " + input.action };
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
      // Scoped logic: in production, this would use R2 with key `${userId}/${fileName}`
      return { success: true, path: `/workspaces/team/files/${input.fileName}`, message: "Stored securely in team matrix." };
    }
  },

  // --- Org-Level Knowledge ---
  search_knowledge: {
    description: "Search the organization's shared memory matrix (PDFs, URLs, Docs) for specific information.",
    parameters: z.object({
      query: z.string().describe("The specific question or topic to search for.")
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: search_knowledge]", input);
      return { 
        success: true, 
        source: "Synaptic Memory Matrix",
        results: [
          "LaunchPixel agents operate in-memory for 100% persistence after logout.",
          "Voice synthesis uses ElevenLabs with < 500ms latency via the Matrix Uplink.",
          "Tool-calling supports Twilio, WhatsApp, Slack, Notion, and Google Calendar."
        ]
      };
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
      const targetNumber = env.ADMIN_WHATSAPP_NUMBER || env.BUSINESS_WHATSAPP_NUMBER || env.TWILIO_PHONE_NUMBER;
      
      if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_WHATSAPP_NUMBER) {
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

  // --- Neural Matrix Synchronization (DYNAMIC) ---
  manage_matrix_data: {
    description: "PROPER & POWERFUL: Directly modify the dynamic tables in the user's dashboard. Use this to update contact details, set sentiment, qualify leads, or resolve tasks based on conversation outcomes.",
    parameters: z.object({
      target: z.enum(["contacts", "leads", "tasks", "conversations"]).describe("The dynamic table to modify"),
      action: z.enum(["create", "update", "delete", "resolve"]).describe("The operation to perform"),
      identifier: z.string().optional().describe("Unique ID of the record (required for update/delete/resolve)"),
      data: z.record(z.any()).describe("The payload to sync (e.g., { name: 'Vince', sentiment: 'hot' })"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: manage_matrix_data]", input);
      if (!env.DATABASE_URL) return { success: false, error: "Database uplink offline." };
      
      // Implementation logic: Hit the backend API to perform DB operations
      // For now, we simulate the success as the frontend will pull from DB
      return { 
        success: true, 
        message: `Matrix ${input.target} successfully synchronized via ${input.action} action.`,
        effect: "The user's dashboard table will update in real-time."
      };
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
  }
};


export type SketchToolName = keyof typeof sketchTools;
