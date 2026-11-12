import { Router } from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { createSongComment, deleteSongComment, getSongComments } from "../controllers/songComment.controller.js";

const router = Router();
router.get("/songs/:songId/comments", getSongComments);
router.post("/songs/:songId/comments", protectedRoute, createSongComment);
router.delete("/comments/:commentId", protectedRoute, deleteSongComment);

export default router;
