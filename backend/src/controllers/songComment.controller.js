import mongoose from "mongoose";
import { SongComment } from "../models/songComment.model.js";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

export const getSongComments = async (req, res, next) => {
	try {
		if (!mongoose.isValidObjectId(req.params.songId)) return res.status(404).json({ message:"Song not found." });
		const comments = await SongComment.find({ songId:req.params.songId }).sort({ createdAt:-1 }).limit(100).lean();
		res.json(comments);
	} catch (error) { next(error); }
};

export const createSongComment = async (req, res, next) => {
	try {
		const { songId } = req.params;
		const content = String(req.body.content || "").trim();
		if (!mongoose.isValidObjectId(songId) || !(await Song.exists({ _id:songId }))) return res.status(404).json({ message:"Song not found." });
		if (!content || content.length > 1000) return res.status(400).json({ message:"Write a comment of up to 1,000 characters." });
		const user = await User.findOne({ clerkId:req.auth.userId }).select("fullName imageUrl").lean();
		if (!user) return res.status(404).json({ message:"Profile not found." });
		const comment = await SongComment.create({ songId, userId:req.auth.userId, userName:user.fullName, userImageUrl:user.imageUrl, content });
		res.status(201).json(comment);
	} catch (error) { next(error); }
};

export const deleteSongComment = async (req, res, next) => {
	try {
		const comment = await SongComment.findOneAndDelete({ _id:req.params.commentId, userId:req.auth.userId });
		if (!comment) return res.status(404).json({ message:"Comment not found." });
		res.json({ success:true });
	} catch (error) { next(error); }
};
