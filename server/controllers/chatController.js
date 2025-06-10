import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    // Find chats where user is a participant
    const chats = await Chat.find({
      $or: [
        { participant1Id: req.userId },
        { participant2Id: req.userId }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate('participant1', 'name username profileImage')
      .populate('participant2', 'name username profileImage')
      .populate('lastMessage');
    
    // Format chats for response
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participant1Id.equals(req.userId) 
        ? chat.participant2 
        : chat.participant1;
      
      // Count unread messages
      const unreadCount = 0; // This will be calculated in a separate query
      
      return {
        id: chat._id,
        participant: otherParticipant,
        lastMessage: chat.lastMessage,
        unreadCount,
        updatedAt: chat.updatedAt
      };
    });
    
    // Get unread counts for each chat
    for (const chat of formattedChats) {
      chat.unreadCount = await Message.countDocuments({
        conversationId: chat.id,
        recipientId: req.userId,
        read: false
      });
    }
    
    res.status(200).json(formattedChats);
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get or create a chat with another user
export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is trying to chat with themselves
    if (req.userId === userId) {
      return res.status(400).json({ message: 'You cannot chat with yourself' });
    }
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      $or: [
        { participant1Id: req.userId, participant2Id: userId },
        { participant1Id: userId, participant2Id: req.userId }
      ]
    })
      .populate('participant1', 'name username profileImage')
      .populate('participant2', 'name username profileImage')
      .populate('lastMessage');
    
    // If chat doesn't exist, create it
    if (!chat) {
      chat = new Chat({
        participant1Id: req.userId,
        participant2Id: userId
      });
      
      await chat.save();
      
      // Populate participants
      await chat.populate('participant1', 'name username profileImage');
      await chat.populate('participant2', 'name username profileImage');
    }
    
    // Format chat for response
    const otherParticipant = chat.participant1Id.equals(req.userId) 
      ? chat.participant2 
      : chat.participant1;
    
    // Count unread messages
    const unreadCount = await Message.countDocuments({
      conversationId: chat._id,
      recipientId: req.userId,
      read: false
    });
    
    const formattedChat = {
      id: chat._id,
      participant: otherParticipant,
      lastMessage: chat.lastMessage,
      unreadCount,
      updatedAt: chat.updatedAt
    };
    
    res.status(200).json(formattedChat);
  } catch (error) {
    console.error('Get or create chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a chat
export const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }
    
    // Find chat
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant
    if (!chat.participant1Id.equals(req.userId) && !chat.participant2Id.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to view this chat' });
    }
    
    // Find messages
    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Message.countDocuments({ conversationId: id });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId: id, 
        recipientId: req.userId,
        read: false
      },
      { read: true }
    );
    
    // Return messages in reverse order (oldest first)
    const orderedMessages = [...messages].reverse();
    
    res.status(200).json({
      messages: orderedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }
    
    // Find chat
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant
    if (!chat.participant1Id.equals(req.userId) && !chat.participant2Id.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to send messages in this chat' });
    }
    
    // Determine recipient
    const recipientId = chat.participant1Id.equals(req.userId) 
      ? chat.participant2Id 
      : chat.participant1Id;
    
    // Create message
    const message = new Message({
      conversationId: id,
      senderId: req.userId,
      recipientId,
      content,
      attachmentUrl: req.file ? req.file.path : null
    });
    
    await message.save();
    
    // Update chat's lastMessageId and updatedAt
    chat.lastMessageId = message._id;
    chat.updatedAt = new Date();
    await chat.save();
    
    // Populate sender data
    await message.populate('sender', 'name username profileImage');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { id, messageId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    
    // Find message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check if message belongs to the chat
    if (!message.conversationId.equals(id)) {
      return res.status(400).json({ message: 'Message does not belong to this chat' });
    }
    
    // Check if user is the sender
    if (!message.senderId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to delete this message' });
    }
    
    // Delete attachment from Cloudinary if exists
    if (message.attachmentUrl && message.attachmentUrl.includes('cloudinary')) {
      try {
        const publicId = message.attachmentUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting attachment from Cloudinary:', cloudinaryError);
        // Continue with deletion even if Cloudinary fails
      }
    }
    
    // Delete message
    await Message.findByIdAndDelete(messageId);
    
    // Update chat's lastMessageId if this was the last message
    const chat = await Chat.findById(id);
    if (chat && chat.lastMessageId && chat.lastMessageId.equals(messageId)) {
      // Find the new last message
      const newLastMessage = await Message.findOne({ conversationId: id })
        .sort({ createdAt: -1 });
      
      chat.lastMessageId = newLastMessage ? newLastMessage._id : null;
      await chat.save();
    }
    
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread messages count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipientId: req.userId,
      read: false
    });
    
    res.status(200).json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};