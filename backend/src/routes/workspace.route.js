import { Router } from "express";
import mongoose from "mongoose";
import { Workspace, Collection, Note } from "../models/workspace.model.js";
import { Song } from "../models/song.model.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
const router = Router();
const uid = (req) =>
  (typeof req.auth === "function" ? req.auth() : req.auth).userId;
const run = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};
const valid = (id) => typeof id === "string" && mongoose.isValidObjectId(id);
const text = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const load = (req) =>
  Workspace.findOneAndUpdate(
    { clerkId: uid(req) },
    { $setOnInsert: { clerkId: uid(req) } },
    { upsert: true, new: true },
  );
router.get(
  "/public",
  run(async (req, res) => {
    res.json(
      await Collection.find({ isPublic: true })
        .sort({ updatedAt: -1 })
        .limit(60)
        .populate("songs"),
    );
  }),
);
router.get(
  "/notes/:id",
  run(async (req, res) => {
    if (!valid(req.params.id))
      return res.status(400).json({ message: "Invalid song" });
    res.json(
      await Note.find({ song: req.params.id })
        .sort({ createdAt: -1 })
        .limit(50),
    );
  }),
);
router.get(
  "/collections/:id",
  run(async (req, res) => {
    if (!valid(req.params.id))
      return res.status(400).json({ message: "Invalid collection" });
    const item = await Collection.findOne({
      _id: req.params.id,
      $or: [{ isPublic: true }, { owner: uid(req) || "" }],
    }).populate("songs");
    if (!item) return res.status(404).json({ message: "Collection not found" });
    res.json(item);
  }),
);
router.use(protectedRoute);
router.get(
  "/",
  run(async (req, res) => {
    const profile = await load(req);
    await profile.populate("likes history.song");
    const collections = await Collection.find({ owner: uid(req) })
      .sort({ updatedAt: -1 })
      .populate("songs");
    res.json({ profile, collections });
  }),
);
router.put(
  "/likes/:id",
  run(async (req, res) => {
    if (!valid(req.params.id) || !(await Song.exists({ _id: req.params.id })))
      return res.status(404).json({ message: "Song not found" });
    await load(req);
    const op =
      req.body.liked === true
        ? { $addToSet: { likes: req.params.id } }
        : { $pull: { likes: req.params.id } };
    await Workspace.updateOne({ clerkId: uid(req) }, op);
    res.json({ success: true });
  }),
);
router.post(
  "/history/:id",
  run(async (req, res) => {
    if (!valid(req.params.id) || !(await Song.exists({ _id: req.params.id })))
      return res.status(404).json({ message: "Song not found" });
    await load(req);
    await Workspace.updateOne(
      { clerkId: uid(req) },
      {
        $push: {
          history: {
            $each: [{ song: req.params.id, playedAt: new Date() }],
            $position: 0,
            $slice: 100,
          },
        },
      },
    );
    res.json({ success: true });
  }),
);
router.put(
  "/artists",
  run(async (req, res) => {
    const artist = text(req.body.artist, 120);
    if (!artist) return res.status(400).json({ message: "Artist is required" });
    await load(req);
    await Workspace.updateOne(
      { clerkId: uid(req) },
      req.body.follow
        ? { $addToSet: { artists: artist } }
        : { $pull: { artists: artist } },
    );
    res.json({ success: true });
  }),
);
router.post(
  "/collections",
  run(async (req, res) => {
    const name = text(req.body.name, 80);
    if (!name)
      return res.status(400).json({ message: "Give your playlist a name" });
    res
      .status(201)
      .json(
        await Collection.create({
          owner: uid(req),
          name,
          description: text(req.body.description, 500),
          isPublic: req.body.isPublic === true,
        }),
      );
  }),
);
router.put(
  "/collections/:id",
  run(async (req, res) => {
    if (!valid(req.params.id))
      return res.status(400).json({ message: "Invalid collection" });
    const item = await Collection.findOne({
      _id: req.params.id,
      owner: uid(req),
    });
    if (!item) return res.status(404).json({ message: "Playlist not found" });
    if (req.body.name !== undefined) {
      const name = text(req.body.name, 80);
      if (!name) return res.status(400).json({ message: "Name is required" });
      item.name = name;
    }
    if (req.body.description !== undefined)
      item.description = text(req.body.description, 500);
    if (typeof req.body.isPublic === "boolean")
      item.isPublic = req.body.isPublic;
    if (req.body.songs !== undefined) {
      if (
        !Array.isArray(req.body.songs) ||
        req.body.songs.length > 500 ||
        !req.body.songs.every(valid)
      )
        return res
          .status(400)
          .json({ message: "Choose up to 500 valid songs" });
      const ids = [...new Set(req.body.songs)];
      const found = await Song.find({ _id: { $in: ids } }).select("_id");
      if (found.length !== ids.length)
        return res.status(400).json({ message: "Some songs no longer exist" });
      item.songs = ids;
    }
    await item.save();
    await item.populate("songs");
    res.json(item);
  }),
);
router.delete(
  "/collections/:id",
  run(async (req, res) => {
    if (!valid(req.params.id))
      return res.status(400).json({ message: "Invalid playlist" });
    const result = await Collection.deleteOne({
      _id: req.params.id,
      owner: uid(req),
    });
    if (!result.deletedCount)
      return res.status(404).json({ message: "Playlist not found" });
    res.json({ success: true });
  }),
);
router.post(
  "/notes/:id",
  run(async (req, res) => {
    const body = text(req.body.body, 500);
    if (!body || !valid(req.params.id))
      return res
        .status(400)
        .json({ message: "A song and comment are required" });
    if (!(await Song.exists({ _id: req.params.id })))
      return res.status(404).json({ message: "Song not found" });
    res
      .status(201)
      .json(await Note.create({ song: req.params.id, author: uid(req), body }));
  }),
);
router.delete(
  "/notes/:id",
  run(async (req, res) => {
    if (!valid(req.params.id))
      return res.status(400).json({ message: "Invalid comment" });
    const result = await Note.deleteOne({
      _id: req.params.id,
      author: uid(req),
    });
    if (!result.deletedCount)
      return res.status(404).json({ message: "Comment not found" });
    res.json({ success: true });
  }),
);
export default router;
