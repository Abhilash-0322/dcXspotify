import { Song } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { Heart, ListPlus, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

const SongCard = ({ song, queue }: { song: Song; queue?: Song[] }) => {
	const { currentSong, isPlaying, setCurrentSong, togglePlay, playAlbum } = usePlayerStore();
	const { favorites, toggleFavorite, myPlaylists, addSongToPlaylist, isSignedIn } = useLibraryStore();
	const [showPlaylists, setShowPlaylists] = useState(false);
	const active = currentSong?._id === song._id;
	const liked = favorites.some((item) => item._id === song._id);
	const play = () => {
		if (active) togglePlay();
		else if (queue) playAlbum(queue, queue.findIndex((item) => item._id === song._id));
		else setCurrentSong(song);
	};
	const addToPlaylist = async (playlistId:string) => {
		try { await addSongToPlaylist(playlistId,song._id); setShowPlaylists(false); toast.success("Added to playlist"); }
		catch { toast.error("Could not add this track."); }
	};

	return (
		<article className='song-card group'>
			<div className='song-card-art'>
				<img src={song.imageUrl} alt={`${song.title} by ${song.artist}`} loading='lazy' />
				<button className='song-card-play' onClick={play} aria-label={`${active && isPlaying ? "Pause" : "Play"} ${song.title}`}>
					{active && isPlaying ? <Pause size={18} fill='currentColor' /> : <Play size={18} fill='currentColor' />}
				</button>
				<button className={`song-card-like ${liked ? "is-liked" : ""}`} onClick={() => void toggleFavorite(song)} aria-label={liked ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`}>
					<Heart size={17} fill={liked ? "currentColor" : "none"} />
				</button>
				{isSignedIn && <button className='song-card-add' onClick={()=>setShowPlaylists((visible)=>!visible)} aria-label={`Add ${song.title} to playlist`}><ListPlus size={16}/></button>}
				{showPlaylists && <div className='playlist-picker'>{myPlaylists.length?myPlaylists.map((playlist)=><button key={playlist._id} onClick={()=>void addToPlaylist(playlist._id)}>{playlist.title}</button>):<Link to='/library'>Create a playlist first</Link>}</div>}
			</div>
			<div className='song-card-copy'>
				<h3 title={song.title}><Link to={`/songs/${song._id}`}>{song.title}</Link></h3>
				<p title={song.artist}>{song.artist}</p>
			</div>
		</article>
	);
};

export default SongCard;
