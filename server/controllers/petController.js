import Pet from '../models/Pet.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Create a new pet
export const createPet = async (req, res) => {
  try {
    
    const { 
      name, species, breed, color, size, age, 
      status, description, lastLocation, contactPhone 
    } = req.body;
    
    // Create pet object
    const pet = new Pet({
      userId: req.userId,
      name,
      species,
      breed,
      color,
      size,
      age,
      status,
      description,
      lastLocation: lastLocation ? JSON.parse(lastLocation) : null,
      contactPhone
    });
    
    // Handle photos
    if (req.files && req.files.length > 0) {
      pet.photos = req.files.map(file => file.path);
    }
    
    await pet.save();
    
    // Populate user data
    await pet.populate('user', 'name username profileImage');
    
    // Award points to the user based on pet status
    const user = await User.findById(req.userId);
    if (user) {
      if (status === 'adoption') {
        user.points += 15; // 15 points for putting a pet up for adoption
      } else if (status === 'found') {
        user.points += 20; // 20 points for reporting a found pet
      } else if (status === 'lost') {
        user.points += 5; // 5 points for reporting a lost pet
      }
      await user.save();
    }
    
    res.status(201).json(pet);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pets
export const getPets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    
    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    
    // Find pets
    const pets = await Pet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Pet.countDocuments(query);
    
    res.status(200).json({
      pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single pet by ID
export const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid pet ID' });
    }
    
    // Find pet
    const pet = await Pet.findById(id)
      .populate('user', 'name username profileImage')
      .populate('foundById', 'name username profileImage');
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    res.status(200).json(pet);
  } catch (error) {
    console.error('Get pet by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a pet
export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, species, breed, color, size, age, 
      status, description, lastLocation, contactPhone 
    } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid pet ID' });
    }
    
    // Find pet
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if user owns the pet
    if (!pet.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to update this pet' });
    }
    
    // Update fields if provided
    if (name) pet.name = name;
    if (species) pet.species = species;
    if (breed !== undefined) pet.breed = breed;
    if (color) pet.color = color;
    if (size) pet.size = size;
    if (age) pet.age = age;
    if (status) pet.status = status;
    if (description !== undefined) pet.description = description;
    if (lastLocation) pet.lastLocation = JSON.parse(lastLocation);
    if (contactPhone !== undefined) pet.contactPhone = contactPhone;
    
    // Handle new photos
    if (req.files && req.files.length > 0) {
      // Delete old photos from Cloudinary if they exist
      if (pet.photos && pet.photos.length > 0) {
        for (const photoUrl of pet.photos) {
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
      pet.photos = req.files.map(file => file.path);
    }
    
    await pet.save();
    
    // Populate user data
    await pet.populate('user', 'name username profileImage');
    if (pet.foundById) {
      await pet.populate('foundById', 'name username profileImage');
    }
    
    res.status(200).json(pet);
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a pet
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid pet ID' });
    }
    
    // Find pet
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if user owns the pet
    if (!pet.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to delete this pet' });
    }
    
    // Delete photos from Cloudinary if they exist
    if (pet.photos && pet.photos.length > 0) {
      for (const photoUrl of pet.photos) {
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
    
    // Delete pet
    await Pet.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Report a pet as found
export const reportPetFound = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, description } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid pet ID' });
    }
    
    // Find pet
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if pet is already found
    if (pet.status !== 'lost') {
      return res.status(400).json({ message: 'This pet is not marked as lost' });
    }
    
    // Update pet
    pet.status = 'found';
    pet.foundById = req.userId;
    if (location) pet.lastLocation = JSON.parse(location);
    if (description) pet.description = description;
    
    await pet.save();
    
    // Populate user data
    await pet.populate('user', 'name username profileImage');
    await pet.populate('foundById', 'name username profileImage');
    
    // Award points to the user for finding a pet
    const user = await User.findById(req.userId);
    if (user) {
      user.points += 30; // 30 points for finding a lost pet
      await user.save();
    }
    
    res.status(200).json(pet);
  } catch (error) {
    console.error('Report pet found error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search pets
export const searchPets = async (req, res) => {
  try {
    const { query, status, species, size, age, location } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery = {};
    
    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { breed: { $regex: query, $options: 'i' } },
        { color: { $regex: query, $options: 'i' } },
        { 'lastLocation.address': { $regex: query, $options: 'i' } }
      ];
    }
    
    // Filters
    if (status) searchQuery.status = status;
    if (species) searchQuery.species = species;
    if (size) searchQuery.size = size;
    if (age) searchQuery.age = age;
    
    // Location search (if coordinates provided)
    if (location) {
      const [lat, lng, radius] = location.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
        searchQuery['lastLocation.lat'] = { $gte: lat - radius, $lte: lat + radius };
        searchQuery['lastLocation.lng'] = { $gte: lng - radius, $lte: lng + radius };
      }
    }
    
    // Find pets
    const pets = await Pet.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Pet.countDocuments(searchQuery);
    
    res.status(200).json({
      pets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search pets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};