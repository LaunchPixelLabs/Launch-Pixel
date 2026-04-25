import { Context } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { campaigns, campaignLeads, agentConfigurations } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sendOutboundWhatsApp } from './whatsapp';

/**
 * Executes an outbound campaign (Call or WhatsApp).
 * Iterates through pending leads and triggers the respective AI outreach.
 */
export async function executeCampaign(c: Context<{ Bindings: Bindings }>) {
  const { id } = c.req.param();
  const db = getDb(c.env.DATABASE_URL);
  
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, parseInt(id)),
    with: { 
      agent: true, 
      leads: { 
        with: { contact: true } 
      } 
    }
  });

  if (!campaign) {
    return c.json({ error: 'Campaign not found' }, 404);
  }

  if (campaign.status === 'completed') {
    return c.json({ error: 'Campaign already completed' }, 400);
  }

  // Update status to active
  await db.update(campaigns)
    .set({ status: 'active', updatedAt: new Date() })
    .where(eq(campaigns.id, campaign.id));

  // Process in the background to avoid timeout
  c.executionCtx.waitUntil((async () => {
    console.log(`[Campaign] Starting execution for ${campaign.name} (${campaign.type})`);
    
    for (const lead of campaign.leads) {
      if (lead.status !== 'pending') continue;

      try {
        if (campaign.type === 'call') {
          // 1. TRIGGER OUTBOUND AI CALL
          const auth = btoa(`${c.env.TWILIO_ACCOUNT_SID}:${c.env.TWILIO_AUTH_TOKEN}`);
          const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${c.env.TWILIO_ACCOUNT_SID}/Calls.json`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              From: campaign.agent?.assignedPhoneNumber || c.env.TWILIO_PHONE_NUMBER,
              To: lead.contact?.phoneNumber || '',
              Url: `${new URL(c.req.url).origin}/twiml?agentId=${campaign.agentId}`
            })
          });

          const twilioData = await twilioRes.json() as any;
          if (twilioRes.ok) {
            await db.update(campaignLeads)
              .set({ status: 'contacted', callSid: twilioData.sid, lastAttemptAt: new Date() })
              .where(eq(campaignLeads.id, lead.id));
          } else {
            throw new Error(twilioData.message || 'Twilio Call Failed');
          }

        } else if (campaign.type === 'whatsapp') {
          // 2. TRIGGER OUTBOUND AI WHATSAPP
          const success = await sendOutboundWhatsApp(
            c.env, 
            campaign.agentId!, 
            lead.contact?.phoneNumber || '', 
            `Hello ${lead.contact?.name || 'there'}! This is your AI assistant. How can I help your business today?`
          );

          if (success) {
            await db.update(campaignLeads)
              .set({ status: 'contacted', lastAttemptAt: new Date() })
              .where(eq(campaignLeads.id, lead.id));
          } else {
            throw new Error('WhatsApp Send Failed');
          }
        }
      } catch (err: any) {
        console.error(`[Campaign] Error processing lead ${lead.id}:`, err.message);
        await db.update(campaignLeads)
          .set({ status: 'failed', lastAttemptAt: new Date() })
          .where(eq(campaignLeads.id, lead.id));
      }
      
      // Throttle to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mark campaign as completed
    await db.update(campaigns)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(campaigns.id, campaign.id));
      
    console.log(`[Campaign] Completed execution for ${campaign.name}`);
  })());

  return c.json({ success: true, message: 'Campaign execution started in background' });
}
