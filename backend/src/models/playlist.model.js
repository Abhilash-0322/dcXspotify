import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
	title:{ type:String, required:true, trim:true, minlength:1, maxlength:80 },
	description:{ type:String, default:"", trim:true, maxlength:500 },
	ownerId:{ type:String, required:true, index:true },
	ownerName:{ type:String, required:true },
	ownerImageUrl:{ type:String, default:"" },
	coverUrl:{ type:String, default:"" },
	visibility:{ type:String, enum:["public","unlisted","private"], default:"public", index:true },
	songs:[{ type:mongoose.Schema.Types.ObjectId, ref:"Song" }],
	likedBy:[{ type:String }],
}, { timestamps:true });

playlistSchema.index({ visibility:1, updatedAt:-1 });

export const Playlist = mongoose.model("Playlist", playlistSchema);
