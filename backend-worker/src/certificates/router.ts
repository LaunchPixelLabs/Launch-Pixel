import { Hono } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { certificates, certificateVerificationLogs } from '../db/certificate-schema';
import { eq, desc, and, like } from 'drizzle-orm';
import {
  createCertificate,
  verifyCertificate,
  revokeCertificate,
  bulkCreateCertificates,
  CreateCertificateInput,
} from './generator';

/**
 * Certificate Management API Router
 * 
 * Endpoints for creating, verifying, and managing certificates
 */

export const certificateRouter = new Hono<{ Bindings: Bindings }>();

// ======================================================================
// PUBLIC VERIFICATION ENDPOINT (No Auth Required)
// ======================================================================

// GET /certificates/verify/:verificationId - Public certificate verification
certificateRouter.get('/verify/:verificationId', async (c) => {
  const verificationId = c.req.param('verificationId');
  
  // Extract context from request
  const ipAddress = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for');
  const userAgent = c.req.header('user-agent');
  
  const result = await verifyCertificate(c.env, verificationId, {
    ipAddress,
    userAgent,
  });
  
  return c.json(result);
});

// ======================================================================
// ADMIN ENDPOINTS (Require Authentication)
// ======================================================================

// Helper to get user ID from auth header (you can customize this)
async function getUserId(c: any): Promise<string | null> {
  // TODO: Implement your auth logic here
  // For now, we'll use a simple header check
  const userId = c.req.header('x-user-id');
  return userId || null;
}

