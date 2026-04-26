import { pgTable, serial, text, integer, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { agentContacts } from './schema';

/**
 * CERTIFICATE VERIFICATION SYSTEM
 * 
 * This module handles certificate generation, verification, and QR code management
 * for candidates who have completed programs or received certifications.
 */

// --- CERTIFICATES ---
export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  
  // Unique verification ID (used in QR code and public URL)
  verificationId: varchar('verification_id', { length: 64 }).notNull().unique(),
  
  // Candidate Information
  candidateId: integer('candidate_id').references(() => agentContacts.id, { onDelete: 'set null' }),
  candidateName: varchar('candidate_name', { length: 255 }).notNull(),
  candidateEmail: varchar('candidate_email', { length: 255 }),
  candidatePhone: varchar('candidate_phone', { length: 50 }),
  
  // Certificate Details
  certificateType: varchar('certificate_type', { length: 100 }).notNull(), // 'internship', 'course', 'achievement', 'participation'
  programName: varchar('program_name', { length: 255 }).notNull(),
  programDuration: varchar('program_duration', { length: 100 }), // e.g., "3 months", "6 weeks"
  issueDate: timestamp('issue_date').notNull(),
  expiryDate: timestamp('expiry_date'), // null for non-expiring certificates
  
  // Performance & Skills
  grade: varchar('grade', { length: 50 }), // 'A+', 'Excellent', '95%', etc.
  skillsAcquired: text('skills_acquired'), // JSON array or comma-separated
  projectsCompleted: text('projects_completed'), // JSON array of project names
  performanceNotes: text('performance_notes'),
  
  // Issuer Information
  issuedBy: varchar('issued_by', { length: 255 }).notNull().default('Launch Pixel'),
  issuerTitle: varchar('issuer_title', { length: 255 }), // 'CEO', 'Program Director', etc.
  issuerSignature: text('issuer_signature'), // Base64 encoded signature image or URL
  
  // Verification & Security
  status: varchar('status', { length: 50 }).notNull().default('active'), // 'active', 'revoked', 'expired'
  verificationCount: integer('verification_count').default(0), // Track how many times verified
  lastVerifiedAt: timestamp('last_verified_at'),
  
  // QR Code & URLs
  qrCodeUrl: text('qr_code_url'), // URL to generated QR code image
  publicVerificationUrl: text('public_verification_url'), // Public URL for verification
  
  // Metadata
  metadata: text('metadata'), // JSON for additional custom fields
  notes: text('notes'), // Internal notes
  
  // Audit Trail
  createdBy: varchar('created_by', { length: 255 }).notNull(), // User ID who created
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  revokedAt: timestamp('revoked_at'),
  revokedBy: varchar('revoked_by', { length: 255 }),
  revokedReason: text('revoked_reason'),
});

export const certificatesRelations = relations(certificates, ({ one, many }) => ({
  candidate: one(agentContacts, {
    fields: [certificates.candidateId],
    references: [agentContacts.id],
  }),
  verificationLogs: many(certificateVerificationLogs),
}));

// --- CERTIFICATE VERIFICATION LOGS ---
export const certificateVerificationLogs = pgTable('certificate_verification_logs', {
  id: serial('id').primaryKey(),
  certificateId: integer('certificate_id').references(() => certificates.id, { onDelete: 'cascade' }),
  verificationId: varchar('verification_id', { length: 64 }).notNull(),
  
  // Verification Details
  verifiedAt: timestamp('verified_at').defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
  userAgent: text('user_agent'),
  location: varchar('location', { length: 255 }), // City, Country from IP
  
  // Verification Result
  status: varchar('status', { length: 50 }).notNull(), // 'valid', 'invalid', 'expired', 'revoked'
  
  // Additional Context
  verifiedBy: varchar('verified_by', { length: 255 }), // Email or name if provided
  purpose: varchar('purpose', { length: 100 }), // 'employment', 'education', 'personal', etc.
  notes: text('notes'),
});

export const certificateVerificationLogsRelations = relations(certificateVerificationLogs, ({ one }) => ({
  certificate: one(certificates, {
    fields: [certificateVerificationLogs.certificateId],
    references: [certificates.id],
  }),
}));

// --- CERTIFICATE TEMPLATES ---
export const certificateTemplates = pgTable('certificate_templates', {
  id: serial('id').primaryKey(),
  
  // Template Details
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // 'internship', 'course', etc.
  description: text('description'),
  
  // Design & Layout
  templateHtml: text('template_html'), // HTML template with placeholders
  templateCss: text('template_css'), // Custom CSS for the template
  backgroundImage: text('background_image'), // URL to background image
  
  // Default Values
  defaultIssuer: varchar('default_issuer', { length: 255 }),
  defaultIssuerTitle: varchar('default_issuer_title', { length: 255 }),
  defaultSignature: text('default_signature'),
  
  // Settings
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),
  
  // Metadata
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- CERTIFICATE BATCHES (For Bulk Generation) ---
export const certificateBatches = pgTable('certificate_batches', {
  id: serial('id').primaryKey(),
  
  // Batch Details
  batchName: varchar('batch_name', { length: 255 }).notNull(),
  programName: varchar('program_name', { length: 255 }).notNull(),
  certificateType: varchar('certificate_type', { length: 100 }).notNull(),
  
  // Status
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  totalCount: integer('total_count').default(0),
  successCount: integer('success_count').default(0),
  failedCount: integer('failed_count').default(0),
  
  // Processing
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorLog: text('error_log'),
  
  // Metadata
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const certificateBatchesRelations = relations(certificateBatches, ({ many }) => ({
  certificates: many(certificates),
}));
