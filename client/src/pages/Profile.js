import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import AvatarUploadModal from '../components/AvatarUploadModal';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, fetchUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', bio: '', avatar: '' });
  const [error, setError] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_URL}/users/${id}`);
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setIsFollowing(
        res.data.user.followers?.some(
          (follower) => (follower._id || follower.id) === (currentUser?.id || currentUser?._id)
        ) || false
      );
      setEditData({
        fullName: res.data.user.fullName || '',
        bio: res.data.user.bio || '',
        avatar: res.data.user.avatar || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 404) {
        setError('User not found');
      } else if (error.response?.status === 400) {
        setError('Invalid user ID');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await axios.post(`${API_URL}/users/${id}/follow`);
      setIsFollowing(res.data.following);
      fetchProfile();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/users/${id}`, editData);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarUploadSuccess = async (newAvatar) => {
    setProfile({ ...profile, avatar: newAvatar });
    // Refresh profile to get updated data
    await fetchProfile();
    // Refresh user context if it's own profile
    if (currentUser && (currentUser.id || currentUser._id) === id && fetchUser) {
      await fetchUser();
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error || !profile) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Error</h2>
          <p style={{ color: '#6b7280' }}>{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = (currentUser?.id || currentUser?._id) === id;

  return (
    <div className="profile-container">
      <div className="container">
        <div className="profile-header card">
          <div className="profile-info">
            <div className="profile-avatar-wrapper">
              <img
                src={profile.avatar ? `${BASE_URL}${profile.avatar}` : 'https://via.placeholder.com/120'}
                alt={profile.username}
                className="profile-avatar"
              />
              {isOwnProfile && (
                <div 
                  className="avatar-overlay"
                  onClick={() => setShowAvatarModal(true)}
                  title="Change profile photo"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                  <span>Change Photo</span>
                </div>
              )}
            </div>
            <div className="profile-details">
              <h1>{profile.fullName || profile.username}</h1>
              <p className="username">@{profile.username}</p>
              {profile.bio && <p className="bio">{profile.bio}</p>}
              <div className="profile-stats">
                <div>
                  <strong>{posts.length}</strong> Posts
                </div>
                <div>
                  <strong>{profile.followers?.length || 0}</strong> Followers
                </div>
                <div>
                  <strong>{profile.following?.length || 0}</strong> Following
                </div>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            {isOwnProfile ? (
              <button
                onClick={() => (editing ? handleSave() : setEditing(true))}
                className="btn btn-primary"
              >
                {editing ? 'Save' : 'Edit Profile'}
              </button>
            ) : (
              <button onClick={handleFollow} className="btn btn-primary">
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {editing && (
          <div className="card edit-profile">
            <h3>Edit Profile</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={editData.fullName}
              onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
              className="input"
            />
            <textarea
              placeholder="Bio"
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="textarea"
            />
            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="btn btn-secondary"
              style={{ marginBottom: '10px' }}
            >
              Change Profile Photo
            </button>
            <button onClick={() => setEditing(false)} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        )}

        <div className="profile-posts">
          <h2>Posts</h2>
          {posts.length === 0 ? (
            <div className="empty-state">
              <p>No posts yet</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={fetchProfile} />
            ))
          )}
        </div>

        <AvatarUploadModal
          isOpen={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          onUploadSuccess={handleAvatarUploadSuccess}
          currentAvatar={profile.avatar}
        />
      </div>
    </div>
  );
};

export default Profile;
