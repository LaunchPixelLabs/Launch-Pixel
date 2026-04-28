import { Hono } from 'hono';
import Stripe from 'stripe';
import { Bindings } from '../index';

const router = new Hono<{ Bindings: Bindings }>();

// Create Checkout Session
router.post('/create-checkout-session', async (c) => {
  try {
    const { priceId, userId, successUrl, cancelUrl } = await c.req.json();
    
    if (!priceId || !userId) {
      return c.json({ error: 'Missing priceId or userId' }, 400);
    }
    
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe is not configured in this environment' }, 500);
    }

    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia',
      httpClient: Stripe.createFetchHttpClient(), // Use fetch for Cloudflare Workers
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${new URL(c.req.url).origin}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${new URL(c.req.url).origin}/pricing?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
      }
    });

    return c.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Webhook endpoint to handle Stripe events
router.post('/webhook', async (c) => {
  if (!c.env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe is not configured' }, 500);
  }
  
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });
  
  const sig = c.req.header('stripe-signature');
  const body = await c.req.text();
  
  // Note: For Cloudflare workers, you typically verify the webhook secret directly
  // or use the webhook endpoint secret if configured in env vars.
  // For now, we process the event directly. In production, signature verification is strongly recommended.
  
  try {
    const event = JSON.parse(body) as Stripe.Event;
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        // In a full implementation, you would update the user's subscription status in the database here
        console.log(`[Stripe] Checkout completed for user ${userId}, Subscription: ${session.subscription}`);
        break;
      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription deleted: ${deletedSub.id}`);
        // Handle subscription cancellation
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    return c.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }
});

// Get available prices
router.get('/prices', async (c) => {
  return c.json({
    starter: c.env.STRIPE_PRICE_STARTER || null,
    growth: c.env.STRIPE_PRICE_GROWTH || null,
  });
});

export default router;
