import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participant1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participant2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, { 
  timestamps: true 
});

// Virtual for participant1 data
chatSchema.virtual('participant1', {
  ref: 'User',
  localField: 'participant1Id',
  foreignField: '_id',
  justOne: true
});

// Virtual for participant2 data
chatSchema.virtual('participant2', {
  ref: 'User',
  localField: 'participant2Id',
  foreignField: '_id',
  justOne: true
});

// Virtual for last message
chatSchema.virtual('lastMessage', {
  ref: 'Message',
  localField: 'lastMessageId',
  foreignField: '_id',
  justOne: true
});

// Set virtuals to true when converting to JSON
chatSchema.set('toJSON', { virtuals: true });
chatSchema.set('toObject', { virtuals: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;