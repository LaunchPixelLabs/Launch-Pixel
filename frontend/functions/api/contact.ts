/**
 * Cloudflare Pages Function — Contact Form Handler
 * POST /api/contact
 *
 * Validates fields and saves to MySQL via backend API.
 */

interface Env {
  BACKEND_API_URL: string;
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
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return jsonResponse({ success: false, message: 'Please fill in all required fields.' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ success: false, message: 'Please enter a valid email address.' }, 400);
    }

    const dbRes = await fetch(`${env.BACKEND_API_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: (body.phone || '').trim(),
        subject: subject.trim(),
        message: message.trim(),
      }),
    });

    if (!dbRes.ok) {
      const err = await dbRes.json() as any;
      console.error('Backend contact save failed:', err);
      return jsonResponse({ success: false, message: err.message || 'Failed to save message.' }, 502);
    }

    return jsonResponse({ success: true, message: "Message sent successfully! We'll get back to you within 24 hours." });
  } catch (error) {
    console.error('Contact form error:', error);
    return jsonResponse({ success: false, message: 'Something went wrong. Please try again later.' }, 500);
  }
};

export const onRequestOptions = async () =>
  new Response(null, { status: 204, headers: corsHeaders });
