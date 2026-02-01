import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`);
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <div className="container">
        <CreatePost onPostCreated={handlePostCreated} />
        <div className="posts-feed">
          {posts.length === 0 ? (
            <div className="empty-state">
              <p>No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
