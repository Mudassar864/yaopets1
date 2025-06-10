import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String },
  username: { type: String, required: true, unique: true, trim: true },
  profileImage: { type: String, default: '' },
  city: { type: String, default: '' },
  bio: { type: String, default: '' },
  website: { type: String, default: '' },
  userType: { type: String, enum: ['tutor', 'veterinarian', 'volunteer', 'donor','admin'], default: 'tutor' },
  points: { type: Number, default: 0 },
  level: { type: String, default: 'Beginner' },
  verified: { type: Boolean, default: false },
  achievementBadges: [{ type: String }],
  googleId: { type: String, default: null },
  facebookId: { type: String, default: null },
  linkedinId: { type: String, default: null },
  provider: { type: String, enum: ['local', 'google', 'facebook', 'linkedin'], default: 'local' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Pre-save hook for password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Profile method
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    username: this.username,
    profileImage: this.profileImage,
    city: this.city,
    bio: this.bio,
    website: this.website,
    userType: this.userType,
    points: this.points,
    level: this.level,
    verified: this.verified,
    achievementBadges: this.achievementBadges,
    provider: this.provider,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const User = mongoose.model('User', userSchema);
export default User;