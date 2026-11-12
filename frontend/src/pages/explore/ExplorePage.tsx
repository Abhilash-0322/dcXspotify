import Topbar from "@/components/Topbar";
import SongCard from "@/pages/home/components/SongCard";
import { axiosInstance } from "@/lib/axios";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { Playlist, Song } from "@/types";
import { ArrowRight, Disc3, Search, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type SearchResponse = { items:Song[]; total:number; pages:number; page:number; genres:string[] };

export default function ExplorePage() {
	const [query, setQuery] = useState("");
	const [genre, setGenre] = useState("");
	const [sort, setSort] = useState<"newest" | "popular">("newest");
	const [page, setPage] = useState(1);
	const [result, setResult] = useState<SearchResponse>({ items:[], total:0, pages:0, page:1, genres:[] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);
	const { publicPlaylists, fetchPublicPlaylists } = useLibraryStore();

	useEffect(() => {
		let active = true;
		setLoading(true); setError("");
		const timer = window.setTimeout(() => {
			axiosInstance.get<SearchResponse>("/songs/search", { params:{ q:query, genre:genre || undefined, sort, page, limit:24 } })
				.then(({ data }) => { if (active) setResult(data); })
				.catch(() => { if (active) setError("We couldn't load the music catalog. Check your connection and try again."); })
				.finally(() => { if (active) setLoading(false); });
		}, 180);
		return () => { active = false; window.clearTimeout(timer); };
	}, [query, genre, sort, page]);

	useEffect(() => { void fetchPublicPlaylists().catch(() => undefined); }, [fetchPublicPlaylists]);
	useEffect(() => {
		const focusSearch = (event:KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
			if (event.key === "Escape" && document.activeElement === searchRef.current) { setQuery(""); searchRef.current?.blur(); }
		};
		window.addEventListener("keydown",focusSearch);
		return () => window.removeEventListener("keydown",focusSearch);
	},[]);
	const featuredMixes: Playlist[] = publicPlaylists.slice(0,4);

	return <main className='app-surface h-full overflow-hidden'><Topbar /><div className='home-scroll'>
		<section className='explore-hero'><div><div className='eyebrow'><Sparkles size={14} /> THE MUSIC MAP</div><h1>Explore beyond<br /><span>your usual.</span></h1><p>Find something new, save a mix, and bring friends along.</p></div><div className='explore-art' aria-hidden='true'><Disc3 size={142} strokeWidth={1} /></div></section>
		<label className='explore-search'><Search size={18} /><input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder='Search songs, artists, or genres' aria-label='Search music' /><kbd>⌘ K</kbd></label>
		<div className='explore-toolbar'><div className='genre-chips'><button className={!genre ? "active" : ""} onClick={() => { setGenre(""); setPage(1); }}>Everything</button>{result.genres.filter(Boolean).map((item) => <button key={item} className={genre === item ? "active" : ""} onClick={() => { setGenre(genre === item ? "" : item); setPage(1); }}>{item}</button>)}</div><div className='sort-switch'><button className={sort === "newest" ? "active" : ""} onClick={() => setSort("newest")}>New</button><button className={sort === "popular" ? "active" : ""} onClick={() => setSort("popular")}><TrendingUp size={14} /> Popular</button></div></div>
		<section className='music-section'><div className='section-heading'><h2>Community mixes</h2><span>Shared by listeners</span><Link className='subtle-link' to='/community-playlists'>Browse all <ArrowRight size={13} /></Link></div>{featuredMixes.length ? <div className='mix-grid'>{featuredMixes.map((playlist) => <Link key={playlist._id} to={`/playlists/${playlist._id}`} className='mix-tile'><div className='mix-art'>{playlist.songs?.[0]?.imageUrl ? <img src={playlist.songs[0].imageUrl} alt='' /> : <Disc3 />}</div><strong>{playlist.title}</strong><span>{playlist.ownerName} · {playlist.songs?.length || 0} tracks</span></Link>)}</div> : <p className='empty-inline'>No public mixes yet. Start one from Your library.</p>}</section>
		<section className='music-section'><div className='section-heading'><h2>{query ? `Results for “${query}”` : genre || (sort === "popular" ? "Most played" : "Recently added")}</h2><span>{result.total} tracks</span></div>
			{error ? <div className='empty-state'><h2>Catalog unavailable</h2><p>{error}</p><button onClick={() => setPage((current) => current)}>Retry</button></div> : loading ? <div className='song-grid'>{Array.from({ length:8 }, (_,i)=><div className='song-skeleton' key={i}><div /><span /></div>)}</div> : result.items.length ? <div className='song-grid'>{result.items.map((song) => <SongCard key={song._id} song={song} />)}</div> : <div className='empty-state'><Search size={24} /><h2>No tracks matched</h2><p>Try a different title, artist, or genre.</p></div>}
			{result.pages > 1 && <div className='pagination'><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {result.pages}</span><button disabled={page >= result.pages} onClick={() => setPage((value) => value + 1)}>Next</button></div>}
		</section>
	</div></main>;
}
