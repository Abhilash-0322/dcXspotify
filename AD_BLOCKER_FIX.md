# Chrome/Brave Ad Blocker Fix - Quick Guide

## The Problem

You're seeing `net::ERR_BLOCKED_BY_CLIENT` errors in Chrome/Brave but NOT in Firefox.

### Why This Happens:

1. **Ad blockers** (uBlock Origin, Brave Shields, AdBlock Plus) block requests to `localhost:5000`
2. They think these are tracking/analytics endpoints
3. Firefox works because you likely don't have ad blockers installed/enabled
4. This **ONLY affects local development** when testing production builds

## ✅ The Solution: Use Dev Mode

**Don't use production builds locally** - use the development server instead:

```bash
# Backend (already running on port 5000)
cd backend
npm start

# Frontend (use DEV mode, not build)
cd frontend
npm run dev
```

Then open: `http://localhost:3000` (or whatever port Vite shows)

### Why Dev Mode Works:
- Vite dev server has special handling for API requests
- Ad blockers don't interfere with dev server requests
- Hot reload makes development faster anyway
- Environment variables work correctly

## For Render Deployment

When you deploy to Render:
1. Set `VITE_API_URL` to your Render backend URL in environment variables
2. Render will build with production settings
3. No ad blocker issues because you're using real URLs, not localhost

## If You MUST Test Production Build Locally

```bash
cd frontend
npm run build
npx vite preview --port 3000
```

Then **disable your ad blocker** for `localhost:3000`:
- **uBlock Origin**: Click icon → Click the power button → Refresh
- **Brave**: Click the Brave Shields icon → Toggle off → Refresh  
- **Chrome AdBlock**: Click icon → "Don't run on pages on this site"

## Summary

✅ **For Local Development**: Use `npm run dev` (no ad blocker issues)  
✅ **For Render Deployment**: Use environment variables (no localhost involved)  
❌ **Don't do**: Build locally and test production bundle (ad blockers will block it)

---

**Your servers are currently running:**
- Backend: `http://localhost:5000` 
- Frontend: Check the terminal output for the port (likely `http://localhost:3000` or `3001`)

Access the frontend URL in your browser and it should work fine with ad blockers! 🎉
