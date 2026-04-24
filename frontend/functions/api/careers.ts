/**
 * Cloudflare Pages Function — Careers Form Handler
 * POST /api/careers
 *
 * 1. Uploads resume to R2
 * 2. Saves candidate to MySQL via backend API
 */

interface Env {
  BACKEND_API_URL: string;
  RESUMES: any; // R2Bucket
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    let resumeFile: File | null = null;

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        resumeFile = value;
      } else if (typeof value === 'string' && value.trim() && !key.startsWith('_')) {
        fields[key] = value.trim();
      }
    }

    if (!fields['Full Name'] || !fields['Email Address']) {
      return jsonResponse({ success: false, message: 'Full Name and Email Address are required.' }, 400);
    }

    // ── 1. Upload resume to R2 ────────────────────────────────────────
    if (resumeFile) {
      const timestamp = Date.now();
      const sanitizedName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileKey = `resumes/${timestamp}_${sanitizedName}`;

      await env.RESUMES.put(fileKey, await resumeFile.arrayBuffer(), {
        httpMetadata: {
          contentType: resumeFile.type || 'application/octet-stream',
          contentDisposition: `attachment; filename="${resumeFile.name}"`,
        },
        customMetadata: { originalName: resumeFile.name, uploadedAt: new Date().toISOString() },
      });

      const origin = new URL(request.url).origin;
      fields['Resume Link'] = `${origin}/api/download/${fileKey}`;
    }

    // ── 2. Save to MySQL via backend ──────────────────────────────────
    const backendForm = new FormData();
    for (const [k, v] of Object.entries(fields)) backendForm.append(k, v);
    if (resumeFile) backendForm.append('attachment', resumeFile);

    const dbRes = await fetch(`${env.BACKEND_API_URL}/api/candidates`, {
      method: 'POST',
      body: backendForm,
    });

    if (!dbRes.ok) {
      const err = await dbRes.json() as any;
      console.error('Backend DB save failed:', err);
      return jsonResponse({ success: false, message: err.message || 'Failed to save application.' }, 502);
    }

    return jsonResponse({ success: true, message: 'Application submitted successfully! Our team will review it shortly.' });
  } catch (error) {
    console.error('Careers form error:', error);
    return jsonResponse({ success: false, message: 'Something went wrong. Please try again later.' }, 500);
  }
};

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });
