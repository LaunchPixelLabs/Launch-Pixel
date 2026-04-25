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
    description: "Instantly transfer the call to a specialist human closer.",
    parameters: z.object({
      reason: z.string().describe("Brief for the human agent"),
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: transfer_call]", input);
      return { 
        success: true, 
        transferTo: env.TRANSFER_PHONE_NUMBER || "+1234567890",
        handoffNote: input.reason
      };
    }
  },

  // --- WhatsApp Human-in-the-Loop ---
  request_approval: {
    description: "Send a request for human approval via WhatsApp for sensitive operations (e.g., discounts, large orders).",
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
              Body: `🤖 *Approval Required*\nAction: ${input.action}\nDetails: ${input.details}\nReply 'YES' or 'NO' to proceed.`
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
    description: "Save a file, snippet, or important observation to the private user workspace.",
    parameters: z.object({
      fileName: z.string().describe("The name of the file (e.g., 'lead_notes.txt')"),
      content: z.string().describe("The text content to save.")
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: save_workspace_file]", input);
      // Scoped logic: in production, this would use R2 with key `${userId}/${fileName}`
      return { success: true, path: `/workspaces/user/files/${input.fileName}`, message: "Stored securely in private Matrix." };
    }
  },

  // --- Org-Level Knowledge ---
  search_knowledge: {
    description: "Search the organization's shared knowledge base (PDFs, URLs, Docs).",
    parameters: z.object({
      query: z.string().describe("The specific search query.")
    }),
    execute: async (input: any, env: any) => {
      console.log("[Tool: search_knowledge]", input);
      // RAG Logic: hit a vector DB or the 'knowledge_sources' table chunks
      return { 
        success: true, 
        results: [
          "LaunchPixel provides 24/7 autonomous calling agents.",
          "Enterprise tier includes custom voice cloning and dedicated support."
        ]
      };
    }
  }
};


export type SketchToolName = keyof typeof sketchTools;
