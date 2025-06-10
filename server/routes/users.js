import express from 'express';
import { 
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  getUserPosts,
  getUserPets,
  getUserSavedPosts,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing
} from '../controllers/userController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get user profile (optional auth)
router.get('/:id', optionalAuth, getUserProfile);

// Update user profile (requires auth)
router.put('/profile', auth, updateUserProfile);

// Update profile image (requires auth)
router.put('/profile/image', auth, upload.single('image'), updateProfileImage);

// Get user posts (optional auth)
router.get('/:id/posts', optionalAuth, getUserPosts);

// Get user pets (optional auth)
router.get('/:id/pets', optionalAuth, getUserPets);

// Get user saved posts (requires auth)
router.get('/saved/posts', auth, getUserSavedPosts);

// Follow user (requires auth)
router.post('/:id/follow', auth, followUser);

// Unfollow user (requires auth)
router.delete('/:id/follow', auth, unfollowUser);

// Get user followers (optional auth)
router.get('/:id/followers', optionalAuth, getUserFollowers);

// Get user following (optional auth)
router.get('/:id/following', optionalAuth, getUserFollowing);

export default router;