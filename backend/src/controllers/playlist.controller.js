import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

export const getPlaylists = async (req, res, next) => {
	try {
		const filter = { $or:[{ visibility:"public" }, { ownerId:req.auth?.userId || null }] };
		const search = String(req.query.q || "").trim();
		if (search) filter.title = { $regex:search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options:"i" };
		const playlists = await Playlist.find(filter).populate("songs").sort({ updatedAt:-1 }).limit(60).lean();
		res.json(playlists);
	} catch (error) { next(error); }
};

export const getMyPlaylists = async (req, res, next) => {
	try {
		const playlists = await Playlist.find({ ownerId:req.auth.userId }).populate("songs").sort({ updatedAt:-1 }).lean();
		res.json(playlists);
	} catch (error) { next(error); }
};

export const getPlaylist = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message:"Playlist not found." });
		const playlist = await Playlist.findById(id).populate("songs").lean();
		if (!playlist || (playlist.visibility === "private" && playlist.ownerId !== req.auth?.userId)) return res.status(404).json({ message:"Playlist not found." });
		res.json(playlist);
	} catch (error) { next(error); }
};

export const createPlaylist = async (req, res, next) => {
	try {
		const title = String(req.body.title || "").trim();
		if (!title || title.length > 80) return res.status(400).json({ message:"Give your playlist a title (up to 80 characters)." });
		const owner = await User.findOne({ clerkId:req.auth.userId }).select("fullName imageUrl").lean();
		if (!owner) return res.status(404).json({ message:"Profile not found." });
		const playlist = await Playlist.create({ title, ownerId:req.auth.userId, ownerName:owner.fullName, ownerImageUrl:owner.imageUrl, description:String(req.body.description || "").slice(0,500), visibility:["public","unlisted","private"].includes(req.body.visibility) ? req.body.visibility : "public" });
		res.status(201).json(playlist);
	} catch (error) { next(error); }
};

export const updatePlaylist = async (req, res, next) => {
	try {
		const updates = {};
		if (typeof req.body.title === "string") updates.title = req.body.title.trim().slice(0,80);
		if (typeof req.body.description === "string") updates.description = req.body.description.trim().slice(0,500);
		if (["public","unlisted","private"].includes(req.body.visibility)) updates.visibility = req.body.visibility;
		if (typeof req.body.coverUrl === "string") updates.coverUrl = req.body.coverUrl.trim().slice(0,1000);
		if (!Object.keys(updates).length) return res.status(400).json({ message:"There are no playlist changes to save." });
		const playlist = await Playlist.findOneAndUpdate({ _id:req.params.id, ownerId:req.auth.userId }, { $set:updates }, { new:true, runValidators:true }).populate("songs");
		if (!playlist) return res.status(404).json({ message:"Playlist not found." });
		res.json(playlist);
	} catch (error) { next(error); }
};

export const deletePlaylist = async (req, res, next) => {
	try {
		const playlist = await Playlist.findOneAndDelete({ _id:req.params.id, ownerId:req.auth.userId });
		if (!playlist) return res.status(404).json({ message:"Playlist not found." });
		res.json({ success:true });
	} catch (error) { next(error); }
};

export const updatePlaylistSong = async (req, res, next) => {
	try {
		const { id, songId } = req.params;
		if (!mongoose.isValidObjectId(songId) || !(await Song.exists({ _id:songId }))) return res.status(404).json({ message:"Song not found." });
		const operation = req.method === "PUT" ? "$addToSet" : "$pull";
		const playlist = await Playlist.findOneAndUpdate({ _id:id, ownerId:req.auth.userId }, { [operation]:{ songs:songId } }, { new:true }).populate("songs");
		if (!playlist) return res.status(404).json({ message:"Playlist not found." });
		res.json(playlist);
	} catch (error) { next(error); }
};

export const togglePlaylistLike = async (req, res, next) => {
	try {
		const operation = req.method === "DELETE" ? "$pull" : "$addToSet";
		const playlist = await Playlist.findOneAndUpdate({ _id:req.params.id, visibility:"public", ownerId:{ $ne:req.auth.userId } }, { [operation]:{ likedBy:req.auth.userId } }, { new:true }).select("likedBy");
		if (!playlist) return res.status(404).json({ message:"Playlist not found." });
		res.json({ liked:playlist.likedBy.includes(req.auth.userId), likes:playlist.likedBy.length });
	} catch (error) { next(error); }
};
