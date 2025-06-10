import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  breed: {
    type: String,
    default: '',
    trim: true
  },
  color: {
    type: String,
    default: '',
    trim: true
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  age: {
    type: String,
    enum: ['puppy', 'young', 'adult', 'senior'],
    default: 'adult'
  },
  status: {
    type: String,
    enum: ['adoption', 'lost', 'found'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  lastLocation: {
    address: String,
    lat: Number,
    lng: Number
  },
  photos: [{
    type: String
  }],
  contactPhone: {
    type: String,
    default: ''
  },
  foundById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true 
});

// Virtual for user data
petSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Set virtuals to true when converting to JSON
petSchema.set('toJSON', { virtuals: true });
petSchema.set('toObject', { virtuals: true });

const Pet = mongoose.model('Pet', petSchema);

export default Pet;