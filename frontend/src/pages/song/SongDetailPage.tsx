import Topbar from "@/components/Topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Song, SongComment } from "@/types";
import { useAuth, useUser } from "@clerk/clerk-react";
import { ArrowLeft, Heart, MessageCircle, Pause, Play, Send, Sparkles, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useLibraryStore } from "@/stores/useLibraryStore";

export default function SongDetailPage() {
	const { songId = "" } = useParams();
	const { user, isLoaded } = useUser();
	const { isSignedIn } = useAuth();
	const { currentSong, isPlaying, setCurrentSong, togglePlay } = usePlayerStore();
	const { favorites, toggleFavorite } = useLibraryStore();
	const [song, setSong] = useState<Song | null>(null);
	const [comments, setComments] = useState<SongComment[]>([]);
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const active = currentSong?._id === song?._id;
	const liked = !!song && favorites.some((item)=>item._id===song._id);
	useEffect(() => {
		let activeRequest = true;
		setLoading(true);
		Promise.all([axiosInstance.get<Song>(`/songs/${songId}`), axiosInstance.get<SongComment[]>(`/songs/${songId}/comments`)]).then(([songResult,commentResult])=>{if(activeRequest){setSong(songResult.data);setComments(commentResult.data);}}).catch(()=>{if(activeRequest) toast.error("Could not load this track.");}).finally(()=>{if(activeRequest)setLoading(false);});
		return ()=>{activeRequest=false;};
	}, [songId]);
	const submitComment = async (event:FormEvent) => {
		event.preventDefault();
		if(!content.trim() || submitting) return;
		setSubmitting(true);
		try { const {data}=await axiosInstance.post<SongComment>(`/songs/${songId}/comments`,{content}); setComments((current)=>[data,...current]); setContent(""); }
		catch { toast.error("Sign in to share your thoughts."); }
		finally { setSubmitting(false); }
	};
	const deleteComment = async (commentId:string) => {
		try { await axiosInstance.delete(`/comments/${commentId}`); setComments((current)=>current.filter((comment)=>comment._id!==commentId)); }
		catch { toast.error("Could not delete comment."); }
	};
	return <main className='app-surface h-full overflow-hidden'><Topbar /><div className='home-scroll'>
		<Link to='/explore' className='back-link'><ArrowLeft size={15} /> Back to Explore</Link>
		{loading ? <div className='detail-loading' /> : song ? <>
			<section className='song-detail-hero'><div className='detail-art'><img src={song.imageUrl} alt={`${song.title} cover`} /></div><div className='detail-copy'><div className='eyebrow'><Sparkles size={14} /> TRACK SPOTLIGHT</div><h1>{song.title}</h1><p className='detail-artist'>{song.artist}</p><div className='track-metadata'><span>{Math.floor(song.duration/60)}:{String(song.duration%60).padStart(2,"0")}</span>{song.plays !== undefined && <span>{song.plays.toLocaleString()} plays</span>}{song.mood && <span>{song.mood} mood</span>}{song.isExplicit && <span>Explicit</span>}</div><div className='detail-actions'><Button className='round-play-button' onClick={()=>active ? togglePlay() : setCurrentSong(song)} aria-label={active && isPlaying ? "Pause" : "Play"}>{active && isPlaying ? <Pause size={20} fill='currentColor' /> : <Play size={20} fill='currentColor' />}</Button><Button variant='outline' className={liked ? "liked-action" : ""} onClick={()=>void toggleFavorite(song)}><Heart size={15} fill={liked ? "currentColor" : "none"} /> {liked ? "Liked" : "Like"}</Button></div></div></section>
			<div className='detail-columns'><section className='detail-panel'><div className='section-heading'><h2><MessageCircle size={17} /> Listener notes</h2><span>{comments.length}</span></div>{isLoaded && isSignedIn ? <form className='comment-form' onSubmit={(event)=>void submitComment(event)}><Avatar className='size-9'><AvatarImage src={user?.imageUrl} /><AvatarFallback>{user?.firstName?.slice(0,1) || "Y"}</AvatarFallback></Avatar><Input value={content} maxLength={1000} onChange={(event)=>setContent(event.target.value)} placeholder='Share a thought about this track…' /><Button className='action-primary' type='submit' disabled={!content.trim()||submitting}><Send size={15} /></Button></form> : <p className='sign-in-note'>Sign in to join the conversation.</p>}
				<div className='comment-list'>{comments.map((comment)=><article className='comment' key={comment._id}><Avatar className='size-9'><AvatarImage src={comment.userImageUrl} /><AvatarFallback>{comment.userName.slice(0,1)}</AvatarFallback></Avatar><div className='comment-copy'><div><strong>{comment.userName}</strong><time>{new Date(comment.createdAt).toLocaleDateString()}</time></div><p>{comment.content}</p></div>{comment.userId===user?.id && <button onClick={()=>void deleteComment(comment._id)} aria-label='Delete comment'><Trash2 size={15}/></button>}</article>)}</div>
				{comments.length===0 && <div className='comment-empty'>Be the first to leave a note on this track.</div>}</section>
				<aside className='detail-panel lyrics-panel'><div className='section-heading'><h2><Heart size={16} /> About this track</h2></div>{song.genres?.length ? <div className='tag-list'>{song.genres.map((tag)=><span key={tag}>{tag}</span>)}</div> : <p className='lyrics-empty'>No genres have been added yet.</p>}{song.lyrics ? <><h3>Lyrics</h3><pre>{song.lyrics}</pre></> : <p className='lyrics-empty'>No lyrics have been added yet.</p>}</aside></div>
		</> : <div className='empty-state'><h2>Track not found</h2><Link to='/explore'>Explore the catalog</Link></div>}
	</div></main>;
}
