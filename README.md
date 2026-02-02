# 🎵 dcXspotify - Music Streaming & Chat Platform

A full-stack Spotify-inspired music streaming application with real-time chat functionality, built with React, Node.js, and MongoDB. Users can stream music, create playlists, chat with friends, and admins can manage songs and albums.

## ✨ Features

- 🎵 **Music Streaming**: Browse and play songs from various albums
- 💬 **Real-time Chat**: Chat with other users while listening to music
- 👤 **User Authentication**: Secure authentication powered by Clerk
- 🎨 **Beautiful UI**: Modern, responsive interface built with React and Tailwind CSS
- 👑 **Admin Dashboard**: Manage songs, albums, and platform statistics
- 📊 **Statistics**: Track user engagement and platform metrics
- 🎧 **Music Player**: Full-featured audio player with playlist support
- 🖼️ **Media Management**: Upload and manage album artwork with Cloudinary
- ⚡ **Real-time Updates**: Socket.io for live chat and notifications

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Clerk React** - Authentication
- **Radix UI** - UI components
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **Clerk Express** - Authentication middleware
- **Cloudinary** - Media storage
- **Node-cron** - Scheduled tasks

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

You'll also need accounts for:
- [Clerk](https://clerk.dev/) - For authentication
- [Cloudinary](https://cloudinary.com/) - For media storage
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For database (if not using local MongoDB)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhilash-0322/dcXspotify.git
   cd dcXspotify
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

## ⚙️ Configuration

### Backend Configuration

1. Navigate to the `backend` directory and create a `.env` file:
   ```bash
   cd backend
   ```

2. Add the following environment variables to `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

### Frontend Configuration

1. Navigate to the `frontend` directory and create a `.env.local` file:
   ```bash
   cd frontend
   ```

2. Add the following environment variables to `.env.local`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

## 🎬 Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`

### Production Build

1. **Build the application**
   ```bash
   # From root directory
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🌱 Seeding Data

To populate your database with sample songs and albums:

```bash
cd backend

# Seed songs
npm run seed:songs

# Seed albums
npm run seed:albums
```

## 🌐 Deployment

This project is configured for deployment on [Render](https://render.com/). See the deployment documentation files for detailed instructions:

- `RENDER_SETUP_COMPLETE.md` - Complete deployment guide
- `ACTION_REQUIRED.md` - Quick deployment checklist
- `RENDER_DEPLOYMENT_FIX.md` - Troubleshooting common deployment issues
- `AD_BLOCKER_FIX.md` - Fixing ad blocker issues with localhost

### Quick Deployment Steps

1. **Backend (Web Service)**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `backend`
   - Add all environment variables from backend `.env`

2. **Frontend (Static Site)**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Root Directory: `frontend`
   - Environment Variables:
     - `VITE_API_URL`: Your backend URL + `/api`
     - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key

## 📁 Project Structure

```
dcXspotify/
├── backend/                 # Backend Node.js application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── lib/           # Utility libraries (DB, Socket.io, Cloudinary)
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── seeds/         # Database seeders
│   │   └── index.js       # Entry point
│   └── package.json
│
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── assets/        # Static assets
│   │   ├── components/    # React components
│   │   ├── layout/        # Layout components
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Page components
│   │   ├── providers/     # Context providers
│   │   ├── stores/        # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Public assets
│   └── package.json
│
└── package.json           # Root package.json with build scripts
```

## 📜 Available Scripts

### Root Directory
- `npm run build` - Build both frontend and backend
- `npm start` - Start the production server

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run seed:songs` - Seed database with sample songs
- `npm run seed:albums` - Seed database with sample albums

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🎯 Key Features Explained

### Authentication
Uses Clerk for secure user authentication with support for multiple sign-in methods.

### Music Streaming
- Browse albums and songs
- Play/pause/skip tracks
- Volume control
- Playlist management

### Real-time Chat
- WebSocket-based chat using Socket.io
- See who's online
- Send and receive messages instantly

### Admin Dashboard
- Upload new songs and albums
- Manage existing content
- View platform statistics
- User management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Design inspired by Spotify
- Built with modern web technologies
- Thanks to all contributors and the open-source community

## 📧 Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

---

**Happy Streaming! 🎵**
