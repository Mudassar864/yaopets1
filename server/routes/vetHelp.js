import express from 'express';
import { 
  createVetHelp,
  getVetHelp,
  getVetHelpById,
  updateVetHelp,
  deleteVetHelp,
  createCheckoutSession,
  handleStripeWebhook,
  getVetHelpDonations,
  createPaymentIntent
} from '../controllers/vetHelpController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Create a new vet help campaign (requires auth)
router.post('/', auth, upload.array('photos', 5), createVetHelp);

// Get all vet help campaigns (optional auth)
router.get('/', optionalAuth, getVetHelp);

// Get a single vet help campaign by ID (optional auth)
router.get('/:id', optionalAuth, getVetHelpById);

// Update a vet help campaign (requires auth)
router.put('/:id', auth, upload.array('photos', 5), updateVetHelp);

// Delete a vet help campaign (requires auth)
router.delete('/:id', auth, deleteVetHelp);

// Create a Stripe checkout session for donation (requires auth)
router.post('/checkout-session', auth, createCheckoutSession);

// Handle Stripe webhook for successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Get donations for a vet help campaign (optional auth)
router.get('/:id/donations', optionalAuth, getVetHelpDonations);

// Create a payment intent for direct donation (requires auth)
router.post('/payment-intent', auth, createPaymentIntent);

export default router;