import Donation from '../models/Donation.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Create a new donation
export const createDonation = async (req, res) => {
  try {
    const { 
      title, description, category, condition, 
      location, contactPhone 
    } = req.body;
    
    // Create donation object
    const donation = new Donation({
      userId: req.userId,
      title,
      description,
      category,
      condition,
      location: location,
      contactPhone
    });
    
    // Handle photos
    if (req.files && req.files.length > 0) {
      donation.photos = req.files.map(file => file.path);
    }
    
    await donation.save();
    
    // Populate user data
    await donation.populate('user', 'name username profileImage');
    
    // Award points to the user for donating
    const user = await User.findById(req.userId);
    if (user) {
      user.points += 15; // 15 points for creating a donation
      await user.save();
    }
    
    res.status(201).json(donation);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all donations
export const getDonations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const status = req.query.status || 'available';
    
    // Build query
    const query = { status };
    if (category) {
      query.category = category;
    }
    
    // Find donations
    const donations = await Donation.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Donation.countDocuments(query);
    
    res.status(200).json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single donation by ID
export const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }
    
    // Find donation
    const donation = await Donation.findById(id)
      .populate('user', 'name username profileImage');
    
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    res.status(200).json(donation);
  } catch (error) {
    console.error('Get donation by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a donation
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, category, condition, 
      location, contactPhone, status 
    } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }
    
    // Find donation
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    // Check if user owns the donation
    if (!donation.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to update this donation' });
    }
    
    // Update fields if provided
    if (title) donation.title = title;
    if (description) donation.description = description;
    if (category) donation.category = category;
    if (condition) donation.condition = condition;
    if (location) donation.location = JSON.parse(location);
    if (contactPhone !== undefined) donation.contactPhone = contactPhone;
    if (status) donation.status = status;
    
    // Handle new photos
    if (req.files && req.files.length > 0) {
      // Delete old photos from Cloudinary if they exist
      if (donation.photos && donation.photos.length > 0) {
        for (const photoUrl of donation.photos) {
          if (photoUrl.includes('cloudinary')) {
            try {
              const publicId = photoUrl.split('/').pop().split('.')[0];
              await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
              console.error('Error deleting photo from Cloudinary:', cloudinaryError);
              // Continue with update even if deletion fails
            }
          }
        }
      }
      
      // Set new photos
      donation.photos = req.files.map(file => file.path);
    }
    
    await donation.save();
    
    // Populate user data
    await donation.populate('user', 'name username profileImage');
    
    res.status(200).json(donation);
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a donation
export const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }
    
    // Find donation
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    // Check if user owns the donation
    if (!donation.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to delete this donation' });
    }
    
    // Delete photos from Cloudinary if they exist
    if (donation.photos && donation.photos.length > 0) {
      for (const photoUrl of donation.photos) {
        if (photoUrl.includes('cloudinary')) {
          try {
            const publicId = photoUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error('Error deleting photo from Cloudinary:', cloudinaryError);
            // Continue with deletion even if Cloudinary fails
          }
        }
      }
    }
    
    // Delete donation
    await Donation.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search donations
export const searchDonations = async (req, res) => {
  try {
    const { query, category, condition, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery = { status: 'available' };
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'location.address': { $regex: query, $options: 'i' } }
      ];
    }
    
    // Filters
    if (category) searchQuery.category = category;
    if (condition) searchQuery.condition = condition;
    
    // Location search (if coordinates provided)
    if (location) {
      const [lat, lng, radius] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
        searchQuery['location.lat'] = { $gte: lat - radius, $lte: lat + radius };
        searchQuery['location.lng'] = { $gte: lng - radius, $lte: lng + radius };
      }
    }
    
    // Find donations
    const donations = await Donation.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Donation.countDocuments(searchQuery);
    
    res.status(200).json({
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search donations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reserve a donation
export const reserveDonation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donation ID' });
    }
    
    // Find donation
    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    // Check if donation is available
    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'This donation is not available' });
    }
    
    // Update donation status
    donation.status = 'reserved';
    await donation.save();
    
    // Populate user data
    await donation.populate('user', 'name username profileImage');
    
    res.status(200).json(donation);
  } catch (error) {
    console.error('Reserve donation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};