import React, { useState, useRef } from 'react';
import axios from 'axios';
import './AvatarUploadModal.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AvatarUploadModal = ({ isOpen, onClose, onUploadSuccess, currentAvatar }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select an image file');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const res = await axios.put(`${API_URL}/users/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUploadSuccess(res.data.avatar);
      handleClose();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="avatar-modal-overlay" onClick={handleClose}>
      <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-modal-header">
          <h2>Change Profile Photo</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="avatar-modal-body">
          {!preview ? (
            <div
              className="avatar-upload-area"
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <p className="upload-text">Drag and drop an image here, or click to select</p>
              <p className="upload-hint">JPG, PNG or GIF (max 5MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="avatar-preview-container">
              <div className="avatar-preview-wrapper">
                <img src={preview} alt="Preview" className="avatar-preview" />
                <div className="avatar-preview-overlay">
                  <button
                    className="preview-btn change-btn"
                    onClick={() => {
                      setPreview(null);
                      setSelectedFile(null);
                      fileInputRef.current.value = '';
                    }}
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="avatar-modal-footer">
          <button className="btn-cancel" onClick={handleClose} disabled={uploading}>
            Cancel
          </button>
          {preview && (
            <button
              className="btn-upload"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUploadModal;
