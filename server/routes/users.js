const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(jpeg|jpg|png|gif)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = file.mimetype.startsWith('image/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    // Check if ID is valid MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .populate('author', 'username avatar fullName')
      .sort({ createdAt: -1 });

    // Convert user _id to id for consistency
    const userObj = user.toObject();
    userObj.id = userObj._id.toString();

    res.json({ user: userObj, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload avatar
router.put('/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    
    // Delete old avatar if exists
    if (user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    const userObj = user.toObject();
    userObj.id = userObj._id.toString();

    res.json({ avatar: avatarPath, user: userObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { fullName, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, bio, avatar },
      { new: true }
    ).select('-password');

    const userObj = user.toObject();
    userObj.id = userObj._id.toString();

    res.json(userObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== targetUser._id.toString()
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ following: !isFollowing });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    }).select('username fullName avatar bio').limit(10);

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
