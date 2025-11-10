# Render Deployment Fix Guide

## Issues Fixed

1. **Hardcoded localhost URLs** - App was trying to connect to `http://localhost:5000` in production
2. **Unsafe error handling** - `error.response.data.message` causing "Cannot read properties of undefined" errors
3. **Missing environment variable configuration**

## What Was Changed

### 1. Frontend Axios Configuration (`frontend/src/lib/axios.ts`)
```typescript
// Before
baseURL: "http://localhost:5000/api",

// After  
baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
```

### 2. Environment Variables
- Changed `REACT_APP_API_URL` → `VITE_API_URL` (Vite uses `VITE_` prefix)
- Updated `.env.local` with correct variable name

### 3. Error Handling in All Stores
```typescript
// Before (UNSAFE)
catch (error: any) {
  set({ error: error.response.data.message });
}

// After (SAFE)
catch (error: any) {
  set({ error: error.response?.data?.message || error.message });
}
```

## Render Deployment Steps

### Backend Deployment

1. **Create a Web Service on Render**
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start` or `node src/index.js`

2. **Add Environment Variables** (in Render dashboard):
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. **Copy your backend URL**: `https://your-backend-service.onrender.com`

### Frontend Deployment

1. **Create a Static Site on Render**
   - Connect your GitHub repository
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Add Environment Variables** (in Render dashboard):
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=https://your-backend-service.onrender.com/api
   ```
   
   ⚠️ **IMPORTANT**: Replace `your-backend-service.onrender.com` with your actual backend URL from step 1

### Additional Configuration

#### CORS Setup (Backend)
Make sure your backend allows requests from your frontend domain. In `backend/src/index.js`, verify CORS is configured:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
```

Add to backend environment variables:
```
FRONTEND_URL=https://your-frontend-site.onrender.com
```

## Testing

1. **Test locally first**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **After deployment**:
   - Open browser console (F12)
   - Check Network tab for API requests
   - Verify requests go to your Render backend URL (not localhost)
   - Check for CORS errors

## Common Issues

### Issue: Still seeing localhost requests
**Solution**: 
- Clear browser cache
- Do a hard refresh (Ctrl+Shift+R)
- Verify environment variable in Render dashboard
- Trigger a new deploy after adding env vars

### Issue: CORS errors
**Solution**:
- Add your frontend URL to backend CORS configuration
- Check CORS middleware in backend

### Issue: 401 Unauthorized
**Solution**:
- Verify Clerk keys are correct
- Check if API tokens are being sent properly
- Verify Clerk is configured for production domain

### Issue: 500 Server errors
**Solution**:
- Check Render logs for backend errors
- Verify MongoDB connection string
- Check all required environment variables are set

## Verification Checklist

- [ ] Backend deployed and running on Render
- [ ] Frontend deployed on Render
- [ ] All environment variables added to both services
- [ ] `VITE_API_URL` points to correct backend URL
- [ ] No localhost URLs in production build
- [ ] CORS configured correctly
- [ ] Clerk authentication working
- [ ] Database connected successfully

## Need Help?

Check Render logs:
- Backend: Click on your web service → Logs tab
- Frontend: Click on your static site → Logs tab

Look for error messages and verify:
1. Environment variables are loaded
2. API requests use correct URLs
3. No CORS errors
4. Authentication headers are present
