import { z } from "zod";
import { Bindings } from "../index";

/**
 * Sketch-inspired Skills System
 * 
 * Skills are high-level business capabilities that combine multiple tools.
 */

export interface Skill {
  name: string;
  description: string;
  category: "sales" | "ops" | "dev" | "hr";
  tools: any[];
  promptOverlay: string; // Additional context injected into system prompt
}

export const skillRegistry: Record<string, Skill> = {
  "icp_discovery": {
    name: "ICP Discovery",
    description: "Identify and qualify Ideal Customer Profiles from conversations.",
    category: "sales",
    tools: [], // Uses base lead_capture tools
    promptOverlay: "When talking to prospects, focus on uncovering budget, authority, need, and timeline (BANT)."
  },
  "customer_support_pro": {
    name: "Support Specialist",
    description: "Handle complex support queries using the knowledge base.",
    category: "ops",
    tools: [], // Uses search_knowledge
    promptOverlay: "Always verify information against the knowledge base before providing a final answer."
  }
};
