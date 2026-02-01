import React, { useState } from 'react';
import axios from 'axios';
import './CreatePost.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 files allowed');
      return;
    }
    setMedia(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) {
      alert('Please add some content or media');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('tags', tags);
      media.forEach((file) => {
        formData.append('media', file);
      });

      const res = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setContent('');
      setTags('');
      setMedia([]);
      document.getElementById('media-input').value = '';
      onPostCreated(res.data);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card create-post">
      <h3>Create Post</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea"
        />
        <input
          type="text"
          placeholder="Tags (comma separated, e.g., tech, coding, fun)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="input"
        />
        <div className="file-upload">
          <label htmlFor="media-input" className="file-label">
            📷 Add Photos/Videos (max 5)
          </label>
          <input
            id="media-input"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="file-input"
          />
          {media.length > 0 && (
            <div className="selected-files">
              {media.map((file, index) => (
                <span key={index} className="file-name">
                  {file.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
