import Topbar from "@/components/Topbar";
import SongCard from "@/pages/home/components/SongCard";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axios";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Playlist } from "@/types";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Disc3, Heart, Pause, Play, Share2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function PlaylistDetailPage() {
	const { playlistId = "" } = useParams();
	const { user } = useUser();
	const navigate = useNavigate();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const [playlist, setPlaylist] = useState<Playlist | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const owner = playlist?.ownerId === user?.id;
	const active = !!playlist?.songs.some((song)=>song._id===currentSong?._id);
	const liked = !!user?.id && !!playlist?.likedBy?.includes(user.id);
	useEffect(()=>{let live=true;setLoading(true);axiosInstance.get<Playlist>(`/playlists/${playlistId}`).then(({data})=>{if(live)setPlaylist(data);}).catch(()=>{if(live)setPlaylist(null);}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[playlistId]);
	const toggleLike = async () => { if(!playlist || !user) return;setSaving(true);try{const {data}=await axiosInstance.request<{liked:boolean}>({method:liked?"delete":"post",url:`/playlists/${playlist._id}/like`});setPlaylist((current)=>current?{...current,likedBy:data.liked?[...(current.likedBy||[]),user.id]:(current.likedBy||[]).filter((id)=>id!==user.id)}:current);}catch{toast.error("Could not update playlist like.");}finally{setSaving(false);} };
	const removeSong = async (songId:string) => { if(!playlist) return;try{const {data}=await axiosInstance.delete<Playlist>(`/playlists/${playlist._id}/songs/${songId}`);setPlaylist(data);toast.success("Track removed");}catch{toast.error("Could not update playlist.");} };
	const copyLink = async () => { try{await navigator.clipboard.writeText(window.location.href);toast.success("Playlist link copied");}catch{toast.error("Could not copy link.");} };
	const deletePlaylist = async () => { if(!playlist || !window.confirm(`Delete “${playlist.title}”?`))return;try{await axiosInstance.delete(`/playlists/${playlist._id}`);toast.success("Playlist deleted");navigate("/library");}catch{toast.error("Could not delete playlist.");} };
	const updateVisibility = async (visibility:Playlist["visibility"]) => { if(!playlist)return;try{const {data}=await axiosInstance.patch<Playlist>(`/playlists/${playlist._id}`,{visibility});setPlaylist(data);toast.success("Sharing settings updated");}catch{toast.error("Could not update sharing settings.");} };
	return <main className='app-surface h-full overflow-hidden'><Topbar/><div className='home-scroll'>
		<Link className='back-link' to={owner?"/library":"/explore"}><ArrowLeft size={15}/> Back</Link>
		{loading?<div className='detail-loading'/>:playlist?<>
			<section className='playlist-detail-hero'><div className='playlist-detail-art'>{playlist.coverUrl||playlist.songs?.[0]?.imageUrl?<img src={playlist.coverUrl||playlist.songs[0].imageUrl} alt=''/>:<Disc3 size={68}/>}</div><div className='playlist-detail-copy'><div className='eyebrow'>{playlist.visibility.toUpperCase()} MIX</div><h1>{playlist.title}</h1><p>{playlist.description||"A collection of sounds for your next moment."}</p><div className='playlist-byline'>{playlist.ownerImageUrl&&<img src={playlist.ownerImageUrl} alt=''/>}<span>By <strong>{playlist.ownerName}</strong></span><span>·</span><span>{playlist.songs.length} tracks</span><span>·</span><span>{playlist.likedBy?.length||0} likes</span></div></div></section>
			<div className='playlist-toolbar'><Button className='round-play-button' aria-label={active&&isPlaying?"Pause playlist":"Play playlist"} onClick={()=>active?togglePlay():playAlbum(playlist.songs)}>{active&&isPlaying?<Pause size={20} fill='currentColor'/>:<Play size={20} fill='currentColor'/>}</Button><Button variant='outline' onClick={()=>void copyLink()}><Share2 size={15}/> Share</Button>{user&&playlist.visibility==="public"&&!owner&&<Button variant='outline' onClick={()=>void toggleLike()} disabled={saving}><Heart size={15} fill={liked?"currentColor":"none"}/> {liked?"Liked":"Like"}</Button>}{owner&&<><label className='visibility-control'>Sharing<select value={playlist.visibility} onChange={(event)=>void updateVisibility(event.target.value as Playlist["visibility"])}><option value='public'>Public</option><option value='unlisted'>Unlisted</option><option value='private'>Private</option></select></label><Button variant='outline' onClick={()=>void deletePlaylist()} aria-label='Delete playlist'><Trash2 size={15}/></Button></>}</div>
			{playlist.songs.length?<section className='music-section'><div className='section-heading'><h2>Tracklist</h2><span>Tap a track to play it</span></div><div className='song-grid'>{playlist.songs.map((song)=><div key={song._id} className='playlist-song-wrap'><SongCard song={song} queue={playlist.songs}/>{owner&&<button className='remove-track' onClick={()=>void removeSong(song._id)} aria-label={`Remove ${song.title}`}><Trash2 size={14}/></button>}</div>)}</div></section>:<div className='empty-state'><Disc3 size={24}/><h2>This mix is ready for music</h2><p>Browse tracks and add them to your playlist.</p><Link className='empty-action' to='/explore'>Explore tracks</Link></div>}
		</>:<div className='empty-state'><h2>Playlist unavailable</h2><p>It may be private or the link may have changed.</p><Link to='/explore'>Go to Explore</Link></div>}
	</div></main>;
}
