import { Song } from "@/types";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Heart, Pause, Play } from "lucide-react";

const SongCard = ({ song, queue }: { song: Song; queue?: Song[] }) => {
	const { currentSong, isPlaying, setCurrentSong, togglePlay, playAlbum, likedSongs, toggleLike } = usePlayerStore();
	const active = currentSong?._id === song._id;
	const liked = likedSongs.some((item) => item._id === song._id);
	const play = () => {
		if (active) togglePlay();
		else if (queue) playAlbum(queue, queue.findIndex((item) => item._id === song._id));
		else setCurrentSong(song);
	};

	return (
		<article className='song-card group'>
			<div className='song-card-art'>
				<img src={song.imageUrl} alt={`${song.title} by ${song.artist}`} loading='lazy' />
				<button className='song-card-play' onClick={play} aria-label={`${active && isPlaying ? "Pause" : "Play"} ${song.title}`}>
					{active && isPlaying ? <Pause size={18} fill='currentColor' /> : <Play size={18} fill='currentColor' />}
				</button>
				<button className={`song-card-like ${liked ? "is-liked" : ""}`} onClick={() => toggleLike(song)} aria-label={liked ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`}>
					<Heart size={17} fill={liked ? "currentColor" : "none"} />
				</button>
			</div>
			<div className='song-card-copy'>
				<h3 title={song.title}>{song.title}</h3>
				<p title={song.artist}>{song.artist}</p>
			</div>
		</article>
	);
};

export default SongCard;
