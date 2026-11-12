import Topbar from "@/components/Topbar";
import CreatePlaylistDialog from "@/components/CreatePlaylistDialog";
import SongCard from "@/pages/home/components/SongCard";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Clock3, Disc3, Heart, LibraryBig, Music2, PencilLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function LibraryPage() {
	const { favorites, history, myPlaylists, profile, isSignedIn, deletePlaylist, updateBio, fetchMyPlaylists } = useLibraryStore();
	const { user } = useUser();
	const [bio, setBio] = useState(profile?.bio || "");
	const [activeTab, setActiveTab] = useState("favorites");
	const [savingBio, setSavingBio] = useState(false);
	useEffect(() => { setBio(profile?.bio || ""); }, [profile?.bio]);
	useEffect(() => { if (isSignedIn) void fetchMyPlaylists().catch(() => undefined); }, [isSignedIn, fetchMyPlaylists]);
	const saveBio = async () => { setSavingBio(true); try { await updateBio(bio); toast.success("Profile updated"); } catch { toast.error("Could not save your profile."); } finally { setSavingBio(false); } };
	const recentSongs = history.map((entry) => entry.songId).filter(Boolean);

	return <main className='app-surface h-full overflow-hidden'><Topbar /><div className='home-scroll'>
		<section className='library-hero'><div className='profile-avatar'>{user?.imageUrl ? <img src={user.imageUrl} alt='' /> : <LibraryBig size={35} />}</div><div className='library-identity'><div className='eyebrow'>YOUR MUSIC LIFE</div><h1>{user?.firstName ? `${user.firstName}'s library` : "Your library"}</h1><p>{favorites.length} liked · {myPlaylists.length} playlists · {history.length} recent listens</p></div><SignedIn><CreatePlaylistDialog /></SignedIn></section>
		<SignedIn><section className='profile-edit'><div><PencilLine size={16} /><span>About you</span></div><textarea value={bio} maxLength={280} onChange={(event) => setBio(event.target.value)} placeholder='Add a little note about the music you love…' /><div className='profile-edit-footer'><small>{bio.length}/280</small><Button className='action-primary' onClick={() => void saveBio()} disabled={savingBio || bio === (profile?.bio || "")}>{savingBio ? "Saving…" : "Save profile"}</Button></div></section></SignedIn>
		<SignedOut><div className='login-nudge'><span>Sign in to sync your likes, playlists, and listening history across devices.</span></div></SignedOut>
		<div className='library-tabs'>{[{ id:"favorites", label:"Liked songs", icon:<Heart size={15} /> }, { id:"playlists", label:"Playlists", icon:<Disc3 size={15} /> }, { id:"recent", label:"Recently played", icon:<Clock3 size={15} /> }].map((tab)=><button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.icon}{tab.label}</button>)}</div>
		{activeTab === "favorites" && <section className='music-section'><div className='section-heading'><h2>Your liked songs</h2><span>{favorites.length} tracks</span></div>{favorites.length ? <div className='song-grid'>{favorites.map((song)=><SongCard key={song._id} song={song} queue={favorites} />)}</div> : <div className='empty-state'><Heart size={25} /><h2>Start collecting favorites</h2><p>Tap the heart on a song to keep it close.</p><Link className='empty-action' to='/explore'>Explore music</Link></div>}</section>}
		{activeTab === "playlists" && <section className='music-section'><div className='section-heading'><h2>Made by you</h2><SignedIn><CreatePlaylistDialog /></SignedIn></div>{myPlaylists.length ? <div className='playlist-grid'>{myPlaylists.map((playlist)=><article className='playlist-tile' key={playlist._id}><Link to={`/playlists/${playlist._id}`}><div className='playlist-cover'>{playlist.coverUrl || playlist.songs?.[0]?.imageUrl ? <img src={playlist.coverUrl || playlist.songs?.[0]?.imageUrl} alt='' /> : <Music2 size={35} />}<span>{playlist.visibility}</span></div><h3>{playlist.title}</h3><p>{playlist.songs?.length || 0} tracks · updated {new Date(playlist.updatedAt).toLocaleDateString()}</p></Link><button className='tile-delete' aria-label={`Delete ${playlist.title}`} onClick={async()=>{if(!window.confirm(`Delete “${playlist.title}”?`)) return; try { await deletePlaylist(playlist._id); toast.success("Playlist deleted"); } catch { toast.error("Could not delete playlist."); }}}><Trash2 size={15} /></button></article>)}</div> : <div className='empty-state'><Disc3 size={25} /><h2>Your first mix starts here</h2><p>Make a playlist and gather tracks for any mood.</p><SignedIn><CreatePlaylistDialog /></SignedIn></div>}</section>}
		{activeTab === "recent" && <section className='music-section'><div className='section-heading'><h2>Recently played</h2><span>Last 50 listens</span></div>{recentSongs.length ? <div className='song-grid'>{recentSongs.map((song,index)=><SongCard key={`${song._id}-${index}`} song={song} queue={recentSongs} />)}</div> : <div className='empty-state'><Clock3 size={25} /><h2>Your listening history lives here</h2><p>Start playing music while signed in to build your history.</p></div>}</section>}
	</div></main>;
}
