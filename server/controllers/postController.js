import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Interaction from '../models/Interaction.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { content, location, visibilityType, postType, isStory } = req.body;
    
    // Create post object
    const post = new Post({
      userId: req.userId,
      content,
      location: location,
      visibilityType: visibilityType || 'public',
      postType: postType || 'regular',
      isStory: isStory === 'true' || isStory === true
    });
    
    // Handle media files
    if (req.files && req.files.length > 0) {
      post.mediaUrls = req.files.map(file => file.path);
      
      // Determine media type based on first file
      const fileType = req.files[0].mimetype;
      if (fileType.startsWith('video/')) {
        post.mediaType = 'video';
      } else if (fileType === 'image/gif') {
        post.mediaType = 'gif';
      } else {
        post.mediaType = 'image';
      }
    }
    
    // Set expiration for stories
    if (post.isStory) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);
      post.expiresAt = expirationDate;
    }
    
    await post.save();
    
    // Populate user data
    await post.populate('user', 'name username profileImage');
    
    // Award points to the user for creating content
    const user = await User.findById(req.userId);
    if (user) {
      user.points += 10; // 10 points for creating a post
      await user.save();
    }
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all posts (feed)
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Base query - public posts that aren't stories or unexpired stories
    const query = {
      $or: [
        { visibilityType: 'public', isStory: false },
        { 
          visibilityType: 'public', 
          isStory: true, 
          expiresAt: { $gt: new Date() } 
        }
      ]
    };
    
    // If user is authenticated, also include their private posts and posts from followed users
    if (req.userId) {
      // Get IDs of users the current user follows
      const followedUsers = await Interaction.find({
        userId: req.userId,
        targetType: 'user',
        type: 'follow'
      }).select('targetId');
      
      const followedUserIds = followedUsers.map(interaction => interaction.targetId);
      
      // Add conditions for private posts and followed users
      query.$or.push(
        { userId: req.userId }, // User's own posts
        { 
          visibilityType: 'followers', 
          userId: { $in: followedUserIds } 
        } // Posts from followed users
      );
    }
    
    // Find posts
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Post.countDocuments(query);
    
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
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find post
    const post = await Post.findById(id)
      .populate('user', 'name username profileImage');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check visibility permissions
    if (post.visibilityType === 'private' && !post.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to view this post' });
    }
    
    if (post.visibilityType === 'followers' && req.userId) {
      // Check if user follows the post creator
      const isFollowing = await Interaction.findOne({
        userId: req.userId,
        targetId: post.userId,
        targetType: 'user',
        type: 'follow'
      });
      
      if (!isFollowing && !post.userId.equals(req.userId)) {
        return res.status(403).json({ message: 'You do not have permission to view this post' });
      }
    }
    
    // Add isLiked and isSaved flags if user is authenticated
    let enhancedPost = post;
    if (req.userId) {
      const interactions = await Interaction.find({
        userId: req.userId,
        targetType: 'post',
        targetId: post._id
      });
      
      const postObj = post.toObject();
      postObj.isLiked = interactions.some(i => i.type === 'like');
      postObj.isSaved = interactions.some(i => i.type === 'save');
      enhancedPost = postObj;
    }
    
    res.status(200).json(enhancedPost);
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, location, visibilityType } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    if (!post.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to update this post' });
    }
    
    // Update fields if provided
    if (content !== undefined) post.content = content;
    if (location) post.location = JSON.parse(location);
    if (visibilityType) post.visibilityType = visibilityType;
    
    await post.save();
    
    // Populate user data
    await post.populate('user', 'name username profileImage');
    
    res.status(200).json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    if (!post.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to delete this post' });
    }
    
    // Delete media from Cloudinary if exists
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      for (const mediaUrl of post.mediaUrls) {
        if (mediaUrl.includes('cloudinary')) {
          try {
            const publicId = mediaUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error('Error deleting media from Cloudinary:', cloudinaryError);
            // Continue with deletion even if Cloudinary fails
          }
        }
      }
    }
    
    // Delete post
    await Post.findByIdAndDelete(id);
    
    // Delete associated comments
    await Comment.deleteMany({ postId: id });
    
    // Delete associated interactions
    await Interaction.deleteMany({
      targetId: id,
      targetType: 'post'
    });
    
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("like post ID:", id);
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already liked
    const existingLike = await Interaction.findOne({
      userId: req.userId,
      targetId: id,
      targetType: 'post',
      type: 'like'
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'Post already liked' });
    }
    
    // Create like interaction
    const likeInteraction = new Interaction({
      userId: req.userId,
      targetId: id,
      targetType: 'post',
      type: 'like'
    });
    
    await likeInteraction.save();
    
    // Increment post likes count
    post.likesCount += 1;
    await post.save();
    
    // Award points to the user for engagement
    const user = await User.findById(req.userId);
    if (user) {
      user.points += 1; // 1 point for liking a post
      await user.save();
    }
    
    res.status(200).json({ 
      message: 'Post liked successfully',
      likesCount: post.likesCount
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Unlike post ID:", id);
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Delete like interaction
    const result = await Interaction.findOneAndDelete({
      userId: req.userId,
      targetId: id,
      targetType: 'post',
      type: 'like'
    });
    
    if (!result) {
      return res.status(400).json({ message: 'Post not liked' });
    }
    
    // Decrement post likes count
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();
    
    res.status(200).json({ 
      message: 'Post unliked successfully',
      likesCount: post.likesCount
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save a post
export const savePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if already saved
    const existingSave = await Interaction.findOne({
      userId: req.userId,
      targetId: id,
      targetType: 'post',
      type: 'save'
    });
    
    if (existingSave) {
      return res.status(400).json({ message: 'Post already saved' });
    }
    
    // Create save interaction
    const saveInteraction = new Interaction({
      userId: req.userId,
      targetId: id,
      targetType: 'post',
      type: 'save'
    });
    
    await saveInteraction.save();
    
    res.status(200).json({ message: 'Post saved successfully' });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unsave a post
export const unsavePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Delete save interaction
    const result = await Interaction.findOneAndDelete({
      userId: req.userId,
      targetId: id,
      targetType: 'post',
      type: 'save'
    });
    
    if (!result) {
      return res.status(400).json({ message: 'Post not saved' });
    }
    
    res.status(200).json({ message: 'Post unsaved successfully' });
  } catch (error) {
    console.error('Unsave post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a comment to a post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Create comment
    const comment = new Comment({
      userId: req.userId,
      postId: id,
      content,
      parentId: parentId || null
    });
    
    await comment.save();
    
    // Increment post comments count
    post.commentsCount += 1;
    await post.save();
    
    // Populate user data
    await comment.populate('user', 'name username profileImage');
    
    // Award points to the user for engagement
    const user = await User.findById(req.userId);
    if (user) {
      user.points += 3; // 3 points for commenting
      await user.save();
    }
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comments for a post
export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    // Find comments
    const comments = await Comment.find({ postId: id, parentId: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username profileImage');
    
    // Get total count for pagination
    const total = await Comment.countDocuments({ postId: id, parentId: null });
    
    // Add isLiked flag if user is authenticated
    let enhancedComments = comments;
    if (req.userId) {
      const interactions = await Interaction.find({
        userId: req.userId,
        targetType: 'comment',
        targetId: { $in: comments.map(comment => comment._id) }
      });
      
      enhancedComments = comments.map(comment => {
        const commentObj = comment.toObject();
        commentObj.isLiked = interactions.some(i => 
          i.targetId.equals(comment._id) && i.type === 'like'
        );
        return commentObj;
      });
    }
    
    res.status(200).json({
      comments: enhancedComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    
    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if already liked
    const existingLike = await Interaction.findOne({
      userId: req.userId,
      targetId: id,
      targetType: 'comment',
      type: 'like'
    });
    
    if (existingLike) {
      return res.status(400).json({ message: 'Comment already liked' });
    }
    
    // Create like interaction
    const likeInteraction = new Interaction({
      userId: req.userId,
      targetId: id,
      targetType: 'comment',
      type: 'like'
    });
    
    await likeInteraction.save();
    
    // Increment comment likes count
    comment.likesCount += 1;
    await comment.save();
    
    res.status(200).json({ 
      message: 'Comment liked successfully',
      likesCount: comment.likesCount
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unlike a comment
export const unlikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    
    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Delete like interaction
    const result = await Interaction.findOneAndDelete({
      userId: req.userId,
      targetId: id,
      targetType: 'comment',
      type: 'like'
    });
    
    if (!result) {
      return res.status(400).json({ message: 'Comment not liked' });
    }
    
    // Decrement comment likes count
    comment.likesCount = Math.max(0, comment.likesCount - 1);
    await comment.save();
    
    res.status(200).json({ 
      message: 'Comment unliked successfully',
      likesCount: comment.likesCount
    });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }
    
    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user owns the comment
    if (!comment.userId.equals(req.userId)) {
      return res.status(403).json({ message: 'You do not have permission to delete this comment' });
    }
    
    // Find post to update comment count
    const post = await Post.findById(comment.postId);
    
    // Delete comment
    await Comment.findByIdAndDelete(id);
    
    // Delete child comments if any
    await Comment.deleteMany({ parentId: id });
    
    // Delete associated interactions
    await Interaction.deleteMany({
      targetId: id,
      targetType: 'comment'
    });
    
    // Update post comment count if post exists
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
      await post.save();
    }
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};