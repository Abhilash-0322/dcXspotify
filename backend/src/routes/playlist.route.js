import { Router } from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { createPlaylist, deletePlaylist, getMyPlaylists, getPlaylist, getPlaylists, togglePlaylistLike, updatePlaylist, updatePlaylistSong } from "../controllers/playlist.controller.js";

const router = Router();
router.get("/", getPlaylists);
router.get("/mine", protectedRoute, getMyPlaylists);
router.post("/", protectedRoute, createPlaylist);
router.get("/:id", getPlaylist);
router.patch("/:id", protectedRoute, updatePlaylist);
router.delete("/:id", protectedRoute, deletePlaylist);
router.put("/:id/songs/:songId", protectedRoute, updatePlaylistSong);
router.delete("/:id/songs/:songId", protectedRoute, updatePlaylistSong);
router.post("/:id/like", protectedRoute, togglePlaylistLike);
router.delete("/:id/like", protectedRoute, togglePlaylistLike);

export default router;
