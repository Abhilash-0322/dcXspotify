import {Router} from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs, searchSongs, getRecommendations, recordSongPlay, getSongById } from '../controllers/song.controller.js';

const router = Router();

router.get('/', getAllSongs);
router.get('/search', searchSongs);
router.get('/featured',getFeaturedSongs);
router.get('/made-for-you',getMadeForYouSongs);
router.get('/trending',getTrendingSongs);
router.get('/recommendations', protectedRoute, getRecommendations);
router.post('/:id/play', protectedRoute, recordSongPlay);
router.get('/:id', getSongById);


export default router;
