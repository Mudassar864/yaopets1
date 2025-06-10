import express from 'express';
import { 
  getUserChats,
  getOrCreateChat,
  getChatMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount
} from '../controllers/chatController.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all chats for a user (requires auth)
router.get('/', auth, getUserChats);

// Get or create a chat with another user (requires auth)
router.get('/user/:userId', auth, getOrCreateChat);

// Get messages for a chat (requires auth)
router.get('/:id/messages', auth, getChatMessages);

// Send a message (requires auth)
router.post('/:id/messages', auth, upload.single('attachment'), sendMessage);

// Delete a message (requires auth)
router.delete('/:id/messages/:messageId', auth, deleteMessage);

// Get unread messages count (requires auth)
router.get('/unread', auth, getUnreadCount);

export default router;