import { useEffect, useRef, useState } from "react";
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { duration, useCatalog, useDeck } from "./store";
import toast from "react-hot-toast";
import { useChatStore } from "@/stores/useChatStore";
export function Player({ onQueue }: { onQueue: () => void }) {
  const audio = useRef<HTMLAudioElement>(null);
  const deck = useDeck();
  const catalog = useCatalog();
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [timer, setTimer] = useState(false);
  const recorded = useRef(false);
  useEffect(() => {
    recorded.current = false;
    setTime(0);
    setLength(0);
  }, [deck.song?._id]);
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (deck.playing)
      a.play().catch(() => {
        useDeck.setState({ playing: false });
        toast.error("Playback could not start. Try pressing play again.");
      });
    else a.pause();
  }, [deck.playing, deck.song?.audioUrl]);
  useEffect(() => {
    if (audio.current) audio.current.volume = deck.volume;
  }, [deck.volume]);
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = useDeck.getState();
      if (s.sleepAt && Date.now() >= s.sleepAt) {
        useDeck.setState({ playing: false, sleepAt: null });
        toast("Sleep timer finished");
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'input,textarea,select,button,a,[contenteditable="true"]',
        )
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        useDeck.getState().toggle();
      }
      if (e.altKey && e.key === "ArrowRight") useDeck.getState().next();
      if (e.altKey && e.key === "ArrowLeft") useDeck.getState().previous();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const connected = useChatStore((s) => s.isConnected);
  useEffect(() => {
    if (connected)
      useChatStore.getState().socket.emit("update_activity", {
        activity:
          deck.playing && deck.song
            ? `Playing ${deck.song.title} by ${deck.song.artist}`
            : "Idle",
      });
  }, [connected, deck.playing, deck.song]);
  const song = deck.song;
  return (
    <footer className="amp-player">
      <audio
        ref={audio}
        src={song?.audioUrl}
        preload="metadata"
        onLoadedMetadata={() => setLength(audio.current?.duration || 0)}
        onTimeUpdate={() => {
          const a = audio.current;
          if (!a) return;
          setTime(a.currentTime);
          if (
            a.currentTime >= Math.min(10, a.duration / 2) &&
            !recorded.current &&
            song
          ) {
            recorded.current = true;
            catalog.record(song);
          }
        }}
        onEnded={() => {
          if (deck.repeat === "one" && audio.current) {
            audio.current.currentTime = 0;
            audio.current
              .play()
              .catch(() => useDeck.setState({ playing: false }));
          } else deck.next(true);
        }}
        onError={() => {
          useDeck.setState({ playing: false });
          if (song) toast.error("This audio file is unavailable");
        }}
      />
      <div className="amp-now">
        {song ? (
          <>
            <img src={song.imageUrl} alt="" />
            <div>
              <Link to={`/track/${song._id}`}>{song.title}</Link>
              <span>{song.artist}</span>
            </div>
            <button
              className={
                catalog.profile.likes.some((s) => s._id === song._id)
                  ? "active"
                  : ""
              }
              aria-label="Like current song"
              onClick={() => catalog.like(song)}
            >
              <Heart size={17} />
            </button>
          </>
        ) : (
          <>
            <div className="amp-mini-art">
              <ListMusic />
            </div>
            <div>
              <strong>Your next favorite awaits</strong>
              <span>Choose a track to begin</span>
            </div>
          </>
        )}
      </div>
      <div className="amp-transport">
        <div>
          <button
            aria-label="Toggle shuffle"
            aria-pressed={deck.shuffle}
            className={deck.shuffle ? "active" : ""}
            onClick={() => useDeck.setState({ shuffle: !deck.shuffle })}
          >
            <Shuffle size={17} />
          </button>
          <button aria-label="Previous track" onClick={deck.previous}>
            <SkipBack size={19} />
          </button>
          <button
            className="amp-play-main"
            aria-label={deck.playing ? "Pause" : "Play"}
            disabled={!song}
            onClick={deck.toggle}
          >
            {deck.playing ? (
              <Pause size={19} fill="currentColor" />
            ) : (
              <Play size={19} fill="currentColor" />
            )}
          </button>
          <button aria-label="Next track" onClick={() => deck.next()}>
            <SkipForward size={19} />
          </button>
          <button
            className={deck.repeat !== "off" ? "active" : ""}
            aria-label={`Repeat: ${deck.repeat}`}
            onClick={() =>
              useDeck.setState({
                repeat:
                  deck.repeat === "off"
                    ? "all"
                    : deck.repeat === "all"
                      ? "one"
                      : "off",
              })
            }
          >
            {deck.repeat === "one" ? (
              <Repeat1 size={17} />
            ) : (
              <Repeat size={17} />
            )}
          </button>
        </div>
        <label className="amp-seek">
          <span>{duration(time)}</span>
          <input
            aria-label="Playback position"
            type="range"
            min={0}
            max={length || 1}
            step={0.1}
            value={Math.min(time, length || 1)}
            onChange={(e) => {
              if (audio.current)
                audio.current.currentTime = Number(e.target.value);
              setTime(Number(e.target.value));
            }}
          />
          <span>{duration(length || song?.duration || 0)}</span>
        </label>
      </div>
      <div className="amp-player-extras">
        <div className="amp-timer">
          <button
            aria-label="Sleep timer"
            className={deck.sleepAt ? "active" : ""}
            onClick={() => setTimer(!timer)}
          >
            <Moon size={18} />
          </button>
          {timer && (
            <div className="amp-popover">
              {[15, 30, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    useDeck.setState({ sleepAt: Date.now() + m * 60000 });
                    setTimer(false);
                    toast.success(`Stopping in ${m} minutes`);
                  }}
                >
                  {m} minutes
                </button>
              ))}
              <button
                onClick={() => {
                  useDeck.setState({ sleepAt: null });
                  setTimer(false);
                }}
              >
                Turn off timer
              </button>
            </div>
          )}
        </div>
        <button aria-label="Open queue" onClick={onQueue}>
          <ListMusic size={19} />
        </button>
        <button
          aria-label="Toggle mute"
          onClick={() => useDeck.setState({ volume: deck.volume ? 0 : 0.7 })}
        >
          {deck.volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        <input
          aria-label="Volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={deck.volume}
          onChange={(e) => useDeck.setState({ volume: Number(e.target.value) })}
        />
      </div>
    </footer>
  );
}
