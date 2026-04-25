import { Context } from 'hono';
import { Bindings } from '../index';
import { getDb } from '../db';
import { agentConfigurations } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Provisions a unique Twilio subaccount and phone number for a specific agent.
 * This ensures multi-tenant isolation and prevents trial account number sharing limits.
 */
export async function provisionAgentNumber(c: Context<{ Bindings: Bindings }>) {
  const { id } = c.req.param();
  const { areaCode } = await c.req.json() as { areaCode?: string };

  if (!id) return c.json({ error: 'Agent ID required' }, 400);

  const db = getDb(c.env.DATABASE_URL);
  const config = await db.query.agentConfigurations.findFirst({
    where: eq(agentConfigurations.id, parseInt(id))
  });

  if (!config) return c.json({ error: 'Agent not found' }, 404);

  try {
    const auth = btoa(`${c.env.TWILIO_ACCOUNT_SID}:${c.env.TWILIO_AUTH_TOKEN}`);

    // 1. Create Subaccount if it doesn't exist
    let subAccountSid = config.twilioSubaccountSid;
    let subAccountToken = config.twilioSubaccountToken;

    if (!subAccountSid) {
      console.log(`[Twilio] Creating subaccount for Agent ${id}...`);
      const subRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ FriendlyName: `Agent-${id}-${config.name}` })
      });

      const subData = await subRes.json() as any;
      if (!subRes.ok) throw new Error(subData.message || 'Failed to create subaccount');
      
      subAccountSid = subData.sid;
      subAccountToken = subData.auth_token;
    }

    // 2. Search for available numbers in the subaccount
    const subAuth = btoa(`${subAccountSid}:${subAccountToken}`);
    const searchRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${subAccountSid}/AvailablePhoneNumbers/US/Local.json?AreaCode=${areaCode || '213'}`, {
      headers: { 'Authorization': `Basic ${subAuth}` }
    });
    
    const searchData = await searchRes.json() as any;
    const availableNumber = searchData.available_phone_numbers?.[0];

    if (!availableNumber) throw new Error('No available numbers found for this area code.');

    // 3. Purchase the number
    const buyRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${subAccountSid}/IncomingPhoneNumbers.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${subAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        PhoneNumber: availableNumber.phone_number,
        VoiceUrl: `${new URL(c.req.url).origin}/twiml`,
        StatusCallback: `${new URL(c.req.url).origin}/webhook`
      })
    });

    const buyData = await buyRes.json() as any;
    if (!buyRes.ok) throw new Error(buyData.message || 'Failed to purchase number');

    // 4. Update Database
    await db.update(agentConfigurations)
      .set({
        assignedPhoneNumber: availableNumber.phone_number,
        twilioSubaccountSid: subAccountSid,
        twilioSubaccountToken: subAccountToken,
        updatedAt: new Date()
      })
      .where(eq(agentConfigurations.id, parseInt(id)));

    return c.json({
      success: true,
      phoneNumber: availableNumber.phone_number,
      subAccountSid
    });

  } catch (error: any) {
    console.error("[Twilio Provisioning] Error:", error);
    return c.json({ error: 'Provisioning failed', details: error.message }, 500);
  }
}
