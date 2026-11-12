import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true,
    },
    artist:{
        type: String,
        required: true,
    },
    imageUrl:{
        type: String,
        required: true,
    },
    audioUrl:{
        type: String,
        required: true,
    },
    duration:{
        type: Number,
        required: true,
    },
    genres:{ type:[String], default:[] },
    mood:{ type:String, default:"" },
    lyrics:{ type:String, default:"" },
    plays:{ type:Number, default:0, min:0 },
    isExplicit:{ type:Boolean, default:false },
    albumId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Album",
        required:false,
    }
    },
    {timestamps:true}
);

export const Song = mongoose.model("Song", songSchema);
