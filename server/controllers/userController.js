import User from '../models/User.js';
import Post from '../models/Post.js';
import Pet from '../models/Pet.js';
import Interaction from '../models/Interaction.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Get user profile by ID
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get follower and following counts
    const followerCount = await Interaction.countDocuments({
      targetId: user._id,
      targetType: 'user',
      type: 'follow'
    });
    
    const followingCount = await Interaction.countDocuments({
      userId: user._id,
      targetType: 'user',
      type: 'follow'
    });
    
    // Check if the requesting user is following this user
    let isFollowing = false;
    if (req.userId) {
      isFollowing = await Interaction.exists({
        userId: req.userId,
        targetId: user._id,
        targetType: 'user',
        type: 'follow'
      });
    }
    
    // Get user profile with counts
    const userProfile = {
      ...user.getProfile(),
      followerCount,
      followingCount,
      isFollowing: !!isFollowing
    };
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, username, city, bio, website, userType } = req.body;
    
    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      user.username = username;
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (city) user.city = city;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (userType) user.userType = userType;
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.status(200).json(user.getProfile());
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile image
export const updateProfileImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Find user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user already has a profile image, delete it from Cloudinary
    if (user.profileImage && user.profileImage.includes('cloudinary')) {
      try {
        const publicId = user.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Error deleting old profile image:', cloudinaryError);
        // Continue with the update even if deletion fails
      }
    }
    
    // Update profile image
    user.profileImage = req.file.path;
    user.updatedAt = Date.now();
    await user.save();
    
    res.status(200).json({ 
      message: 'Profile image updated successfully',
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user posts
export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Find posts by user ID
    const posts = await Post.find({ userId: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Post.countDocuments({ userId: id });
    
    // Add isLiked and isSaved flags if user is authenticated
    let enhancedPosts = posts;
    if (req.userId) {
      const interactions = await Interaction.find({
        userId: req.userId,
        targetType: 'post',
        targetId: { $in: posts.map(post => post._id) }
      });
      
      enhancedPosts = posts.map(post => {
        const postObj = post.toObject();
        postObj.isLiked = interactions.some(i => 
          i.targetId.equals(post._id) && i.type === 'like'
        );
        postObj.isSaved = interactions.some(i => 
          i.targetId.equals(post._id) && i.type === 'save'
        );
        return postObj;
      });
    }
    
    res.status(200).json({
      posts: enhancedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user pets
export const getUserPets = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Find pets by user ID
    const pets = await Pet.find({ userId: id })
      .sort({ createdAt: -1 })
      .populate('user', 'name username profileImage');
    
    res.status(200).json(pets);
  } catch (error) {
    console.error('Get user pets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user saved posts
export const getUserSavedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Find saved post interactions
    const savedInteractions = await Interaction.find({
      userId: req.userId,
      type: 'save',
      targetType: 'post'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get the post IDs
    const postIds = savedInteractions.map(interaction => interaction.targetId);
    
    // Find the posts
    const posts = await Post.find({
      _id: { $in: postIds }
    }).populate('user', 'name username profileImage');
    
    // Sort posts to match the order of interactions
    const orderedPosts = postIds.map(id => 
      posts.find(post => post._id.equals(id))
    ).filter(Boolean);
    
    // Get total count for pagination
    const total = await Interaction.countDocuments({
      userId: req.userId,
      type: 'save',
      targetType: 'post'
    });
    
    res.status(200).json({
      posts: orderedPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user saved posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Follow user
export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if user exists
    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is trying to follow themselves
    if (req.userId === id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    // Check if already following
    const alreadyFollowing = await Interaction.findOne({
      userId: req.userId,
      targetId: id,
      targetType: 'user',
      type: 'follow'
    });
    
    if (alreadyFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Create follow interaction
    const followInteraction = new Interaction({
      userId: req.userId,
      targetId: id,
      targetType: 'user',
      type: 'follow'
    });
    
    await followInteraction.save();
    
    // Award points to the user for social activity
    const user = await User.findById(req.userId);
    if (user) {
      user.points += 2; // 2 points for following someone
      await user.save();
    }
    
    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Delete follow interaction
    const result = await Interaction.findOneAndDelete({
      userId: req.userId,
      targetId: id,
      targetType: 'user',
      type: 'follow'
    });
    
    if (!result) {
      return res.status(400).json({ message: 'Not following this user' });
    }
    
    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user followers
export const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Find follow interactions
    const followInteractions = await Interaction.find({
      targetId: id,
      targetType: 'user',
      type: 'follow'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get follower IDs
    const followerIds = followInteractions.map(interaction => interaction.userId);
    
    // Find followers
    const followers = await User.find({
      _id: { $in: followerIds }
    }).select('name username profileImage city bio');
    
    // Sort followers to match the order of interactions
    const orderedFollowers = followerIds.map(id => 
      followers.find(user => user._id.equals(id))
    ).filter(Boolean);
    
    // Get total count for pagination
    const total = await Interaction.countDocuments({
      targetId: id,
      targetType: 'user',
      type: 'follow'
    });
    
    res.status(200).json({
      followers: orderedFollowers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user followers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user following
export const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Find follow interactions
    const followInteractions = await Interaction.find({
      userId: id,
      targetType: 'user',
      type: 'follow'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get following IDs
    const followingIds = followInteractions.map(interaction => interaction.targetId);
    
    // Find following users
    const following = await User.find({
      _id: { $in: followingIds }
    }).select('name username profileImage city bio');
    
    // Sort following to match the order of interactions
    const orderedFollowing = followingIds.map(id => 
      following.find(user => user._id.equals(id))
    ).filter(Boolean);
    
    // Get total count for pagination
    const total = await Interaction.countDocuments({
      userId: id,
      targetType: 'user',
      type: 'follow'
    });
    
    res.status(200).json({
      following: orderedFollowing,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user following error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};