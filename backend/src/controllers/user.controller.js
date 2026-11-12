import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Song } from "../models/song.model.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const users = await User.find({ clerkId:{ $ne:req.auth.userId } }).select("clerkId fullName imageUrl bio").sort({ fullName:1 }).limit(100).lean();
		res.status(200).json(users);
	} catch (error) { next(error); }
};

export const getMessages = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const messages = await Message.find({ $or:[{ senderId:userId, receiverId:req.auth.userId }, { senderId:req.auth.userId, receiverId:userId }] }).sort({ createdAt:1 }).limit(500).lean();
		res.status(200).json(messages);
	} catch (error) { next(error); }
};

export const getMyProfile = async (req, res, next) => {
	try {
		const user = await User.findOne({ clerkId:req.auth.userId }).select("clerkId fullName imageUrl bio likedSongs following").populate("likedSongs").lean();
		if (!user) return res.status(404).json({ message:"Profile is not synced yet. Sign out and sign in again." });
		res.json(user);
	} catch (error) { next(error); }
};

export const updateMyProfile = async (req, res, next) => {
	try {
		const bio = typeof req.body.bio === "string" ? req.body.bio.trim().slice(0, 280) : undefined;
		if (bio === undefined) return res.status(400).json({ message:"A bio is required." });
		const user = await User.findOneAndUpdate({ clerkId:req.auth.userId }, { $set:{ bio } }, { new:true, runValidators:true }).select("clerkId fullName imageUrl bio");
		if (!user) return res.status(404).json({ message:"Profile not found." });
		res.json(user);
	} catch (error) { next(error); }
};

export const getMyFavorites = async (req, res, next) => {
	try {
		const user = await User.findOne({ clerkId:req.auth.userId }).populate({ path:"likedSongs", options:{ sort:{ createdAt:-1 } } }).lean();
		if (!user) return res.json([]);
		res.json(user.likedSongs || []);
	} catch (error) { next(error); }
};

export const updateFavorite = async (req, res, next) => {
	try {
		const { songId } = req.params;
		if (!mongoose.isValidObjectId(songId) || !(await Song.exists({ _id:songId }))) return res.status(404).json({ message:"Song not found." });
		const operation = req.method === "PUT" ? "$addToSet" : "$pull";
		const user = await User.findOneAndUpdate({ clerkId:req.auth.userId }, { [operation]:{ likedSongs:songId } }, { new:true }).select("likedSongs").populate("likedSongs");
		if (!user) return res.status(404).json({ message:"Profile not found." });
		res.json({ likedSongs:user.likedSongs });
	} catch (error) { next(error); }
};

export const updateFollowing = async (req, res, next) => {
	try {
		const { userId } = req.params;
		if (userId === req.auth.userId) return res.status(400).json({ message:"You cannot follow yourself." });
		if (!(await User.exists({ clerkId:userId }))) return res.status(404).json({ message:"User not found." });
		const operation = req.method === "PUT" ? "$addToSet" : "$pull";
		const user = await User.findOneAndUpdate({ clerkId:req.auth.userId }, { [operation]:{ following:userId } }, { new:true }).select("following");
		if (!user) return res.status(404).json({ message:"Profile not found." });
		res.json({ following:user.following });
	} catch (error) { next(error); }
};

export const getMyHistory = async (req, res, next) => {
	try {
		const user = await User.findOne({ clerkId:req.auth.userId }).populate({ path:"playHistory.songId", model:Song }).lean();
		res.json((user?.playHistory || []).filter((entry) => entry.songId).sort((a,b) => b.playedAt - a.playedAt));
	} catch (error) { next(error); }
};
