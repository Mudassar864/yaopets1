import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Make sure to set your Stripe secret key in your environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // Use the latest compatible Stripe API version
});

// Create PaymentIntent for Stripe Elements card form
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, description, fundraiser } = req.body;
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl', // Change to your currency (e.g., 'usd')
      description: description || 'Donation',
      metadata: fundraiser ? { fundraiser } : {},
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create Stripe Checkout session for redirect-based donation
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, description, fundraiser } = req.body;
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl', // Change to your currency (e.g., 'usd')
            product_data: {
              name: description || 'Donation',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: fundraiser ? { fundraiser } : {},
      success_url: process.env.FRONTEND_URL + '/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.FRONTEND_URL + '/checkout?cancelled=true',
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

export default router;