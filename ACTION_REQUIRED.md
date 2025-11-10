# 🎯 IMMEDIATE ACTION REQUIRED - Render Dashboard

## The Problem
Your Render frontend is trying to connect to `localhost:5000` which gets blocked by Chrome/Brave ad blockers.

## The Fix (Do This Right Now!)

### Step 1: Go to Render Dashboard
1. Log in to [render.com](https://render.com)
2. Find your **Frontend Static Site** (not the backend)

### Step 2: Add Environment Variables
Click on "Environment" tab and add these TWO variables:

```
VITE_API_URL
Value: https://YOUR-BACKEND-NAME.onrender.com/api
```

```
VITE_CLERK_PUBLISHABLE_KEY  
Value: pk_test_dG91Y2hpbmctY29sdC04Ni5jbGVyay5hY2NvdW50cy5kZXYk
```

**⚠️ IMPORTANT**: Replace `YOUR-BACKEND-NAME` with your actual backend service URL!

### Step 3: Find Your Backend URL
If you don't know your backend URL:
1. Go to your Backend Web Service in Render
2. Look at the top - you'll see something like: `https://music-chat-abc123.onrender.com`
3. Copy that URL and add `/api` to the end
4. Use it for `VITE_API_URL`

### Step 4: Trigger Manual Deploy
1. Go to "Manual Deploy" → "Deploy latest commit"
2. OR wait for auto-deploy to trigger
3. Watch the build logs

### Step 5: Test
1. Once deployed, open your site in Chrome/Brave
2. Press F12 → Network tab
3. Refresh the page
4. Check that requests go to `your-backend.onrender.com` (NOT localhost)
5. Should work now! 🎉

---

## Why This Works

**Before (Broken):**
- Frontend code: `baseURL: "http://localhost:5000/api"`
- Chrome sees "localhost:5000" → Blocks it → `ERR_BLOCKED_BY_CLIENT`

**After (Fixed):**
- Render injects: `VITE_API_URL=https://your-backend.onrender.com/api`
- Frontend code: `baseURL: import.meta.env.VITE_API_URL`
- Chrome sees real URL → Allows it → Works! ✅

---

## What I Changed in Your Code

1. ✅ Updated `axios.ts` to use environment variables
2. ✅ Fixed error handling in all stores (safe optional chaining)
3. ✅ Updated `.env.local` for local development
4. ✅ Cleared `.env.production` (Render will inject values)
5. ✅ Added `.env.production` to `.gitignore`

**Your code is now ready - you just need to set the environment variables in Render!**

---

## Quick Verification

After deploying, check if it worked:

```bash
# In browser console on your deployed site:
import.meta.env.VITE_API_URL

# Should show: "https://your-backend.onrender.com/api"
# NOT: "http://localhost:5000/api"
```

---

See `RENDER_SETUP_COMPLETE.md` for full detailed guide.
