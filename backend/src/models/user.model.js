import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		imageUrl: {
			type: String,
			required: true,
		},
		clerkId: {
			type: String,
			required: true,
			unique: true,
		},
		bio: { type:String, default:"" , maxlength:280 },
		likedSongs: [{ type:mongoose.Schema.Types.ObjectId, ref:"Song" }],
		following: [{ type:String }],
		playHistory: [{
			songId:{ type:mongoose.Schema.Types.ObjectId, ref:"Song", required:true },
			playedAt:{ type:Date, default:Date.now },
		}],
	},
	{ timestamps: true } //  createdAt, updatedAt
);

export const User = mongoose.model("User", userSchema);
