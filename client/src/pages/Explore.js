import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import './Explore.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      fetchPostsByTag(tag);
      setActiveTab('tagged');
    } else {
      fetchTrendingPosts();
    }
  }, [searchParams]);

  const fetchTrendingPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/trending`);
      setTrendingPosts(res.data);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  const fetchPostsByTag = async (tag) => {
    try {
      const res = await axios.get(`${API_URL}/posts/tag/${tag}`);
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts by tag:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/users/search/${searchQuery}`);
      setUsers(res.data);
      setActiveTab('users');
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <div className="explore-container">
      <div className="container">
        <h1>Explore</h1>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'trending' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('trending');
              fetchTrendingPosts();
            }}
          >
            Trending
          </button>
          {searchParams.get('tag') && (
            <button
              className={`tab ${activeTab === 'tagged' ? 'active' : ''}`}
              onClick={() => setActiveTab('tagged')}
            >
              Tag: #{searchParams.get('tag')}
            </button>
          )}
          {users.length > 0 && (
            <button
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
          )}
        </div>

        {activeTab === 'trending' && (
          <div className="posts-list">
            {trendingPosts.length === 0 ? (
              <div className="empty-state">No trending posts</div>
            ) : (
              trendingPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-state">No posts with this tag</div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-list">
            {users.length === 0 ? (
              <div className="empty-state">No users found</div>
            ) : (
              users.map((user) => (
                <Link
                  key={user._id || user.id}
                  to={`/profile/${user._id || user.id}`}
                  className="user-card card"
                >
                  <img
                    src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : 'https://via.placeholder.com/60'}
                    alt={user.username}
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <h3>{user.fullName || user.username}</h3>
                    <p>@{user.username}</p>
                    {user.bio && <p className="user-bio">{user.bio}</p>}
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
