import mongoose from 'mongoose';

const vetHelpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 1
  },
  currentAmount: {
    type: Number,
    default: 0
  },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  photos: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    default: null
  },
  endDate: {
    type: Date,
    required: true
  },
  donations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    message: String
  }]
}, { 
  timestamps: true 
});

// Virtual for user data
vetHelpSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for pet data
vetHelpSchema.virtual('pet', {
  ref: 'Pet',
  localField: 'petId',
  foreignField: '_id',
  justOne: true
});

// Virtual for percentage complete
vetHelpSchema.virtual('percentComplete').get(function() {
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

// Virtual for days remaining
vetHelpSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Set virtuals to true when converting to JSON
vetHelpSchema.set('toJSON', { virtuals: true });
vetHelpSchema.set('toObject', { virtuals: true });

const VetHelp = mongoose.model('VetHelp', vetHelpSchema);

export default VetHelp;