import {Router} from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { getAllUsers,getMessages,getMyProfile,updateMyProfile,getMyFavorites,updateFavorite,updateFollowing,getMyHistory } from '../controllers/user.controller.js';

const router = Router();

router.get('/', protectedRoute,getAllUsers);
router.get('/me', protectedRoute, getMyProfile);
router.patch('/me', protectedRoute, updateMyProfile);
router.get('/me/favorites', protectedRoute, getMyFavorites);
router.put('/me/favorites/:songId', protectedRoute, updateFavorite);
router.delete('/me/favorites/:songId', protectedRoute, updateFavorite);
router.put('/me/following/:userId', protectedRoute, updateFollowing);
router.delete('/me/following/:userId', protectedRoute, updateFollowing);
router.get('/me/history', protectedRoute, getMyHistory);
router.get("/messages/:userId", protectedRoute, getMessages);

export default router;