// POST /certificates/create - Create a single certificate
certificateRouter.post('/create', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const body = await c.req.json();
    
    const input: CreateCertificateInput = {
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      candidatePhone: body.candidatePhone,
      candidateId: body.candidateId,
      certificateType: body.certificateType,
      programName: body.programName,
      programDuration: body.programDuration,
      issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      grade: body.grade,
      skillsAcquired: body.skillsAcquired,
      projectsCompleted: body.projectsCompleted,
      performanceNotes: body.performanceNotes,
      issuedBy: body.issuedBy,
      issuerTitle: body.issuerTitle,
      issuerSignature: body.issuerSignature,
      metadata: body.metadata,
      notes: body.notes,
      createdBy: userId,
    };
    
    const result = await createCertificate(c.env, input);
    
    if (result.success) {
      return c.json({
        success: true,
        message: 'Certificate created successfully',
        certificate: result.certificate,
        verificationUrl: result.verificationUrl,
        qrCodeUrl: result.qrCodeUrl,
      });
    } else {
      return c.json({ success: false, error: result.error }, 400);
    }
  } catch (error: any) {
    console.error('[Certificate Create] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /certificates/bulk-create - Create multiple certificates
certificateRouter.post('/bulk-create', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const body = await c.req.json();
    const { certificates: certsData } = body;
    
    if (!Array.isArray(certsData) || certsData.length === 0) {
      return c.json({ error: 'Invalid input: certificates array required' }, 400);
    }
    
    const inputs: CreateCertificateInput[] = certsData.map((cert: any) => ({
      candidateName: cert.candidateName,
      candidateEmail: cert.candidateEmail,
      candidatePhone: cert.candidatePhone,
      candidateId: cert.candidateId,
      certificateType: cert.certificateType,
      programName: cert.programName,
      programDuration: cert.programDuration,
      issueDate: cert.issueDate ? new Date(cert.issueDate) : new Date(),
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
      grade: cert.grade,
      skillsAcquired: cert.skillsAcquired,
      projectsCompleted: cert.projectsCompleted,
      performanceNotes: cert.performanceNotes,
      issuedBy: cert.issuedBy,
      issuerTitle: cert.issuerTitle,
      issuerSignature: cert.issuerSignature,
      metadata: cert.metadata,
      notes: cert.notes,
      createdBy: userId,
    }));
    
    const result = await bulkCreateCertificates(c.env, inputs);
    
    return c.json({
      success: true,
      message: `Processed ${result.results.length} certificates`,
      results: result.results,
    });
  } catch (error: any) {
    console.error('[Certificate Bulk Create] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /certificates/list - List all certificates (with pagination)
certificateRouter.get('/list', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const db = getDb(c.env.DATABASE_URL);
    
    // Query parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const status = c.req.query('status'); // 'active', 'revoked', 'expired'
    const search = c.req.query('search'); // Search by candidate name
    const type = c.req.query('type'); // Filter by certificate type
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = db.select().from(certificates);
    
    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(certificates.status, status));
    }
    if (type) {
      conditions.push(eq(certificates.certificateType, type));
    }
    if (search) {
      conditions.push(like(certificates.candidateName, `%${search}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const results = await query
      .orderBy(desc(certificates.createdAt))
      .limit(limit)
      .offset(offset);
    
    return c.json({
      success: true,
      certificates: results,
      pagination: {
        page,
        limit,
        total: results.length,
      },
    });
  } catch (error: any) {
    console.error('[Certificate List] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /certificates/:id - Get single certificate details
certificateRouter.get('/:id', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = parseInt(c.req.param('id'));
    const db = getDb(c.env.DATABASE_URL);
    
    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, id),
    });
    
    if (!certificate) {
      return c.json({ error: 'Certificate not found' }, 404);
    }
    
    // Get verification logs
    const logs = await db.select()
      .from(certificateVerificationLogs)
      .where(eq(certificateVerificationLogs.certificateId, id))
      .orderBy(desc(certificateVerificationLogs.verifiedAt))
      .limit(10);
    
    return c.json({
      success: true,
      certificate,
      verificationLogs: logs,
    });
  } catch (error: any) {
    console.error('[Certificate Get] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// PUT /certificates/:id - Update certificate
certificateRouter.put('/:id', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const db = getDb(c.env.DATABASE_URL);
    
    // Build update object (only include provided fields)
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (body.candidateName) updateData.candidateName = body.candidateName;
    if (body.candidateEmail !== undefined) updateData.candidateEmail = body.candidateEmail;
    if (body.candidatePhone !== undefined) updateData.candidatePhone = body.candidatePhone;
    if (body.grade !== undefined) updateData.grade = body.grade;
    if (body.skillsAcquired) updateData.skillsAcquired = JSON.stringify(body.skillsAcquired);
    if (body.projectsCompleted) updateData.projectsCompleted = JSON.stringify(body.projectsCompleted);
    if (body.performanceNotes !== undefined) updateData.performanceNotes = body.performanceNotes;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.metadata) updateData.metadata = JSON.stringify(body.metadata);
    
    const result = await db.update(certificates)
      .set(updateData)
      .where(eq(certificates.id, id))
      .returning();
    
    if (result.length === 0) {
      return c.json({ error: 'Certificate not found' }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Certificate updated successfully',
      certificate: result[0],
    });
  } catch (error: any) {
    console.error('[Certificate Update] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /certificates/:id/revoke - Revoke a certificate
certificateRouter.post('/:id/revoke', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const reason = body.reason || 'No reason provided';
    
    const result = await revokeCertificate(c.env, id, userId, reason);
    
    if (result.success) {
      return c.json({
        success: true,
        message: result.message,
      });
    } else {
      return c.json({ success: false, error: result.message }, 400);
    }
  } catch (error: any) {
    console.error('[Certificate Revoke] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /certificates/:id/verification-logs - Get verification history
certificateRouter.get('/:id/verification-logs', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = parseInt(c.req.param('id'));
    const db = getDb(c.env.DATABASE_URL);
    
    const logs = await db.select()
      .from(certificateVerificationLogs)
      .where(eq(certificateVerificationLogs.certificateId, id))
      .orderBy(desc(certificateVerificationLogs.verifiedAt));
    
    return c.json({
      success: true,
      logs,
    });
  } catch (error: any) {
    console.error('[Certificate Logs] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /certificates/stats - Get certificate statistics
certificateRouter.get('/stats/overview', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const db = getDb(c.env.DATABASE_URL);
    
    // Get counts by status
    const allCerts = await db.select().from(certificates);
    
    const stats = {
      total: allCerts.length,
      active: allCerts.filter(c => c.status === 'active').length,
      revoked: allCerts.filter(c => c.status === 'revoked').length,
      expired: allCerts.filter(c => c.expiryDate && new Date(c.expiryDate) < new Date()).length,
      totalVerifications: allCerts.reduce((sum, c) => sum + (c.verificationCount || 0), 0),
      byType: {} as Record<string, number>,
    };
    
    // Count by type
    allCerts.forEach(cert => {
      stats.byType[cert.certificateType] = (stats.byType[cert.certificateType] || 0) + 1;
    });
    
    return c.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('[Certificate Stats] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// POST /certificates/download/:id - Generate downloadable certificate (PDF/Image)
certificateRouter.post('/download/:id', async (c) => {
  const userId = await getUserId(c);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const id = parseInt(c.req.param('id'));
    const db = getDb(c.env.DATABASE_URL);
    
    const certificate = await db.query.certificates.findFirst({
      where: eq(certificates.id, id),
    });
    
    if (!certificate) {
      return c.json({ error: 'Certificate not found' }, 404);
    }
    
    // TODO: Implement PDF generation using a library like puppeteer or jsPDF
    // For now, return the certificate data
    return c.json({
      success: true,
      message: 'PDF generation coming soon',
      certificate,
      downloadUrl: certificate.publicVerificationUrl,
    });
  } catch (error: any) {
    console.error('[Certificate Download] Error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});
