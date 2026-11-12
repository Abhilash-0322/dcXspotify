import Topbar from "@/components/Topbar";
import SongCard from "./components/SongCard";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Heart, Play } from "lucide-react";

const LikedSongsPage = () => {
	const { likedSongs, playAlbum } = usePlayerStore();
	return <main className='app-surface h-full overflow-hidden'><Topbar /><div className='home-scroll'>
		<section className='liked-hero'><div className='liked-icon'><Heart size={34} fill='currentColor' /></div><div><div className='eyebrow'>YOUR COLLECTION</div><h1>Liked songs</h1><p>{likedSongs.length} {likedSongs.length === 1 ? "track" : "tracks"}, saved on this device</p></div>
			{likedSongs.length > 0 && <button className='round-play-button' onClick={() => playAlbum(likedSongs)} aria-label='Play liked songs'><Play size={21} fill='currentColor' /></button>}
		</section>
		{likedSongs.length ? <section className='music-section'><div className='song-grid'>{likedSongs.map((song) => <SongCard key={song._id} song={song} queue={likedSongs} />)}</div></section> : <div className='empty-state'><Heart size={25} /><h2>Keep the songs you love</h2><p>Tap the heart on any track to save it here.</p></div>}
	</div></main>;
};

export default LikedSongsPage;
