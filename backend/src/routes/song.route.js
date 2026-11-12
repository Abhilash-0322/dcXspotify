import {Router} from 'express';
import { getAllSongs, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs } from '../controllers/song.controller.js';

const router = Router();

router.get('/', getAllSongs);
router.get('/featured',getFeaturedSongs);
router.get('/made-for-you',getMadeForYouSongs);
router.get('/trending',getTrendingSongs);


export default router;