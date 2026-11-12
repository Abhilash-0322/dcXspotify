import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Play,
  Pause,
  SkipForward,
  Sparkles,
  Orbit,
  AudioLines,
  Heart,
  Bookmark,
  Trash2,
  Shuffle,
  Check,
  SlidersHorizontal,
  Moon,
  Volume2,
  Radio,
} from "lucide-react";
import { useCatalog, useDeck, duration } from "@/amplify/store";
import {
  Empty,
  SectionTitle,
  SongCards,
  TrackList,
} from "@/amplify/components";
import { dailyTracks, shuffled, useNight } from "./state";
import toast from "react-hot-toast";
export function Orb({ playing = true }: { playing?: boolean }) {
  return (
    <div
      className={`night-orb ${playing ? "is-playing" : "is-paused"}`}
      aria-hidden="true"
    >
      <div className="night-orb-glow" />
      <div className="night-orb-core" />
      <div className="night-ring ring-a" />
      <div className="night-ring ring-b" />
      <div className="night-ring ring-c" />
      <span className="night-star star-a" />
      <span className="night-star star-b" />
      <span className="night-star star-c" />
      <div className="night-orb-caption">
        <span /> SOUND WITHOUT LIMITS
      </div>
    </div>
  );
}
const presets = [
  {
    id: "afterhours",
    number: "01",
    name: "After hours",
    description: "A different rotation. Every night.",
    symbol: "◒",
    color: "purple",
  },
  {
    id: "familiar",
    number: "02",
    name: "Inner circle",
    description: "The artists you keep coming back to.",
    symbol: "◎",
    color: "green",
  },
  {
    id: "unheard",
    number: "03",
    name: "Off the grid",
    description: "Step beyond your recent listens.",
    symbol: "✳",
    color: "blue",
  },
  {
    id: "favorites",
    number: "04",
    name: "Close to you",
    description: "The tracks you’ve already fallen for.",
    symbol: "♡",
    color: "rose",
  },
];
export function NightHome() {
  const { songs, profile } = useCatalog();
  const play = useDeck((s) => s.play);
  const daily = useMemo(() => dailyTracks(songs), [songs]);
  return (
    <>
      <header className="night-page-heading">
        <div>
          <span className="night-kicker">
            <span /> YOUR AFTER-DARK SOUNDTRACK
          </span>
          <h1>
            Welcome to your <em>night shift.</em>
          </h1>
          <p>
            New frequencies. Familiar feelings. A world worth getting lost in.
          </p>
        </div>
        <Link className="night-outline" to="/sessions">
          <SlidersHorizontal size={15} /> Shape your sound
        </Link>
      </header>
      <div className="night-hero-grid">
        <section className="night-hero">
          <div className="night-hero-gridlines" aria-hidden="true" />
          <div className="night-hero-copy">
            <span className="night-label">
              <Sparkles size={13} /> THE NOCTURNE EXPERIENCE
            </span>
            <h2>
              Stay up.
              <br />
              Tune <span>in.</span>
            </h2>
            <p>
              For the songs that find you
              <br />
              when the world goes quiet.
            </p>
            <div className="night-hero-actions">
              <button
                disabled={!daily.length}
                className="amp-button"
                onClick={() => play(daily)}
              >
                <Play size={16} fill="currentColor" /> Enter the frequency
              </button>
              <Link
                to="/focus"
                aria-label="Open focus room"
                className="night-circle"
              >
                <ArrowUpRight size={20} />
              </Link>
            </div>
            <span className="night-hero-footnote">
              <AudioLines size={14} /> YOUR MUSIC. A DIFFERENT DIMENSION.
            </span>
          </div>
          <Orb />
          <span className="night-hero-coordinate">
            N° 001 / LIMITLESS DISCOVERY
          </span>
        </section>
        <aside className="night-rotation">
          <header>
            <span className="night-kicker">A NEW ORBIT, EVERY DAY</span>
            <h2>
              Tonight’s rotation<span>↗</span>
            </h2>
            <p>Daily discoveries from your catalog.</p>
          </header>
          <div>
            {daily.slice(0, 3).map((s, i) => (
              <button key={s._id} onClick={() => play(daily, i)}>
                <span className="night-order">0{i + 1}</span>
                <img src={s.imageUrl} alt="" />
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.artist}</small>
                </span>
                <Play size={14} />
              </button>
            ))}
          </div>
          <Link to="/radar" className="night-rotation-link">
            Find something unexpected <ArrowRight size={16} />
          </Link>
          <div className="night-wave" aria-hidden="true">
            {Array.from({ length: 35 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: `${15 + ((i * 17) % 35)}px`,
                  animationDelay: `${i * -0.14}s`,
                }}
              />
            ))}
          </div>
          <span className="night-rotation-bottom">
            LESS NOISE. MORE CONNECTION.
          </span>
        </aside>
      </div>
      <SectionTitle
        eyebrow="FIND YOUR STATE OF MIND"
        title="Where do you want to go?"
        to="/sessions"
      />
      <div className="night-moods">
        {presets.map((p) => (
          <Link
            key={p.id}
            className={`night-mood ${p.color}`}
            to={`/sessions?preset=${p.id}`}
          >
            <div>
              <span>{p.number} / SESSION</span>
              <ArrowUpRight size={19} />
            </div>
            <i aria-hidden="true">{p.symbol}</i>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
          </Link>
        ))}
      </div>
      <SectionTitle
        eyebrow="GOOD THINGS DESERVE ANOTHER LISTEN"
        title={profile.likes.length ? "In your orbit" : "Worth the late night"}
        to="/discover"
      />
      {songs.length ? (
        <SongCards
          songs={(profile.likes.length ? profile.likes : daily).slice(0, 5)}
        />
      ) : (
        <Empty title="Your sound starts here">
          Add music in Creator Studio to bring your night to life.
        </Empty>
      )}
      <Link to="/focus" className="night-focus-banner">
        <div className="night-focus-symbol" aria-hidden="true">
          ✳
        </div>
        <div>
          <span className="night-kicker">
            LESS DISTRACTION. MORE IMMERSION.
          </span>
          <h2>Go somewhere only music can take you.</h2>
          <p>Open the focus room. Let everything else fade.</p>
        </div>
        <span className="night-outline">
          Enter focus room <ArrowUpRight size={17} />
        </span>
      </Link>
    </>
  );
}
export function Sessions() {
  const { songs, profile } = useCatalog();
  const [params] = useSearchParams();
  const [preset, setPreset] = useState(params.get("preset") || "afterhours");
  const [count, setCount] = useState(8);
  const [artist, setArtist] = useState("all");
  const [name, setName] = useState("My midnight mix");
  const [revision, setRevision] = useState(0);
  const night = useNight();
  const tracks = useMemo(() => {
    let pool = songs.filter((s) => artist === "all" || s.artist === artist);
    if (preset === "favorites")
      pool = pool.filter((s) => profile.likes.some((l) => l._id === s._id));
    if (preset === "unheard")
      pool = pool.filter(
        (s) => !profile.history.some((h) => h.song?._id === s._id),
      );
    if (preset === "familiar")
      pool = pool.filter(
        (s) =>
          profile.artists.includes(s.artist) ||
          profile.likes.some((l) => l.artist === s.artist),
      );
    return (revision ? shuffled(pool) : dailyTracks(pool)).slice(0, count);
  }, [songs, profile, artist, preset, count, revision]);
  return (
    <>
      <header className="night-page-heading">
        <div>
          <span className="night-kicker">BUILT AROUND YOU</span>
          <h1>
            Make the night <em>your own.</em>
          </h1>
          <p>
            A mix for your moment. Choose a starting point, then make it yours.
          </p>
        </div>
        <span className="night-device-note">Saved on this device</span>
      </header>
      <div className="night-session-layout">
        <aside className="night-session-controls">
          <h2>Your session</h2>
          <label>
            Starting point
            <select value={preset} onChange={(e) => setPreset(e.target.value)}>
              {presets.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <p className="night-rule-note">
            {preset === "familiar"
              ? "Tracks from artists you follow or have liked."
              : preset === "unheard"
                ? "Tracks outside your recent listening history."
                : preset === "favorites"
                  ? "A fresh order for the music in your favorites."
                  : "A fresh daily rotation from the full catalog."}
          </p>
          <label>
            Artist
            <select value={artist} onChange={(e) => setArtist(e.target.value)}>
              <option value="all">Across the spectrum</option>
              {[...new Set(songs.map((s) => s.artist))].sort().map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </label>
          <label>
            Number of tracks <strong>{count}</strong>
            <input
              aria-label="Number of tracks"
              type="range"
              min={1}
              max={Math.max(1, Math.min(songs.length, 30))}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <label>
            Session name
            <input
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <button
            className="amp-button"
            disabled={!tracks.length}
            onClick={() => useDeck.getState().play(tracks)}
          >
            <Play size={16} /> Start session
          </button>
          <button
            className="night-outline"
            disabled={!tracks.length}
            onClick={() => {
              night.save(name, tracks);
              toast.success("Session saved on this device");
            }}
          >
            <Bookmark size={16} /> Save this mix
          </button>
        </aside>
        <section>
          <div className="night-session-summary">
            <div>
              <span className="night-kicker">YOUR NEXT CHAPTER</span>
              <h2>
                {tracks.length} tracks.{" "}
                {duration(tracks.reduce((n, s) => n + s.duration, 0))} of
                escape.
              </h2>
            </div>
            <button
              className="night-circle"
              aria-label="Reshuffle session"
              onClick={() => setRevision((n) => n + 1)}
            >
              <Shuffle size={18} />
            </button>
          </div>
          <TrackList songs={tracks} />
        </section>
      </div>
      <SectionTitle
        eyebrow="PICK UP WHERE YOU LEFT OFF"
        title="Your saved sessions"
      />
      {night.sessions.length ? (
        <div className="night-saved-grid">
          {night.sessions.map((session) => {
            const resolved = session.songIds
              .map((id) => songs.find((s) => s._id === id))
              .filter((s) => s !== undefined);
            return (
              <article key={session.id}>
                <Bookmark size={24} />
                <h3>{session.name}</h3>
                <p>
                  {resolved.length} available tracks ·{" "}
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
                <div>
                  <button
                    className="night-outline"
                    disabled={!resolved.length}
                    onClick={() => useDeck.getState().play(resolved)}
                  >
                    <Play size={14} /> Play
                  </button>
                  <button
                    aria-label={`Remove saved session ${session.name}`}
                    onClick={() => night.remove(session.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty title="Keep a moment for later">
          Save a session and return to it whenever the mood strikes.
        </Empty>
      )}
    </>
  );
}
export function Radar() {
  const { songs, profile, like } = useCatalog();
  const { skipped, skip, reset } = useNight();
  const deck = useDeck();
  const [busy, setBusy] = useState(false);
  const candidates = dailyTracks(songs).filter(
    (s) =>
      !skipped.includes(s._id) && !profile.likes.some((l) => l._id === s._id),
  );
  const song = candidates[0];
  return (
    <>
      <header className="night-page-heading">
        <div>
          <span className="night-kicker">
            <Radio size={13} /> DISCOVERY DECK
          </span>
          <h1>
            Something you haven’t <em>felt yet.</em>
          </h1>
          <p>
            One track at a time. Give it a listen, keep what connects, skip what
            doesn’t.
          </p>
        </div>
        <span className="night-device-note">
          {candidates.length} left to explore
        </span>
      </header>
      {song ? (
        <section className="night-radar">
          <div className="night-radar-art" key={song._id}>
            <img src={song.imageUrl} alt={`${song.title} cover`} />
            <div className="night-radar-tag">
              <Sparkles size={14} /> OUTSIDE YOUR ROTATION
            </div>
            <button
              className="night-radar-play"
              aria-label={
                deck.song?._id === song._id && deck.playing
                  ? "Pause preview"
                  : `Listen to ${song.title}`
              }
              onClick={() =>
                deck.song?._id === song._id ? deck.toggle() : deck.play([song])
              }
            >
              {deck.song?._id === song._id && deck.playing ? (
                <Pause size={25} />
              ) : (
                <Play size={25} fill="currentColor" />
              )}
            </button>
          </div>
          <div className="night-radar-copy">
            <span className="night-kicker">LET YOUR EARS DECIDE</span>
            <h2>{song.title}</h2>
            <Link to={`/artist/${encodeURIComponent(song.artist)}`}>
              {song.artist} <ArrowUpRight size={15} />
            </Link>
            <p>
              Great discoveries don’t need a reason.
              <br />
              Sometimes a song just finds you.
            </p>
            <div className="night-radar-actions">
              <button
                className="amp-button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await like(song);
                  setBusy(false);
                }}
              >
                <Heart size={17} /> Save to favorites
              </button>
              <button
                className="night-outline"
                onClick={() => {
                  if (deck.song?._id === song._id)
                    useDeck.setState({ playing: false });
                  skip(song._id);
                }}
              >
                <SkipForward size={17} /> Next discovery
              </button>
            </div>
            <small>
              Skipped tracks are remembered on this device.
              <br />
              Favorites sync when you sign in.
            </small>
          </div>
        </section>
      ) : (
        <Empty title="You’ve reached the edge of this orbit">
          More music means more discoveries. Reset your skipped tracks to take
          another look.
        </Empty>
      )}
      <button className="amp-text-button night-reset" onClick={reset}>
        Reset skipped tracks <ArrowRight size={14} />
      </button>
    </>
  );
}
export function Focus() {
  const deck = useDeck();
  const { songs } = useCatalog();
  const { motion, configure } = useNight();
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!deck.playing) return;
    const timer = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [deck.playing]);
  return (
    <section className={`night-focus ${deck.playing ? "playing" : ""}`}>
      <header>
        <span className="night-kicker">
          <Moon size={14} /> THE FOCUS ROOM
        </span>
        <button
          className="night-outline"
          onClick={() => configure({ motion: !motion })}
        >
          {motion ? "Pause visuals" : "Enable visuals"}
        </button>
        <Link className="night-outline" to="/">
          Exit focus <ArrowUpRight size={14} />
        </Link>
      </header>
      <Orb playing={deck.playing} />
      <div className="night-focus-info">
        <span className="night-kicker">
          {deck.playing
            ? "LET EVERYTHING ELSE FADE"
            : "A LITTLE SPACE TO BREATHE"}
        </span>
        <h1>{deck.song?.title || "Find your frequency."}</h1>
        <p>
          {deck.song?.artist || "Choose a track, settle in, and stay a while."}
        </p>
        <div className="night-focus-controls">
          <button
            className="night-circle"
            aria-label="Previous track"
            onClick={deck.previous}
          >
            <SkipForward className="night-previous" size={22} />
          </button>
          <button
            className="night-focus-play"
            aria-label={
              deck.playing ? "Pause focus session" : "Play focus session"
            }
            disabled={!deck.song && !songs.length}
            onClick={() =>
              deck.song ? deck.toggle() : deck.play(dailyTracks(songs))
            }
          >
            {deck.playing ? (
              <Pause size={26} />
            ) : (
              <Play size={26} fill="currentColor" />
            )}
          </button>
          <button
            className="night-circle"
            aria-label="Next track"
            onClick={() => deck.next()}
          >
            <SkipForward size={22} />
          </button>
        </div>
        <span className="night-focus-time">
          <Volume2 size={13} /> {duration(elapsed)} spent listening in this room
        </span>
        <Link to="/sessions" className="amp-text-button">
          Build a longer session <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
export function Appearance() {
  const night = useNight();
  return (
    <div className="night-appearance">
      <button
        aria-label="Toggle animations"
        aria-pressed={night.motion}
        title={night.motion ? "Pause animations" : "Enable animations"}
        onClick={() => night.configure({ motion: !night.motion })}
      >
        {night.motion ? <Orbit size={17} /> : <Pause size={17} />}
      </button>
      <div aria-label="Accent color" className="night-accents">
        {(["lime", "violet", "ice"] as const).map((color) => (
          <button
            key={color}
            aria-label={`${color} accent`}
            aria-pressed={night.accent === color}
            className={`accent-${color}`}
            onClick={() => night.configure({ accent: color })}
          >
            {night.accent === color && <Check size={9} />}
          </button>
        ))}
      </div>
    </div>
  );
}
