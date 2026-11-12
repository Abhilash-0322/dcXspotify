import {Song} from '../models/song.model.js';
import { Album } from "../models/album.model.js";
import cloudinary from '../lib/cloudinary.js';
import { Playlist } from '../models/playlist.model.js';
import { User } from '../models/user.model.js';
import { SongComment } from '../models/songComment.model.js';

//helper function to upload files to cloudinary
const uploadToCloudinary=async (file) => {
    try{
        const result=await cloudinary.uploader.upload(file.tempFilePath,{
                resource_type: 'auto',
            }
        );
        return result.secure_url; 
    }
    catch(error){
        console.log("Error in uploading to Cloudinary",error);
        throw new Error("Error in uploading to Cloudinary");
    }
}

export const getAdmin=(req, res) => {
    res.send('Admin route');
}

export const createSong= async (req, res,next) => {
    try{
        if(!req.files || !req.files.audioFile || !req.files.imageFile){
            return res.status(400).json({message:"Please upload audio and image files"});
        }
        
        const {title,artist,albumId,duration,mood,lyrics}=req.body;
        const cleanTitle=String(title || "").trim();
        const cleanArtist=String(artist || "").trim();
        const songDuration=Number(duration);
        if(!cleanTitle || !cleanArtist || !Number.isFinite(songDuration) || songDuration<=0){
            return res.status(400).json({message:"Title, artist, and a positive duration are required."});
        }
        if(albumId && !(await Album.exists({_id:albumId}))){
            return res.status(404).json({message:"Album not found."});
        }
        const audioFile=req.files.audioFile;
        const imageFile=req.files.imageFile;

        const audioUrl=await uploadToCloudinary(audioFile);
        const imageUrl=await uploadToCloudinary(imageFile);

        const song=new Song({
            title:cleanTitle,
            artist:cleanArtist,
            audioUrl,
            imageUrl,
            duration:songDuration,
            albumId:albumId || null,
            mood:String(mood || "").slice(0,40),
            lyrics:String(lyrics || "").slice(0,12000),
            genres:String(req.body.genres || "").split(",").map((genre)=>genre.trim()).filter(Boolean).slice(0,8)
        })

        await song.save();
        if (albumId){
            await Album.findByIdAndUpdate(albumId,{
                $push:{songs:song._id}
            })
        }
        res.status(201).json(song);
    }
    catch(error){
        next(error);
    }
}

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);
		if (!song) return res.status(404).json({message:"Song not found."});

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}
        
		await Promise.all([
			Song.findByIdAndDelete(id),
			Playlist.updateMany({}, {$pull:{songs:song._id}}),
			User.updateMany({}, {$pull:{likedSongs:song._id,playHistory:{songId:song._id}}}),
			SongComment.deleteMany({songId:song._id})
		]);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const createAlbum= async (req, res,next) => {
    try{
        const {title,artist,releaseYear}=req.body;
        const imageFile=req.files?.imageFile;
        if(!imageFile || !String(title || "").trim() || !String(artist || "").trim()) return res.status(400).json({message:"Title, artist, and album artwork are required."});

        const imageUrl=await uploadToCloudinary(imageFile);

        const album=new Album({
            title,
            artist,
            releaseYear,
            imageUrl
        });

        await album.save();
        res.status(201).json(album);
    }
    catch(error){
        console.log("Error in creating Album",error);
        next(error);
    }
};

export const deleteAlbum= async (req, res,next) => {
    try{
        const {id}=req.params;
		const album=await Album.findById(id);
		if(!album) return res.status(404).json({message:"Album not found."});
		await Promise.all([
			Song.updateMany({albumId:id}, {$set:{albumId:null}}),
			Album.findByIdAndDelete(id)
		]);
        res.status(200).json({message:"Album deleted successfully"});
    }
    catch(error){
        console.log("Error in deleting Album",error);
        next(error);
    }
}

export const checkAdmin=(req, res, next) => {
    res.status(200).json({admin:true});
}
