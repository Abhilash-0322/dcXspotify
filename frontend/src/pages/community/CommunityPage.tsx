import Topbar from "@/components/Topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useUser } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";
import SignInOAuthButtons from "@/components/SignInOAuthButtons";
import { Headphones, MessageCircle, UserRoundPlus, UsersRound, UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CommunityPage() {
	const { users, fetchUsers, onlineUsers } = useChatStore();
	const { profile, toggleFollow } = useLibraryStore();
	const { user } = useUser();
	const { isSignedIn } = useAuth();
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const [busy, setBusy] = useState("");
	useEffect(() => { if (user) void fetchUsers(); }, [fetchUsers,user]);
	const visible = users.filter((person) => `${person.fullName} ${person.bio || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
	const follow = async (id:string) => { setBusy(id); try { await toggleFollow(id); } catch { toast.error("Could not update your follows."); } finally { setBusy(""); } };
	return <main className='app-surface h-full overflow-hidden'><Topbar /><div className='home-scroll'>
		<section className='community-hero'><div className='community-icon'><UsersRound size={30} /></div><div><div className='eyebrow'>LISTEN TOGETHER</div><h1>Find your people.</h1><p>Meet listeners, see who's around, and start a conversation.</p></div></section>
		{!isSignedIn ? <div className='empty-state'><UsersRound size={25}/><h2>Find your listening circle</h2><p>Sign in to see the community and message other listeners.</p><SignInOAuthButtons /></div> : <><div className='community-tools'><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder='Find a listener' aria-label='Find a listener' /><span>{visible.length} listeners</span></div>
		<div className='listener-grid'>{visible.map((person)=><article className='listener-card' key={person._id}><div className='listener-head'><div className='listener-avatar'><Avatar><AvatarImage src={person.imageUrl} /><AvatarFallback>{person.fullName.slice(0,1)}</AvatarFallback></Avatar><span className={onlineUsers.has(person.clerkId) ? "online" : ""} /></div><div><h2>{person.fullName}</h2><p>{onlineUsers.has(person.clerkId) ? <><i /> Listening now</> : "Member"}</p></div></div><p className='listener-bio'>{person.bio || "Here for good music and better recommendations."}</p><div className='listener-actions'><Button className='action-primary' onClick={()=>void follow(person.clerkId)} disabled={busy===person.clerkId}>{profile?.following?.includes(person.clerkId) ? <><UserRoundCheck size={15} /> Following</> : <><UserRoundPlus size={15} /> Follow</>}</Button><Button variant='outline' onClick={()=>{useChatStore.getState().setSelectedUser(person); navigate("/chat");}}><MessageCircle size={15} /> Message</Button></div></article>)}</div>
		{!visible.length && <div className='empty-state'><Headphones size={25} /><h2>No listeners found</h2><p>Try a different name.</p></div>}</>}
	</div></main>;
}
