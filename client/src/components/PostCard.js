import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './PostCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PostCard = ({ post, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const [liked, setLiked] = useState(
    post.likes?.some(likeId => 
      likeId === (user?.id || user?._id) || 
      (typeof likeId === 'object' && (likeId._id || likeId.id) === (user?.id || user?._id))
    ) || false
  );
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      const res = await axios.post(`${API_URL}/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments/post/${post._id}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/comments`, {
        postId: post._id,
        content: commentText
      });
      setComments([res.data, ...comments]);
      setCommentText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  return (
    <div className="card post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author?._id || post.author?.id || post.author}`} className="post-author">
          <img
            src={post.author?.avatar ? (post.author.avatar.startsWith('http') ? post.author.avatar : `http://localhost:5000${post.author.avatar}`) : 'https://via.placeholder.com/40'}
            alt={post.author?.username}
            className="avatar"
          />
          <div>
            <div className="author-name">{post.author?.fullName || post.author?.username}</div>
            <div className="author-username">@{post.author?.username}</div>
          </div>
        </Link>
        <div className="post-time">
          {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((tag, index) => (
              <Link key={index} to={`/explore?tag=${tag}`} className="tag">
                #{tag}
              </Link>
            ))}
          </div>
        )}
        {post.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((url, index) => {
              const isVideo = url.match(/\.(mp4|mov|avi)$/i);
              return (
                <div key={index} className="media-item">
                  {isVideo ? (
                    <video src={`http://localhost:5000${url}`} controls className="media" />
                  ) : (
                    <img src={`http://localhost:5000${url}`} alt={`Post media ${index + 1}`} className="media" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`action-btn ${liked ? 'liked' : ''}`}
        >
          ❤️ {likesCount}
        </button>
        <button onClick={toggleComments} className="action-btn">
          💬 {post.commentsCount || 0}
        </button>
        <Link to={`/post/${post._id}`} className="action-btn">
          🔗 View
        </Link>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Comment
            </button>
          </form>
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-author">
                    <img
                      src={comment.author?.avatar ? (comment.author.avatar.startsWith('http') ? comment.author.avatar : `http://localhost:5000${comment.author.avatar}`) : 'https://via.placeholder.com/30'}
                      alt={comment.author?.username}
                      className="comment-avatar"
                    />
                    <strong>{comment.author?.username}</strong>
                  </div>
                  <p>{comment.content}</p>
                  <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
