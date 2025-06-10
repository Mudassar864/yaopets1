import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import "./passport.js"

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import petRoutes from './routes/pets.js';
import donationRoutes from './routes/donations.js';
import vetHelpRoutes from './routes/vetHelp.js';
import chatRoutes from './routes/chats.js';
import uploadRoutes from './routes/uploads.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(process.cwd(), 'dist')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/vet-help', vetHelpRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api', paymentRoutes);
// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'YaoPets API is running' });
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });