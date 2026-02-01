import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './PostDetail.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/${id}`);
      setPost(res.data);
      setLiked(res.data.likes?.includes(user?.id) || false);
      setLikesCount(res.data.likesCount || 0);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/comments/post/${id}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`${API_URL}/posts/${id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/comments`, {
        postId: id,
        content: commentText
      });
      setComments([res.data, ...comments]);
      setCommentText('');
      fetchPost();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!post) {
    return <div className="error">Post not found</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="container">
        <div className="card post-detail">
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
              {new Date(post.createdAt).toLocaleString()}
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
            <span className="action-btn">💬 {comments.length}</span>
          </div>
        </div>

        <div className="card comments-section">
          <h3>Comments</h3>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn btn-primary">
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
                    <div>
                      <strong>{comment.author?.username}</strong>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
