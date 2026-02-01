const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(jpeg|jpg|png|gif|mp4|mov|avi)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname));
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Create post
router.post('/', auth, upload.array('media', 5), async (req, res) => {
  try {
    const { content, tags } = req.body;
    const mediaFiles = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const tagArray = tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [];

    const post = new Post({
      author: req.user._id,
      content,
      media: mediaFiles,
      tags: tagArray
    });

    await post.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar fullName');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username avatar fullName')
      .populate('comments')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending posts
router.get('/trending', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username avatar fullName')
      .sort({ likesCount: -1, createdAt: -1 })
      .limit(10);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get posts by tag
router.get('/tag/:tag', async (req, res) => {
  try {
    const posts = await Post.find({ tags: req.params.tag.toLowerCase() })
      .populate('author', 'username avatar fullName')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar fullName')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username avatar fullName' }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      post.likesCount -= 1;
    } else {
      post.likes.push(req.user._id);
      post.likesCount += 1;

      // Create notification if not own post
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: post.author,
          type: 'like',
          from: req.user._id,
          post: post._id
        });
      }
    }

    await post.save();
    res.json({ liked: !isLiked, likesCount: post.likesCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
