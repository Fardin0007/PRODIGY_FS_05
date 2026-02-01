const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  media: [{
    type: String, // URLs to uploaded images/videos
    default: []
  }],
  tags: [{
    type: String,
    default: []
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: []
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

postSchema.index({ createdAt: -1 });
postSchema.index({ likesCount: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
