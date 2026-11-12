import Topbar from "@/components/Topbar";
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect, useMemo, useRef, useState } from "react";
import SectionGrid from "./components/SectionGrid";
import SongCard from "./components/SongCard";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Search, Sparkles, X } from "lucide-react";

const HomePage = () => {
	const { fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs, isLoading, madeForYouSongs, featuredSongs, trendingSongs } = useMusicStore();
	const { initializeQueue } = usePlayerStore();
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("All music");
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchFeaturedSongs(); fetchMadeForYouSongs(); fetchTrendingSongs();
	}, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs]);

	const allSongs = useMemo(() => [...new Map([...featuredSongs, ...madeForYouSongs, ...trendingSongs].map((song) => [song._id, song])).values()], [featuredSongs, madeForYouSongs, trendingSongs]);
	useEffect(() => { if (allSongs.length) initializeQueue(allSongs); }, [allSongs, initializeQueue]);
	useEffect(() => {
		const focusSearch = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
			if (event.key === "Escape" && document.activeElement === searchRef.current) { setQuery(""); searchRef.current?.blur(); }
		};
		window.addEventListener("keydown", focusSearch);
		return () => window.removeEventListener("keydown", focusSearch);
	}, []);

	const match = (song: (typeof allSongs)[number]) => `${song.title} ${song.artist}`.toLowerCase().includes(query.trim().toLowerCase());
	const filteredFeatured = featuredSongs.filter(match);
	const filteredMadeForYou = madeForYouSongs.filter(match);
	const filteredTrending = trendingSongs.filter(match);
	const hasResults = filter === "For you" ? filteredMadeForYou.length > 0 : filter === "Trending" ? filteredTrending.length > 0 : filter === "Featured" ? filteredFeatured.length > 0 : filteredFeatured.length + filteredMadeForYou.length + filteredTrending.length > 0;
	const categories = ["All music", "For you", "Trending", "Featured"];

	return (
		<main className='app-surface h-full overflow-hidden'>
			<Topbar />
			<div className='home-scroll'>
				<section className='welcome-panel'>
					<div className='welcome-orb welcome-orb-one' /><div className='welcome-orb welcome-orb-two' />
					<div className='welcome-copy'>
						<div className='eyebrow'><Sparkles size={14} /> YOUR DAILY SOUNDTRACK</div>
						<h1>Find your<br /><span>next favorite.</span></h1>
						<p>A little discovery, a lot of good music. Pick a track and make the moment yours.</p>
					</div>
					<label className='music-search'><Search size={18} /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Search tracks or artists' aria-label='Search tracks or artists' />{query && <button type='button' onClick={() => setQuery("")} aria-label='Clear search'><X size={16} /></button>}<kbd>⌘ K</kbd></label>
				</section>

				<div className='category-pills' aria-label='Music categories'>{categories.map((category) => <button key={category} className={filter === category ? "active" : ""} onClick={() => setFilter(category)}>{category}</button>)}</div>

				{!query && filter === "All music" && filteredFeatured.length > 0 && <section className='music-section'><div className='section-heading'><h2>In the spotlight</h2><span>Handpicked for the moment</span></div><div className='song-grid song-grid-featured'>{filteredFeatured.slice(0, 3).map((song) => <SongCard key={song._id} song={song} />)}</div></section>}
				{(filter === "All music" || filter === "For you") && <SectionGrid title='Made for you' songs={filteredMadeForYou} isLoading={isLoading} />}
				{(filter === "All music" || filter === "Trending") && <SectionGrid title='Trending now' songs={filteredTrending} isLoading={isLoading} />}
				{(filter === "All music" || filter === "Featured") && (query || filter !== "All music") && <SectionGrid title='Featured' songs={filteredFeatured} isLoading={isLoading} />}
				{!isLoading && !hasResults && <div className='empty-state'><Search size={24} /><h2>No tracks found</h2><p>Try another song title or artist name.</p><button onClick={() => { setQuery(""); setFilter("All music"); }}>Show all music</button></div>}
				<div className='home-footer'>Made for listening, whenever you need it.</div>
			</div>
		</main>
	);
};

export default HomePage;
