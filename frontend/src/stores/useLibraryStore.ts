import { axiosInstance } from "@/lib/axios";
import { PlayHistoryEntry, Playlist, Song, User } from "@/types";
import { create } from "zustand";
import toast from "react-hot-toast";

const storageKey = "music-chat-liked-songs";
const getStorageKey = (userId?:string) => userId ? `${storageKey}:${userId}` : storageKey;
const readLocalFavorites = (userId?:string): Song[] => {
	try { return JSON.parse(localStorage.getItem(getStorageKey(userId)) || "[]") as Song[]; }
	catch { return []; }
};
const writeLocalFavorites = (songs:Song[], userId?:string) => { try { localStorage.setItem(getStorageKey(userId),JSON.stringify(songs)); } catch { /* storage can be disabled */ } };
const uniqueSongs = (songs: Song[]) => [...new Map(songs.filter(Boolean).map((song) => [song._id, song])).values()];

interface LibraryStore {
	favorites: Song[];
	history: PlayHistoryEntry[];
	myPlaylists: Playlist[];
	publicPlaylists: Playlist[];
	profile: User | null;
	isSignedIn: boolean;
	isLoading: boolean;
	loadPersonalData: () => Promise<void>;
	resetPersonalData: () => void;
	toggleFavorite: (song: Song) => Promise<void>;
	removeDeletedSong: (songId:string) => void;
	recordPlay: (song: Song) => Promise<void>;
	createPlaylist: (title: string, description: string, visibility: Playlist["visibility"]) => Promise<Playlist>;
	fetchMyPlaylists: () => Promise<void>;
	fetchPublicPlaylists: (query?: string) => Promise<void>;
	addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
	removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
	deletePlaylist: (playlistId: string) => Promise<void>;
	togglePlaylistLike: (playlist: Playlist) => Promise<void>;
	toggleFollow: (userId: string) => Promise<void>;
	updateBio: (bio: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
	favorites:readLocalFavorites(), history:[], myPlaylists:[], publicPlaylists:[], profile:null, isSignedIn:false, isLoading:false,
	loadPersonalData: async () => {
		set({ isSignedIn:true, isLoading:true });
		const [profile, favorites, history, playlists] = await Promise.allSettled([
			axiosInstance.get<User>("/users/me"), axiosInstance.get<Song[]>("/users/me/favorites"),
			axiosInstance.get<PlayHistoryEntry[]>("/users/me/history"), axiosInstance.get<Playlist[]>("/playlists/mine"),
		]);
		const serverFavorites = favorites.status === "fulfilled" ? favorites.value.data : [];
		const userId = profile.status === "fulfilled" ? profile.value.data.clerkId : undefined;
		const legacyFavorites = userId ? readLocalFavorites() : [];
		const localFavorites = uniqueSongs([...readLocalFavorites(userId),...legacyFavorites]);
		const mergedFavorites = uniqueSongs([...serverFavorites, ...localFavorites]);
		set({
			profile:profile.status === "fulfilled" ? profile.value.data : null,
			favorites:mergedFavorites,
			history:history.status === "fulfilled" ? history.value.data : [],
			myPlaylists:playlists.status === "fulfilled" ? playlists.value.data : [],
			isLoading:false,
		});
		writeLocalFavorites(mergedFavorites,userId);
		if(userId && legacyFavorites.length) { try { localStorage.removeItem(storageKey); } catch { /* storage can be disabled */ } }
		if (favorites.status === "fulfilled" && localFavorites.length) {
			const known = new Set(serverFavorites.map((song) => song._id));
			await Promise.allSettled(localFavorites.filter((song) => !known.has(song._id)).map((song) => axiosInstance.put(`/users/me/favorites/${song._id}`)));
		}
	},
	resetPersonalData: () => set({ isSignedIn:false, profile:null, history:[], myPlaylists:[], favorites:readLocalFavorites() }),
	toggleFavorite: async (song) => {
		const previous = get().favorites;
		const liked = previous.some((item) => item._id === song._id);
		const next = liked ? previous.filter((item) => item._id !== song._id) : [song, ...previous];
		set({ favorites:next });
		const userId = get().isSignedIn ? get().profile?.clerkId : undefined;
		writeLocalFavorites(next,userId);
		if (!get().isSignedIn) return;
		try {
			const method = liked ? "delete" : "put";
			const response = await axiosInstance.request<{ likedSongs:Song[] }>({ method, url:`/users/me/favorites/${song._id}` });
			const saved = uniqueSongs(response.data.likedSongs);
			set({ favorites:saved });
			writeLocalFavorites(saved,userId);
		} catch {
			set({ favorites:previous });
			writeLocalFavorites(previous,userId);
			toast.error("Could not update your liked songs.");
		}
	},
	removeDeletedSong: (songId) => {
		const state = get();
		const favorites = state.favorites.filter((song)=>song._id!==songId);
		const cleanPlaylists = (playlists:Playlist[]) => playlists.map((playlist)=>({...playlist,songs:playlist.songs.filter((song)=>song._id!==songId)}));
		set({ favorites, history:state.history.filter((entry)=>entry.songId?._id!==songId), myPlaylists:cleanPlaylists(state.myPlaylists), publicPlaylists:cleanPlaylists(state.publicPlaylists) });
		writeLocalFavorites(favorites,state.isSignedIn?state.profile?.clerkId:undefined);
	},
	recordPlay: async (song) => {
		if (!get().isSignedIn) return;
		try {
			await axiosInstance.post(`/songs/${song._id}/play`);
			set((state) => ({ history:[{ songId:song, playedAt:new Date().toISOString() }, ...state.history.filter((entry) => entry.songId?._id !== song._id)].slice(0,50) }));
		} catch { /* playback should continue if history cannot sync */ }
	},
	createPlaylist: async (title, description, visibility) => {
		const { data } = await axiosInstance.post<Playlist>("/playlists", { title, description, visibility });
		set((state) => ({ myPlaylists:[data, ...state.myPlaylists] }));
		return data;
	},
	fetchMyPlaylists: async () => {
		const { data } = await axiosInstance.get<Playlist[]>("/playlists/mine");
		set({ myPlaylists:data });
	},
	fetchPublicPlaylists: async (query = "") => {
		const { data } = await axiosInstance.get<Playlist[]>("/playlists", { params:query ? { q:query } : {} });
		set({ publicPlaylists:data });
	},
	addSongToPlaylist: async (playlistId, songId) => {
		const { data } = await axiosInstance.put<Playlist>(`/playlists/${playlistId}/songs/${songId}`);
		set((state) => ({ myPlaylists:state.myPlaylists.map((playlist) => playlist._id === data._id ? data : playlist) }));
	},
	removeSongFromPlaylist: async (playlistId, songId) => {
		const { data } = await axiosInstance.delete<Playlist>(`/playlists/${playlistId}/songs/${songId}`);
		set((state) => ({ myPlaylists:state.myPlaylists.map((playlist) => playlist._id === data._id ? data : playlist) }));
	},
	deletePlaylist: async (playlistId) => {
		await axiosInstance.delete(`/playlists/${playlistId}`);
		set((state) => ({ myPlaylists:state.myPlaylists.filter((playlist) => playlist._id !== playlistId) }));
	},
	togglePlaylistLike: async (playlist) => {
		const userId = get().profile?.clerkId;
		if (!userId) return;
		const liked = playlist.likedBy?.includes(userId) || false;
		const { data } = await axiosInstance.request<{ liked:boolean; likes:number }>({ method:liked ? "delete" : "post", url:`/playlists/${playlist._id}/like` });
		set((state) => ({ publicPlaylists:state.publicPlaylists.map((item) => item._id === playlist._id ? { ...item, likedBy:data.liked ? [...(item.likedBy || []), userId] : (item.likedBy || []).filter((id) => id !== userId) } : item) }));
	},
	toggleFollow: async (userId) => {
		const isFollowing = get().profile?.following?.includes(userId) || false;
		const response = await axiosInstance.request<{ following:string[] }>({ method:isFollowing ? "delete" : "put", url:`/users/me/following/${userId}` });
		set((state) => ({ profile:state.profile ? { ...state.profile, following:response.data.following } : null }));
	},
	updateBio: async (bio) => {
		const { data } = await axiosInstance.patch<User>("/users/me", { bio });
		set({ profile:{ ...get().profile, ...data } as User });
	},
}));
