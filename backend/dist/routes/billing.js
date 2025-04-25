import { Router } from 'express';
import bodyParser from 'body-parser';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as bill from '../services/billing.service.js';
const r = Router();
// protected endpoints
r.post('/checkout', requireAuth, async (req, res) => {
    const sess = await bill.createCheckout(req.userId);
    res.json({ url: sess.url });
});
r.post('/portal', requireAuth, async (req, res) => {
    const sess = await bill.portal(req.userId);
    res.json({ url: sess.url });
});
// webhook (raw body)
r.post('/stripe/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
    try {
        const event = bill.verifyStripe(req.headers['stripe-signature'], req.body);
        // TODO: handle event.type -> persist subscription state
        res.json({ received: true });
    }
    catch (e) {
        res.status(400).send(`Webhook Error: ${e.message}`);
    }
});
export default r;
