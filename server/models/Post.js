import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  mediaUrls: [{
    type: String
  }],
  mediaType: {
    type: String,
    enum: ['image', 'gif', 'video'],
    default: 'image'
  },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  visibilityType: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  postType: {
    type: String,
    enum: ['regular', 'event', 'question', 'story'],
    default: 'regular'
  },
  isStory: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Virtual for user data
postSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Set virtuals to true when converting to JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

export default Post;