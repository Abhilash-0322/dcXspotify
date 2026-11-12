import { create } from "zustand";
import { Song } from "@/types";
import { useChatStore } from "./useChatStore";

interface PlayerStore {
	currentSong: Song | null;
	isPlaying: boolean;
	queue: Song[];
	currentIndex: number;
	shuffle: boolean;
	repeat: "off" | "all" | "one";

	initializeQueue: (songs: Song[]) => void;
	playAlbum: (songs: Song[], startIndex?: number) => void;
	setCurrentSong: (song: Song | null) => void;
	togglePlay: () => void;
	playNext: () => void;
	playPrevious: () => void;
	toggleShuffle: () => void;
	cycleRepeat: () => void;
	removeSong: (songId: string) => void;
}

const updateActivity = (song: Song | null, playing: boolean) => {
	const socket = useChatStore.getState().socket;
	if (socket.auth) {
		socket.emit("update_activity", {
			userId: socket.auth.userId,
			activity: playing && song ? `Playing ${song.title} by ${song.artist}` : "Idle",
		});
	}
};

export const usePlayerStore = create<PlayerStore>((set, get) => ({
	currentSong: null,
	isPlaying: false,
	queue: [],
	currentIndex: -1,
	shuffle: false,
	repeat: "off",

	initializeQueue: (songs: Song[]) => {
		set({
			queue: songs,
			currentSong: get().currentSong || songs[0],
			currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
		});
	},

	playAlbum: (songs: Song[], startIndex = 0) => {
		if (songs.length === 0) return;

		const song = songs[startIndex];

		updateActivity(song, true);
		set({
			queue: songs,
			currentSong: song,
			currentIndex: startIndex,
			isPlaying: true,
		});
	},

	setCurrentSong: (song: Song | null) => {
		if (!song) return;

		updateActivity(song, true);

		const songIndex = get().queue.findIndex((s) => s._id === song._id);
		set({
			currentSong: song,
			isPlaying: true,
			currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
		});
	},

	togglePlay: () => {
		const willStartPlaying = !get().isPlaying;

		const currentSong = get().currentSong;
		updateActivity(currentSong, willStartPlaying);

		set({
			isPlaying: willStartPlaying,
		});
	},

	playNext: () => {
		const { currentIndex, queue, shuffle, repeat } = get();
		const nextIndex = shuffle && queue.length > 1
			? (() => { let candidate = currentIndex; while (candidate === currentIndex) candidate = Math.floor(Math.random() * queue.length); return candidate; })()
			: currentIndex + 1;

		// if there is a next song to play, let's play it
		if (nextIndex < queue.length) {
			const nextSong = queue[nextIndex];

			const socket = useChatStore.getState().socket;
			if (socket.auth) {
				socket.emit("update_activity", {
					userId: socket.auth.userId,
					activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
				});
			}

			set({
				currentSong: nextSong,
				currentIndex: nextIndex,
				isPlaying: true,
			});
		} else if (repeat === "all" && queue.length) {
			const firstSong = queue[0];
			updateActivity(firstSong, true);
			set({ currentSong: firstSong, currentIndex: 0, isPlaying: true });
		} else {
			// no next song
			set({ isPlaying: false });

			updateActivity(null, false);
		}
	},
	playPrevious: () => {
		const { currentIndex, queue, shuffle } = get();
		if (shuffle && queue.length > 1) {
			const prevIndex = Math.floor(Math.random() * queue.length);
			const prevSong = queue[prevIndex];
			updateActivity(prevSong, true);
			set({ currentSong: prevSong, currentIndex: prevIndex, isPlaying: true });
			return;
		}
		const prevIndex = currentIndex - 1;

		// theres a prev song
		if (prevIndex >= 0) {
			const prevSong = queue[prevIndex];

			updateActivity(prevSong, true);

			set({
				currentSong: prevSong,
				currentIndex: prevIndex,
				isPlaying: true,
			});
		} else {
			// no prev song
			set({ isPlaying: false });

			updateActivity(null, false);
		}
	},
	toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
	cycleRepeat: () => set((state) => ({ repeat: state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off" })),
	removeSong: (songId) => {
		const { queue, currentSong, currentIndex, isPlaying } = get();
		const nextQueue = queue.filter((song) => song._id !== songId);
		if (currentSong?._id !== songId) {
			const removedBefore = queue.slice(0,currentIndex).filter((song) => song._id === songId).length;
			set({ queue:nextQueue, currentIndex:Math.max(-1,currentIndex-removedBefore) });
			return;
		}
		const nextIndex = Math.min(currentIndex,nextQueue.length-1);
		const nextSong = nextQueue[nextIndex] || null;
		if (nextSong && isPlaying) updateActivity(nextSong,true);
		else updateActivity(null,false);
		set({ queue:nextQueue, currentSong:nextSong, currentIndex:nextSong ? nextIndex : -1, isPlaying:!!nextSong && isPlaying });
	},
}));
