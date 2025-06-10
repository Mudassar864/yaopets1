import express from 'express';
import { 
  createDonation,
  getDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  searchDonations,
  reserveDonation
} from '../controllers/donationController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Create a new donation (requires auth)
router.post('/', auth, upload.array('photos', 5), createDonation);

// Get all donations (optional auth)
router.get('/', optionalAuth, getDonations);

// Get a single donation by ID (optional auth)
router.get('/:id', optionalAuth, getDonationById);

// Update a donation (requires auth)
router.put('/:id', auth, upload.array('photos', 5), updateDonation);

// Delete a donation (requires auth)
router.delete('/:id', auth, deleteDonation);

// Search donations (optional auth)
router.get('/search', optionalAuth, searchDonations);

// Reserve a donation (requires auth)
router.post('/:id/reserve', auth, reserveDonation);

export default router;