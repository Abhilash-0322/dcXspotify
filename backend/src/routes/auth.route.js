import {Router} from 'express';
import { protectedRoute } from '../middleware/auth.middleware.js';
import { authCallback } from '../controllers/auth.controller.js';

const router = Router();

router.get('/', (req, res) => {
    res.send('Auth route');
}
);

router.post('/callback',protectedRoute,authCallback);

router.get('/callback',(req,res) => {
    res.send('Callback route');
});

export default router;