import {Song} from '../models/song.model.js';
import {Album} from '../models/album.model.js';
import {User} from '../models/user.model.js';

export const getStats=async (req, res,next) => {

    try{
        const [totalSongs,totalUsers,totalAlbums,songArtists,albumArtists] = await Promise.all([
            Song.countDocuments(),
            User.countDocuments(),
            Album.countDocuments(),
            Song.distinct("artist"),
            Album.distinct("artist")
        ]);
        res.json({
            totalAlbums,
            totalSongs,
            totalUsers,
            totalArtists:new Set([...songArtists,...albumArtists].map((artist)=>artist.trim().toLowerCase()).filter(Boolean)).size
        });
    }
    catch(err){
        next(err);}
}
