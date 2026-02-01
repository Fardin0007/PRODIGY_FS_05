# Social Media Platform - Task 5

A complete full-stack social media application built with React, Node.js, Express, and MongoDB.

## Features

### Core Features ✅
- **User Authentication**: Register and login with JWT tokens
- **User Profiles**: Create and customize profiles with avatar, bio, and personal information
- **Create Posts**: Share text posts with image/video uploads (up to 5 files)
- **Post Tagging**: Add tags to posts for better discoverability
- **Like Posts**: Like and unlike posts with real-time like counts
- **Comments**: Comment on posts with full comment thread support
- **Intuitive UI**: Modern, responsive design with smooth interactions

### Optional Features ✅
- **Follow System**: Follow and unfollow other users
- **Notifications**: Real-time notifications for likes, comments, and follows
- **Trending Content**: Explore trending posts based on likes
- **User Search**: Search for users by username or name
- **Tag Exploration**: Browse posts by tags

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** for styling

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

#### Option 1: Run Both Server and Client Together
```bash
npm run dev
```

#### Option 2: Run Separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000


## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Profile**: Customize your profile with avatar and bio
3. **Create Posts**: Share posts with text, images, or videos
4. **Add Tags**: Use tags to categorize your posts (e.g., #tech, #coding)
5. **Interact**: Like and comment on posts from other users
6. **Follow Users**: Follow interesting users to see their content
7. **Explore**: Browse trending posts and search for users
8. **Notifications**: Get notified about likes, comments, and follows

## Features in Detail

### Post Creation
- Text content (up to 2000 characters)
- Multiple media files (images/videos, max 5 files, 10MB each)
- Tags (comma-separated)
- Real-time preview

### Notifications
- Real-time notification badge in navbar
- Notifications for:
  - Post likes
  - Post comments
  - New followers
- Mark as read functionality

### Trending Algorithm
- Posts sorted by like count and recency
- Top 10 trending posts displayed

## Development Notes

- The `uploads` folder is created automatically for storing media files
- JWT tokens expire after 7 days
- File uploads are limited to 10MB per file
- Maximum 5 files per post
- All routes except auth require authentication

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or check your MongoDB Atlas connection string
- Verify the `MONGODB_URI` in your `.env` file

### Port Already in Use
- Change the `PORT` in `.env` file
- Or kill the process using the port

### File Upload Issues
- Ensure the `uploads` directory has write permissions
- Check file size limits (10MB per file)

## License

This project is created for internship Task 5.

## Author

Built as part of internship assignment.
