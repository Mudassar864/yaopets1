import express from 'express';
import { 
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  reportPetFound,
  searchPets
} from '../controllers/petController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Create a new pet (requires auth)
router.post('/', auth, upload.array('photos', 5), createPet);

// Get all pets (optional auth)
router.get('/', optionalAuth, getPets);

// Get a single pet by ID (optional auth)
router.get('/:id', optionalAuth, getPetById);

// Update a pet (requires auth)
router.put('/:id', auth, upload.array('photos', 5), updatePet);

// Delete a pet (requires auth)
router.delete('/:id', auth, deletePet);

// Report a pet as found (requires auth)
router.post('/:id/found', auth, reportPetFound);

// Search pets (optional auth)
router.get('/search', optionalAuth, searchPets);

export default router;