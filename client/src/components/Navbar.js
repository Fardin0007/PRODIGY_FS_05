import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './Navbar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchNotifications();
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchNotifications();
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications/unread/count`);
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Social Media
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/explore" className="nav-link">Explore</Link>
          <Link to={`/profile/${user.id || user._id}`} className="nav-link">Profile</Link>
          <div className="notifications-dropdown">
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notifications-panel">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <button
                    onClick={async () => {
                      await axios.put(`${API_URL}/notifications/read-all`);
                      fetchUnreadCount();
                      fetchNotifications();
                    }}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`notification-item ${!notif.read ? 'unread' : ''}`}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif._id);
                          if (notif.post) navigate(`/post/${notif.post._id || notif.post}`);
                        }}
                      >
                        <div className="notification-content">
                          <strong>{notif.from?.username}</strong>{' '}
                          {notif.type === 'like' && 'liked your post'}
                          {notif.type === 'comment' && 'commented on your post'}
                          {notif.type === 'follow' && 'started following you'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
