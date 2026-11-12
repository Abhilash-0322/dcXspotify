import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Heart, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume1, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious, shuffle, toggleShuffle, repeat, cycleRepeat, likedSongs, toggleLike } = usePlayerStore();

	const [volume, setVolume] = useState(75);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const isLiked = !!currentSong && likedSongs.some((song) => song._id === currentSong._id);

	useEffect(() => {
		audioRef.current = document.querySelector("audio");

		const audio = audioRef.current;
		if (!audio) return;

		const updateTime = () => setCurrentTime(audio.currentTime);
		const updateDuration = () => setDuration(audio.duration);

		audio.addEventListener("timeupdate", updateTime);
		audio.addEventListener("loadedmetadata", updateDuration);

		return () => {
			audio.removeEventListener("timeupdate", updateTime);
			audio.removeEventListener("loadedmetadata", updateDuration);
		};
	}, [currentSong]);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			audioRef.current.currentTime = value[0];
		}
	};

	return (
		<footer className='player-bar px-4'>
			<div className='flex justify-between items-center h-full max-w-[1800px] mx-auto'>
				{/* currently playing song */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%]'>
					{currentSong && (
						<>
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
							className='w-14 h-14 object-cover rounded-lg player-cover'
							/>
							<div className='flex-1 min-w-0'>
							<div className='font-semibold truncate'>
									{currentSong.title}
								</div>
							<div className='text-sm text-zinc-400 truncate'>
									{currentSong.artist}
								</div>
							</div>
						</>
					)}
					{currentSong && <button className={`player-like ${isLiked ? "is-liked" : ""}`} onClick={() => toggleLike(currentSong)} aria-label={isLiked ? "Remove from liked songs" : "Add to liked songs"}><Heart size={17} fill={isLiked ? "currentColor" : "none"} /></button>}
				</div>

				{/* player controls*/}
				<div className='flex flex-col items-center gap-2 flex-1 max-w-full sm:max-w-[45%]'>
					<div className='flex items-center gap-4 sm:gap-6'>
						<Button
							size='icon'
							variant='ghost'
							className={`hidden sm:inline-flex ${shuffle ? "text-emerald-400" : "text-zinc-400"}`}
							onClick={toggleShuffle}
							aria-label={shuffle ? "Turn shuffle off" : "Turn shuffle on"}
						>
							<Shuffle className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-4 w-4' />
						</Button>

						<Button
							size='icon'
							className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='hover:text-white text-zinc-400'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-4 w-4' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className={`hidden sm:inline-flex ${repeat !== "off" ? "text-emerald-400" : "text-zinc-400"}`}
							onClick={cycleRepeat}
							aria-label={`Repeat ${repeat}`}
						>
							<span className='repeat-control'><Repeat className='h-4 w-4' />{repeat === "one" && <small>1</small>}</span>
						</Button>
					</div>

					<div className='hidden sm:flex items-center gap-2 w-full'>
						<div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={handleSeek}
						/>
						<div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
					</div>
				</div>
				{/* volume controls */}
				<div className='hidden sm:flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
					<div className='flex items-center gap-2'>
								<Button size='icon' variant='ghost' className='hover:text-white text-zinc-400' onClick={() => { const next = volume === 0 ? 75 : 0; setVolume(next); if (audioRef.current) audioRef.current.volume = next / 100; }} aria-label={volume === 0 ? "Unmute" : "Mute"}>
											{volume === 0 ? <VolumeX className='h-4 w-4' /> : <Volume1 className='h-4 w-4' />}
						</Button>

						<Slider
							value={[volume]}
							max={100}
							step={1}
							className='w-24 hover:cursor-grab active:cursor-grabbing'
							onValueChange={(value) => {
								setVolume(value[0]);
								if (audioRef.current) {
									audioRef.current.volume = value[0] / 100;
								}
							}}
						/>
					</div>
				</div>
			</div>
		</footer>
	);
};
