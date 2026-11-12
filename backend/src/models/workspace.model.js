import mongoose from "mongoose";
const { Schema } = mongoose;
const workspaceSchema = new Schema(
  {
    clerkId: { type: String, unique: true, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "Song" }],
    artists: [String],
    history: [
      {
        song: { type: Schema.Types.ObjectId, ref: "Song" },
        playedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);
const collectionSchema = new Schema(
  {
    owner: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: 80 },
    description: { type: String, maxlength: 500, default: "" },
    isPublic: { type: Boolean, default: false },
    songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
  },
  { timestamps: true },
);
const noteSchema = new Schema(
  {
    song: {
      type: Schema.Types.ObjectId,
      ref: "Song",
      required: true,
      index: true,
    },
    author: { type: String, required: true },
    body: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);
export const Workspace = mongoose.model("Workspace", workspaceSchema);
export const Collection = mongoose.model("Collection", collectionSchema);
export const Note = mongoose.model("Note", noteSchema);
