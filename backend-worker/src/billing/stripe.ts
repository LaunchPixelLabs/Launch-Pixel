import Stripe from 'stripe';
import { Bindings } from '../index';

/**
 * Helper to get Stripe client.
 */
export const getStripeClient = (apiKey: string) => new Stripe(apiKey, {
  apiVersion: '2025-01-27.acacia' as any, // Cast to avoid strict version mismatch if types are newer
});

/**
 * Create a one‑off Checkout Session for the Starter or Growth tier.
 * Returns the URL the client should redirect to.
 */
export async function createCheckoutSession(env: Bindings, tier: 'starter' | 'growth', successUrl: string, cancelUrl: string) {
  const stripeSecret = env.STRIPE_SECRET_KEY;
  const priceId = tier === 'starter' ? env.STRIPE_PRICE_STARTER : env.STRIPE_PRICE_GROWTH;
  
  if (!stripeSecret) throw new Error('STRIPE_SECRET_KEY not configured');
  if (!priceId) throw new Error('Stripe price ID not configured');

  const stripe = getStripeClient(stripeSecret);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tier },
  });
  return session.url;
}

