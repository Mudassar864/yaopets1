import VetHelp from '../models/VetHelp.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new vet help campaign
export const createVetHelp = async (req, res) => {
  try {
    const { 
      title, description, targetAmount, location, 
      petId, daysToComplete, motivo 
    } = req.body;
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(daysToComplete || 30));
    
    // Create vet help object
    const vetHelp = new VetHelp({
      userId: req.userId,
      title,
      description,
      targetAmount: parseFloat(targetAmount),
      location: location ? JSON.parse(location) : null,
      petId: petId || null,
      endDate,
      currentAmount: 0
    });
    
    // Handle photos
    if (req.files && req.files.length > 0) {
      vetHelp.photos = req.files.map(file => file.path);
    }
    
    await vetHelp.save();
    
    // Populate user data
    await vetHelp.populate('user', 'name username profileImage');
    if (vetHelp.petId) {
      await vetHelp.populate('pet');
    }
    
    // Award points to the user for creating a campaign
    const user = await User.findById(req.userId);
    if (user) {
      user.points += 10; // 10 points for creating a vet help campaign
      await user.save();
    }
    
    res.status(201).json(vetHelp);
  } catch (error) {
    console.error('Create vet help error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all vet help campaigns
export const getVetHelp = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'active';
    
    // Build query
    const query = { status };
    
    // Find vet help campaigns
    const vetHelp = await VetHelp.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage')
      .populate('pet', 'name species photos');
    
    // Get total count for pagination
    const total = await VetHelp.countDocuments(query);
    
    res.status(200).json({
      vetHelp,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vet help error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single vet help campaign by ID
export const getVetHelpById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid vet help ID' });
    }
    
    // Find vet help campaign
    const vetHelp = await VetHelp.findById(id)
      .populate('user', 'name username profileImage')
      .populate('pet', 'name species photos');
    
    if (!vetHelp) {
      return res.status(404).json({ message: 'Vet help campaign not found' });
    }
    
    res.status(200).json(vetHelp);
  } catch (error) {
    console.error('Get vet help by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a vet help campaign
export const updateVetHelp = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, targetAmount, location, 
      petId, status, endDate 
    } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid vet help ID' });
    }
    
    // Find vet help campaign
    const vetHelp = await VetHelp.findById(id);
    if (!vetHelp) {
      return res.status(404).json({ message: 'Vet help campaign not found' });
    }
    
    // Check if user owns the campaign
    if (!vetHelp.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to update this campaign' });
    }
    
    // Update fields if provided
    if (title) vetHelp.title = title;
    if (description) vetHelp.description = description;
    if (targetAmount) vetHelp.targetAmount = parseFloat(targetAmount);
    if (location) vetHelp.location = JSON.parse(location);
    if (petId) vetHelp.petId = petId;
    if (status) vetHelp.status = status;
    if (endDate) vetHelp.endDate = new Date(endDate);
    
    // Handle new photos
    if (req.files && req.files.length > 0) {
      // Delete old photos from Cloudinary if they exist
      if (vetHelp.photos && vetHelp.photos.length > 0) {
        for (const photoUrl of vetHelp.photos) {
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
      vetHelp.photos = req.files.map(file => file.path);
    }
    
    await vetHelp.save();
    
    // Populate user data
    await vetHelp.populate('user', 'name username profileImage');
    if (vetHelp.petId) {
      await vetHelp.populate('pet', 'name species photos');
    }
    
    res.status(200).json(vetHelp);
  } catch (error) {
    console.error('Update vet help error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a vet help campaign
export const deleteVetHelp = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid vet help ID' });
    }
    
    // Find vet help campaign
    const vetHelp = await VetHelp.findById(id);
    if (!vetHelp) {
      return res.status(404).json({ message: 'Vet help campaign not found' });
    }
    
    // Check if user owns the campaign
    if (!vetHelp.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to delete this campaign' });
    }
    
    // Delete photos from Cloudinary if they exist
    if (vetHelp.photos && vetHelp.photos.length > 0) {
      for (const photoUrl of vetHelp.photos) {
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
    
    // Delete vet help campaign
    await VetHelp.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Vet help campaign deleted successfully' });
  } catch (error) {
    console.error('Delete vet help error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a Stripe checkout session for donation
export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, fundraiserId } = req.body;
    
    // Validate amount
    if (!amount || amount < 100) { // Minimum 1 USD/EUR/etc. (100 cents)
      return res.status(400).json({ message: 'Invalid amount. Minimum donation is 1.00' });
    }
    
    // Validate fundraiser ID if provided
    if (fundraiserId && !mongoose.Types.ObjectId.isValid(fundraiserId)) {
      return res.status(400).json({ message: 'Invalid fundraiser ID' });
    }
    
    // Find fundraiser if ID provided
    let fundraiser = null;
    if (fundraiserId) {
      fundraiser = await VetHelp.findById(fundraiserId);
      if (!fundraiser) {
        return res.status(404).json({ message: 'Fundraiser not found' });
      }
      
      // Check if fundraiser is active
      if (fundraiser.status !== 'active') {
        return res.status(400).json({ message: 'This fundraiser is no longer active' });
      }
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: fundraiser ? `Donation for ${fundraiser.title}` : 'YaoPets Donation',
              description: fundraiser ? fundraiser.description.substring(0, 100) : 'Thank you for your donation!',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?amount=${amount}&fundraiser=${fundraiserId || ''}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?cancelled=true`,
      metadata: {
        userId: req.userId,
        fundraiserId: fundraiserId || '',
      },
    });
    
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Handle Stripe webhook for successful payments
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Get metadata
    const { userId, fundraiserId } = session.metadata;
    
    // Process the donation
    if (userId && fundraiserId) {
      try {
        // Find the user
        const user = await User.findById(userId);
        
        // Find the fundraiser
        const fundraiser = await VetHelp.findById(fundraiserId);
        
        if (user && fundraiser) {
          // Add donation to fundraiser
          const amount = session.amount_total / 100; // Convert from cents
          
          fundraiser.donations.push({
            userId,
            amount,
            date: new Date(),
            message: ''
          });
          
          // Update current amount
          fundraiser.currentAmount += amount;
          
          // Check if target reached
          if (fundraiser.currentAmount >= fundraiser.targetAmount) {
            fundraiser.status = 'completed';
          }
          
          await fundraiser.save();
          
          // Award points to the user for donating
          user.points += Math.min(100, Math.floor(amount * 5)); // 5 points per dollar, max 100
          await user.save();
        }
      } catch (error) {
        console.error('Error processing donation:', error);
      }
    }
  }
  
  res.status(200).json({ received: true });
};

// Get donations for a vet help campaign
export const getVetHelpDonations = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid vet help ID' });
    }
    
    // Find vet help campaign
    const vetHelp = await VetHelp.findById(id);
    if (!vetHelp) {
      return res.status(404).json({ message: 'Vet help campaign not found' });
    }
    
    // Get donations with pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Sort donations by date (newest first)
    const sortedDonations = [...vetHelp.donations].sort((a, b) => b.date - a.date);
    
    // Get paginated donations
    const paginatedDonations = sortedDonations.slice(startIndex, endIndex);
    
    // Populate user data for each donation
    const populatedDonations = [];
    for (const donation of paginatedDonations) {
      const user = await User.findById(donation.userId).select('name username profileImage');
      populatedDonations.push({
        ...donation.toObject(),
        user: user ? user.toObject() : null
      });
    }
    
    res.status(200).json({
      donations: populatedDonations,
      pagination: {
        page,
        limit,
        total: vetHelp.donations.length,
        pages: Math.ceil(vetHelp.donations.length / limit)
      }
    });
  } catch (error) {
    console.error('Get vet help donations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a payment intent for direct donation
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, fundraiserId } = req.body;
    
    // Validate amount
    if (!amount || amount < 100) { // Minimum 1 USD/EUR/etc. (100 cents)
      return res.status(400).json({ message: 'Invalid amount. Minimum donation is 1.00' });
    }
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: req.userId,
        fundraiserId: fundraiserId || '',
      },
    });
    
    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};