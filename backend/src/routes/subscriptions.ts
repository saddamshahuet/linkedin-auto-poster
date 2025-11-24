import { Router } from 'express';
import { authenticate, requireOrganization } from '../middleware/auth';
import { SubscriptionModel } from '../models/Subscription';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireOrganization);

// Get subscription details
router.get('/', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const subscription = await SubscriptionModel.findByOrganizationId(organizationId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch subscription', message: error.message });
  }
});

// Create checkout session
router.post('/checkout', async (req: any, res) => {
  try {
    const { organizationId } = req.params;
    const { planId, billingCycle } = req.body;

    const { stripe, SUBSCRIPTION_PLANS } = require('../config/stripe');
    const { OrganizationModel } = require('../models/Organization');

    const organization = await OrganizationModel.findById(organizationId);
    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan || !plan.stripePriceId) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      client_reference_id: organizationId,
      metadata: {
        organizationId,
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session', message: error.message });
  }
});

export default router;
