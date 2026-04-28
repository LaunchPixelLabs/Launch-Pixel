/**
 * Cloudflare Pages Function — Careers Form Handler
 * POST /api/careers
 *
 * Accepts multipart/form-data (for resume uploads).
 * Uploads resume to R2, then forwards all form fields + resume URL
 * to Google Apps Script for Google Sheets storage + email notification.
 */

interface Env {
  GOOGLE_SCRIPT_URL: string;
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

    // ── Process all form entries ──────────────────────────────────────
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        // Upload resume to R2
        const timestamp = Date.now();
        const sanitizedName = value.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileKey = `resumes/${timestamp}_${sanitizedName}`;

        const arrayBuffer = await value.arrayBuffer();
        await env.RESUMES.put(fileKey, arrayBuffer, {
          httpMetadata: {
            contentType: value.type || 'application/octet-stream',
            contentDisposition: `attachment; filename="${value.name}"`,
          },
          customMetadata: {
            originalName: value.name,
            uploadedAt: new Date().toISOString(),
          },
        });

        // Build full download URL
        const origin = new URL(request.url).origin;
        fields['Resume Link'] = `${origin}/api/download/${fileKey}`;
      } else if (typeof value === 'string' && value.trim()) {
        // Skip FormSubmit-specific hidden fields (legacy, just in case)
        if (!key.startsWith('_')) {
          fields[key] = value.trim();
        }
      }
    }

    // ── Validate required fields ──────────────────────────────────────
    if (!fields['Full Name'] || !fields['Email Address']) {
      return jsonResponse(
        { success: false, message: 'Full Name and Email Address are required.' },
        400
      );
    }

    // ── Forward to Google Apps Script ──────────────────────────────────
    const payload = {
      formType: 'careers',
      fields,
    };

    const gasResponse = await fetch(env.GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!gasResponse.ok && gasResponse.status >= 400) {
      console.error('Google Apps Script error:', gasResponse.status);
      return jsonResponse(
        { success: false, message: 'Failed to save your application. Please try again.' },
        502
      );
    }

    return jsonResponse({
      success: true,
      message: 'Application submitted successfully! Our team will review it shortly.',
    });
  } catch (error) {
    console.error('Careers form error:', error);
    return jsonResponse(
      { success: false, message: 'Something went wrong. Please try again later.' },
      500
    );
  }
};

// Handle CORS preflight
export const onRequestOptions = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};
