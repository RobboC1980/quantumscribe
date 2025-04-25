import Stripe from 'stripe';
import { JWT_SECRET } from '../config/env.js';
import jwt from 'jsonwebtoken';
const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: '2023-08-16' });
const PRICE = process.env.STRIPE_PRICE_MONTHLY; // $ plan
export function createCheckout(userId) {
    return stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: lookupEmail(userId),
        line_items: [{ price: PRICE, quantity: 1 }],
        success_url: `${process.env.PUBLIC_URL}/dashboard?sub=success`,
        cancel_url: `${process.env.PUBLIC_URL}/billing?canceled=true`,
        metadata: { userId }
    });
}
export async function portal(userId) {
    const customerId = await findCustomerByMetadata(userId);
    return stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.PUBLIC_URL}/billing`
    });
}
// -- helpers (simple demo stubs) --
function lookupEmail(userId) {
    // replace with prisma query
    return `${userId}@example.com`;
}
async function findCustomerByMetadata(userId) {
    const list = await stripe.customers.list({ limit: 1, email: lookupEmail(userId) });
    return list.data[0].id;
}
// verify webhook
export function verifyStripe(sig, raw) {
    return stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
}
// simple token generator for Customer Portal on client side (optional)
export function signJwt(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '15m' });
}
