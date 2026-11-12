import Topbar from "@/components/Topbar";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useUser } from "@clerk/clerk-react";
import { Disc3, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function CommunityPlaylistsPage() {
	const { publicPlaylists, fetchPublicPlaylists, togglePlaylistLike } = useLibraryStore();
	const { user } = useUser();
	const [query,setQuery]=useState("");
	const [busy,setBusy]=useState("");
	useEffect(()=>{void fetchPublicPlaylists(query).catch(()=>undefined);},[fetchPublicPlaylists,query]);
	return <main className='app-surface h-full overflow-hidden'><Topbar/><div className='home-scroll'>
		<section className='community-mixes-hero'><div className='eyebrow'>MADE BY LISTENERS</div><h1>Community mixes.</h1><p>Borrow a mood. Find your next favorite.</p><label><Search size={16}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder='Search public playlists'/></label></section>
		{publicPlaylists.length?<div className='playlist-grid community-playlist-grid'>{publicPlaylists.map((playlist)=><article className='playlist-tile' key={playlist._id}><Link to={`/playlists/${playlist._id}`}><div className='playlist-cover'>{playlist.coverUrl||playlist.songs?.[0]?.imageUrl?<img src={playlist.coverUrl||playlist.songs?.[0]?.imageUrl} alt=''/>:<Disc3 size={35}/>}</div><h3>{playlist.title}</h3><p>By {playlist.ownerName} · {playlist.songs?.length||0} tracks</p></Link>{user?.id&&user.id!==playlist.ownerId&&<button className={`playlist-like ${playlist.likedBy?.includes(user.id)?"liked":""}`} disabled={busy===playlist._id} onClick={async()=>{setBusy(playlist._id);try{await togglePlaylistLike(playlist);toast.success(playlist.likedBy?.includes(user.id)?"Like removed":"Playlist liked");}catch{toast.error("Could not update like");}finally{setBusy("");}}}><Heart size={15} fill={playlist.likedBy?.includes(user.id)?"currentColor":"none"}/><span>{playlist.likedBy?.length||0}</span></button>}</article>)}</div>:<div className='empty-state'><Disc3 size={24}/><h2>No shared mixes yet</h2><p>Be the first to publish a playlist from your library.</p><Link className='empty-action' to='/library'>Open your library</Link></div>}
	</div></main>;
}
