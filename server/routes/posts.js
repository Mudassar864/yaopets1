import express from 'express';
import { 
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  addComment,
  getPostComments,
  likeComment,
  unlikeComment,
  deleteComment
} from '../controllers/postController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Create a new post (requires auth)
router.post('/', auth, upload.array('media', 5), createPost);

// Get all posts (optional auth)
router.get('/', optionalAuth, getPosts);

// Get a single post by ID (optional auth)
router.get('/:id', optionalAuth, getPostById);

// Update a post (requires auth)
router.put('/:id', auth, updatePost);

// Delete a post (requires auth)
router.delete('/:id', auth, deletePost);

// Like a post (requires auth)
router.post('/:id/like', auth, likePost);

// Unlike a post (requires auth)
router.delete('/:id/like', auth, unlikePost);

// Save a post (requires auth)
router.post('/:id/save', auth, savePost);

// Unsave a post (requires auth)
router.delete('/:id/save', auth, unsavePost);

// Add a comment to a post (requires auth)
router.post('/:id/comments', auth, addComment);

// Get comments for a post (optional auth)
router.get('/:id/comments', optionalAuth, getPostComments);

// Like a comment (requires auth)
router.post('/comments/:id/like', auth, likeComment);

// Unlike a comment (requires auth)
router.delete('/comments/:id/like', auth, unlikeComment);

// Delete a comment (requires auth)
router.delete('/comments/:id', auth, deleteComment);

export default router;