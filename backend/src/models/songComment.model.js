import mongoose from "mongoose";

const songCommentSchema = new mongoose.Schema({
	songId:{ type:mongoose.Schema.Types.ObjectId, ref:"Song", required:true, index:true },
	userId:{ type:String, required:true, index:true },
	userName:{ type:String, required:true },
	userImageUrl:{ type:String, default:"" },
	content:{ type:String, required:true, trim:true, minlength:1, maxlength:1000 },
}, { timestamps:true });

songCommentSchema.index({ songId:1, createdAt:-1 });

export const SongComment = mongoose.model("SongComment", songCommentSchema);
