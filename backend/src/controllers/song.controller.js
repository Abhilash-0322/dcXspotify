import mongoose from "mongoose";
import { Song } from "../models/song.model.js";
import { User } from "../models/user.model.js";

const safeSearch = (value) => String(value || "").trim().slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const publicFields = { title:1, artist:1, imageUrl:1, audioUrl:1, duration:1, albumId:1, genres:1, mood:1, plays:1, isExplicit:1, createdAt:1 };

export const getAllSongs = async (req, res, next) => {
	try {
		const songs = await Song.find().sort({ createdAt:-1 }).limit(1000).lean();
		res.json(songs);
	} catch (error) { next(error); }
};

export const searchSongs = async (req, res, next) => {
	try {
		const search = safeSearch(req.query.q);
		const filter = {};
		if (search) filter.$or = [{ title:{ $regex:search, $options:"i" } }, { artist:{ $regex:search, $options:"i" } }, { genres:{ $regex:search, $options:"i" } }, { mood:{ $regex:search, $options:"i" } }];
		if (req.query.genre) filter.genres = { $in:[String(req.query.genre).slice(0,40)] };
		if (req.query.mood) filter.mood = String(req.query.mood).slice(0,40);
		const page = Math.max(1, Math.min(1000, Number.parseInt(req.query.page,10) || 1));
		const limit = Math.max(1, Math.min(60, Number.parseInt(req.query.limit,10) || 24));
		const sort = req.query.sort === "popular" ? { plays:-1, createdAt:-1 } : req.query.sort === "oldest" ? { createdAt:1 } : { createdAt:-1 };
		const [items,total] = await Promise.all([Song.find(filter, publicFields).sort(sort).skip((page-1)*limit).limit(limit).lean(), Song.countDocuments(filter)]);
		res.json({ items, total, page, pages:Math.ceil(total/limit), genres:await Song.distinct("genres") });
	} catch (error) { next(error); }
};

const sampleSongs = (size, sort = null) => {
	const stages = sort ? [{ $sort:sort }, { $limit:size }] : [{ $sample:{ size } }];
	return Song.aggregate([...stages, { $project:publicFields }]);
};

export const getFeaturedSongs = async (_req, res, next) => {
	try { res.json(await sampleSongs(6)); } catch (error) { next(error); }
};

export const getMadeForYouSongs = async (req, res, next) => {
	try {
		if (req.auth?.userId) return res.json(await getRecommendationsFor(req.auth.userId, 8));
		res.json(await sampleSongs(8));
	} catch (error) { next(error); }
};

export const getTrendingSongs = async (_req, res, next) => {
	try { res.json(await sampleSongs(8, { plays:-1, createdAt:-1 })); } catch (error) { next(error); }
};

export const getRecommendations = async (req, res, next) => {
	try { res.json(await getRecommendationsFor(req.auth.userId, 20)); } catch (error) { next(error); }
};

async function getRecommendationsFor(userId, limit) {
	const user = await User.findOne({ clerkId:userId }).select("likedSongs playHistory").populate("likedSongs", "genres artist").lean();
	const liked = new Set((user?.likedSongs || []).map((song) => String(song._id)));
	const history = (user?.playHistory || []).map((entry) => String(entry.songId));
	const excludeIds = [...new Set([...liked, ...history.slice(0, 12)])].filter(mongoose.isValidObjectId).map((id) => new mongoose.Types.ObjectId(id));
	const genres = [...new Set((user?.likedSongs || []).flatMap((song) => song.genres || []))];
	const filter = { _id:{ $nin:excludeIds } };
	if (genres.length) filter.genres = { $in:genres };
	let songs = await Song.find(filter, publicFields).sort({ plays:-1, createdAt:-1 }).limit(limit).lean();
	if (!songs.length) songs = await sampleSongs(limit);
	return songs;
}

export const recordSongPlay = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message:"Song not found." });
		const song = await Song.findByIdAndUpdate(id, { $inc:{ plays:1 } }, { new:true }).lean();
		if (!song) return res.status(404).json({ message:"Song not found." });
		await User.updateOne({ clerkId:req.auth.userId }, { $push:{ playHistory:{ $each:[{ songId:id, playedAt:new Date() }], $position:0, $slice:50 } } });
		res.json({ success:true, plays:song.plays });
	} catch (error) { next(error); }
};

export const getSongById = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message:"Song not found." });
		const song = await Song.findById(id).lean();
		if (!song) return res.status(404).json({ message:"Song not found." });
		res.json(song);
	} catch (error) { next(error); }
};
