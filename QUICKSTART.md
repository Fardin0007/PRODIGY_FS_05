# Quick Start Guide

## Fast Setup (5 minutes)

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies  
cd client
npm install
cd ..
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Make sure it's running on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Get connection string
- Update `.env` file with your connection string

### 3. Create .env File

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### 4. Start the Application

**Option 1: Run Both Together**
```bash
npm run dev
```

**Option 2: Run Separately**

Terminal 1:
```bash
npm run server
```

Terminal 2:
```bash
cd client
npm start
```

### 5. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 6. Create Your First Account

1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form
4. Start posting!

## Troubleshooting

**MongoDB not connecting?**
- Check if MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and credentials

**Port already in use?**
- Change PORT in `.env` file
- Or kill process: `netstat -ano | findstr :5000` (Windows)

**Module not found errors?**
- Run `npm install` in both root and client directories
- Delete `node_modules` and reinstall if needed

## Features to Try

1. ✅ Register/Login
2. ✅ Create a post with image
3. ✅ Add tags to your post
4. ✅ Like and comment on posts
5. ✅ Follow other users
6. ✅ Check notifications
7. ✅ Explore trending posts
8. ✅ Search for users

Enjoy your social media platform! 🚀
