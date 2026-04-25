import { NextResponse } from 'next/server';

interface WebhookPayload {
  callSid?: string;
  callStatus?: string;
  duration?: string;
  transcript?: string;
  contactName?: string;
  contactPhone?: string;
  outcome?: string;
  toolsCalled?: string[];
  conversationId?: string;
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as WebhookPayload;
    
    console.log('[Webhook API] Call completed hook received from ElevenLabs', {
      callSid: data.callSid,
      status: data.callStatus,
      duration: data.duration,
      conversationId: data.conversationId,
    });

    // Store call data in database (if backend is available)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/api/call-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callSid: data.callSid,
            contactPhone: data.contactPhone,
            contactName: data.contactName,
            duration: data.duration,
            status: data.callStatus,
            transcript: data.transcript,
            outcome: data.outcome,
            toolsCalled: data.toolsCalled,
            conversationId: data.conversationId,
            timestamp: new Date().toISOString(),
          }),
        });
        console.log('[Webhook API] Call log saved to database');
      } catch (dbError) {
        console.error('[Webhook API] Failed to save to database:', dbError);
        // Don't fail the webhook if database save fails
      }
    }

    // Send WhatsApp notification if meeting was booked or follow-up needed
    const shouldNotify = 
      data.toolsCalled?.includes('book_meeting') || 
      data.outcome?.toLowerCase().includes('interested') ||
      data.outcome?.toLowerCase().includes('follow-up');

    if (shouldNotify) {
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER;
      const whatsappTo = process.env.BUSINESS_WHATSAPP_NUMBER;

      if (twilioAccountSid && twilioAuthToken && whatsappFrom && whatsappTo) {
        try {
          const message = `🎯 *Hot Lead Alert!*\n\n` +
            `👤 Contact: ${data.contactName || 'Unknown'}\n` +
            `📞 Phone: ${data.contactPhone}\n` +
            `⏱️ Duration: ${data.duration}s\n` +
            `📊 Outcome: ${data.outcome || 'Interested'}\n` +
            `🔧 Actions: ${data.toolsCalled?.join(', ') || 'None'}\n\n` +
            `${data.transcript ? `💬 Key Points:\n${data.transcript.substring(0, 200)}...` : ''}`;

          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const credentials = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

          const formData = new URLSearchParams();
          formData.append('From', whatsappFrom);
          formData.append('To', whatsappTo);
          formData.append('Body', message);

          const whatsappResponse = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });

          if (whatsappResponse.ok) {
            console.log('[Webhook API] WhatsApp notification sent successfully');
          } else {
            const errorData = await whatsappResponse.json();
            console.error('[Webhook API] WhatsApp send failed:', errorData);
          }
        } catch (whatsappError) {
          console.error('[Webhook API] WhatsApp notification error:', whatsappError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      notificationSent: shouldNotify,
    });

  } catch (error: any) {
    console.error('[Webhook API] Failed to process webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error.message },
      { status: 500 }
    );
  }
}
