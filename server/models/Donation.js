import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['food', 'accessory', 'toy', 'medicine', 'equipment', 'other'],
    required: true
  },
  condition: {
    type: String,
    enum: ['new', 'almost new', 'used - good', 'used - worn'],
    required: true
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
    enum: ['available', 'reserved', 'donated'],
    default: 'available'
  },
  contactPhone: {
    type: String,
    default: ''
  }
}, { 
  timestamps: true 
});

// Virtual for user data
donationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Set virtuals to true when converting to JSON
donationSchema.set('toJSON', { virtuals: true });
donationSchema.set('toObject', { virtuals: true });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;