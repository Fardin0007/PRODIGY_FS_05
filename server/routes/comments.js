const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// Create comment
router.post('/', auth, async (req, res) => {
  try {
    const { postId, content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content
    });

    await comment.save();
    post.comments.push(comment._id);
    post.commentsCount += 1;
    await post.save();

    // Create notification if not own post
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: post.author,
        type: 'comment',
        from: req.user._id,
        post: post._id,
        comment: comment._id
      });
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar fullName');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username avatar fullName')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const post = await Post.findById(comment.post);
    post.comments = post.comments.filter(id => id.toString() !== comment._id.toString());
    post.commentsCount -= 1;
    await post.save();

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
