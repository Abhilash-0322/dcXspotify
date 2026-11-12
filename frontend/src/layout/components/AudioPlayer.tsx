import { usePlayerStore } from "@/stores/usePlayerStore";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
	const audioRef = useRef<HTMLAudioElement>(null);
	const prevSongRef = useRef<string | null>(null);
	const historySongRef = useRef<string | null>(null);

	const { currentSong, isPlaying, playNext, repeat } = usePlayerStore();

	// handle play/pause logic
	useEffect(() => {
		if (isPlaying) void audioRef.current?.play().catch(() => undefined);
		else audioRef.current?.pause();
	}, [isPlaying]);

	// handle song ends
	useEffect(() => {
		const audio = audioRef.current;

		const handleEnded = () => {
			if (repeat === "one" && audio) {
				audio.currentTime = 0;
				void audio.play().catch(() => undefined);
			} else playNext();
		};

		audio?.addEventListener("ended", handleEnded);

		return () => audio?.removeEventListener("ended", handleEnded);
	}, [playNext, repeat]);

	// handle song changes
	useEffect(() => {
		if (!audioRef.current || !currentSong) return;

		const audio = audioRef.current;

		// check if this is actually a new song
		const isSongChange = prevSongRef.current !== currentSong?.audioUrl;
		if (isSongChange) {
			audio.src = currentSong?.audioUrl;
			// reset the playback position
			audio.currentTime = 0;

			prevSongRef.current = currentSong?.audioUrl;

			if (isPlaying) void audio.play().catch(() => undefined);
		}
	}, [currentSong, isPlaying]);

	useEffect(() => {
		if (!isPlaying || !currentSong || historySongRef.current === currentSong._id) return;
		historySongRef.current = currentSong._id;
		void useLibraryStore.getState().recordPlay(currentSong);
	}, [currentSong, isPlaying]);

	return <audio ref={audioRef} />;
};
export default AudioPlayer;
