import { Bindings } from '../index';
import { getDb } from '../db';
import { certificates, certificateVerificationLogs } from '../db/certificate-schema';
import { eq } from 'drizzle-orm';

/**
 * Certificate Generator & QR Code Service
 * 
 * Handles certificate creation, QR code generation, and verification
 */

// Generate a cryptographically secure verification ID
export function generateVerificationId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate QR code data URL (we'll use a QR code API)
export async function generateQRCode(verificationUrl: string): Promise<string> {
  // Using QR Server API (free, no API key needed)
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(verificationUrl)}&format=png`;
  return qrApiUrl;
}

// Alternative: Generate QR code using Cloudflare's built-in capabilities
export async function generateQRCodeAdvanced(verificationUrl: string): Promise<string> {
  // For production, you might want to use a library like 'qrcode' or store QR codes in R2
  // For now, we'll use the API approach which is simpler
  return generateQRCode(verificationUrl);
}

export interface CreateCertificateInput {
  // Candidate Info
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateId?: number; // Link to existing contact
  
  // Certificate Details
  certificateType: 'internship' | 'course' | 'achievement' | 'participation' | string;
  programName: string;
  programDuration?: string;
  issueDate: Date;
  expiryDate?: Date;
  
  // Performance
  grade?: string;
  skillsAcquired?: string[];
  projectsCompleted?: string[];
  performanceNotes?: string;
  
  // Issuer
  issuedBy?: string;
  issuerTitle?: string;
  issuerSignature?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  notes?: string;
  
  // Creator
  createdBy: string; // User ID
}

export async function createCertificate(
  env: Bindings,
  input: CreateCertificateInput
): Promise<{
  success: boolean;
  certificate?: any;
  verificationUrl?: string;
  qrCodeUrl?: string;
  error?: string;
}> {
  try {
    const db = getDb(env.DATABASE_URL);
    
    // 1. Generate unique verification ID
    const verificationId = generateVerificationId();
    
    // 2. Construct public verification URL
    const baseUrl = (env as any).PUBLIC_URL || 'https://launchpixel.in';
    const publicVerificationUrl = `${baseUrl}/verify/${verificationId}`;
    
    // 3. Generate QR code
    const qrCodeUrl = await generateQRCode(publicVerificationUrl);
    
    // 4. Insert certificate into database
    const result = await db.insert(certificates).values({
      verificationId,
      candidateId: input.candidateId || null,
      candidateName: input.candidateName,
      candidateEmail: input.candidateEmail || null,
      candidatePhone: input.candidatePhone || null,
      certificateType: input.certificateType,
      programName: input.programName,
      programDuration: input.programDuration || null,
      issueDate: input.issueDate,
      expiryDate: input.expiryDate || null,
      grade: input.grade || null,
      skillsAcquired: input.skillsAcquired ? JSON.stringify(input.skillsAcquired) : null,
      projectsCompleted: input.projectsCompleted ? JSON.stringify(input.projectsCompleted) : null,
      performanceNotes: input.performanceNotes || null,
      issuedBy: input.issuedBy || 'Launch Pixel',
      issuerTitle: input.issuerTitle || null,
      issuerSignature: input.issuerSignature || null,
      status: 'active',
      verificationCount: 0,
      qrCodeUrl,
      publicVerificationUrl,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      notes: input.notes || null,
      createdBy: input.createdBy,
    }).returning();
    
    const certificate = result[0];
    
    return {
      success: true,
      certificate,
      verificationUrl: publicVerificationUrl,
      qrCodeUrl,
    };
  } catch (error: any) {
    console.error('[Certificate Generator] Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create certificate',
    };
  }
}

export async function verifyCertificate(
  env: Bindings,
  verificationId: string,
  context?: {
    ipAddress?: string;
    userAgent?: string;
    verifiedBy?: string;
    purpose?: string;
  }
): Promise<{
  success: boolean;
  certificate?: any;
  status: 'valid' | 'invalid' | 'expired' | 'revoked';
  message: string;
}> {
  try {
    const db = getDb(env.DATABASE_URL);
    
    // 1. Find certificate by verification ID
    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.verificationId, verificationId),
    });
    
    if (!certificate) {
      return {
        success: false,
        status: 'invalid',
        message: 'Certificate not found. This verification ID is invalid.',
      };
    }
    
    // 2. Check certificate status
    if (certificate.status === 'revoked') {
      // Log verification attempt
      await db.insert(certificateVerificationLogs).values({
        certificateId: certificate.id,
        verificationId,
        status: 'revoked',
        ipAddress: context?.ipAddress || null,
        userAgent: context?.userAgent || null,
        verifiedBy: context?.verifiedBy || null,
        purpose: context?.purpose || null,
      });
      
      return {
        success: false,
        certificate,
        status: 'revoked',
        message: `This certificate was revoked on ${certificate.revokedAt?.toLocaleDateString()}. Reason: ${certificate.revokedReason || 'Not specified'}`,
      };
    }
    
    // 3. Check expiry
    if (certificate.expiryDate && new Date(certificate.expiryDate) < new Date()) {
      // Log verification attempt
      await db.insert(certificateVerificationLogs).values({
        certificateId: certificate.id,
        verificationId,
        status: 'expired',
        ipAddress: context?.ipAddress || null,
        userAgent: context?.userAgent || null,
        verifiedBy: context?.verifiedBy || null,
        purpose: context?.purpose || null,
      });
      
      return {
        success: false,
        certificate,
        status: 'expired',
        message: `This certificate expired on ${certificate.expiryDate.toLocaleDateString()}.`,
      };
    }
    
    // 4. Certificate is valid - log verification and update count
    await db.insert(certificateVerificationLogs).values({
      certificateId: certificate.id,
      verificationId,
      status: 'valid',
      ipAddress: context?.ipAddress || null,
      userAgent: context?.userAgent || null,
      verifiedBy: context?.verifiedBy || null,
      purpose: context?.purpose || null,
    });
    
    // Update verification count and last verified timestamp
    await db.update(certificates)
      .set({
        verificationCount: (certificate.verificationCount || 0) + 1,
        lastVerifiedAt: new Date(),
      })
      .where(eq(certificates.id, certificate.id));
    
    return {
      success: true,
      certificate: {
        ...certificate,
        verificationCount: (certificate.verificationCount || 0) + 1,
      },
      status: 'valid',
      message: 'Certificate is valid and authentic.',
    };
  } catch (error: any) {
    console.error('[Certificate Verification] Error:', error);
    return {
      success: false,
      status: 'invalid',
      message: 'An error occurred during verification. Please try again.',
    };
  }
}

export async function revokeCertificate(
  env: Bindings,
  certificateId: number,
  revokedBy: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDb(env.DATABASE_URL);
    
    await db.update(certificates)
      .set({
        status: 'revoked',
        revokedAt: new Date(),
        revokedBy,
        revokedReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(certificates.id, certificateId));
    
    return {
      success: true,
      message: 'Certificate revoked successfully.',
    };
  } catch (error: any) {
    console.error('[Certificate Revocation] Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to revoke certificate.',
    };
  }
}

export async function bulkCreateCertificates(
  env: Bindings,
  certificates: CreateCertificateInput[]
): Promise<{
  success: boolean;
  results: Array<{
    candidateName: string;
    success: boolean;
    verificationUrl?: string;
    qrCodeUrl?: string;
    error?: string;
  }>;
}> {
  const results = [];
  
  for (const cert of certificates) {
    const result = await createCertificate(env, cert);
    results.push({
      candidateName: cert.candidateName,
      success: result.success,
      verificationUrl: result.verificationUrl,
      qrCodeUrl: result.qrCodeUrl,
      error: result.error,
    });
  }
  
  return {
    success: true,
    results,
  };
}
