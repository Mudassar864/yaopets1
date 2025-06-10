import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'save', 'follow', 'comment_like'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['post', 'comment', 'user'],
    required: true
  }
}, { 
  timestamps: true 
});

// Create a compound index to ensure uniqueness
interactionSchema.index({ userId: 1, type: 1, targetId: 1, targetType: 1 }, { unique: true });

const Interaction = mongoose.model('Interaction', interactionSchema);

export default Interaction;