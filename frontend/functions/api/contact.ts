/**
 * Cloudflare Pages Function — Contact Form Handler
 * POST /api/contact
 *
 * Validates form fields, then forwards the data to a Google Apps Script
 * web app which writes it to Google Sheets and sends an email notification.
 */

interface Env {
  GOOGLE_SCRIPT_URL: string;
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
    const body: Record<string, string> = await request.json();

    // ── Validate required fields ──────────────────────────────────────
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return jsonResponse(
        { success: false, message: 'Please fill in all required fields.' },
        400
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse(
        { success: false, message: 'Please enter a valid email address.' },
        400
      );
    }

    // ── Forward to Google Apps Script ──────────────────────────────────
    const payload = {
      formType: 'contact',
      fields: {
        Name: name.trim(),
        Email: email.trim(),
        Phone: (body.phone || '').trim(),
        Subject: subject.trim(),
        Message: message.trim(),
      },
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
        { success: false, message: 'Failed to save your message. Please try again.' },
        502
      );
    }

    return jsonResponse({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
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
