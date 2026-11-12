import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Heart,
  Plus,
  X,
  Music2,
  ListPlus,
  ArrowUpRight,
} from "lucide-react";
import { useCatalog, useDeck, duration, type Collection } from "./store";
import type { Song } from "@/types";
import { useAuth, SignInButton } from "@clerk/clerk-react";
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="amp-empty">
      <Music2 size={32} />
      <h3>{title}</h3>
      <p>{children || "Your next discovery is just a play away."}</p>
      <Link className="amp-button secondary" to="/discover">
        Explore music <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
export function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  const [previous] = useState(
    () => document.activeElement as HTMLElement | null,
  );
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key !== "Tab") return;
      const items = dialog.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled),a[href],input,textarea,select",
      );
      if (!items?.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [previous]);
  return (
    <div className="amp-backdrop" onClick={close}>
      <section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="amp-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h2>{title}</h2>
          <button autoFocus aria-label="Close dialog" onClick={close}>
            <X />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function CreateList({ close }: { close: () => void }) {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const create = useCatalog((s) => s.createList);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setPublic] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Make room for a new mood." close={close}>
      {!isSignedIn ? (
        <div className="amp-empty">
          <p>
            Sign in to create playlists and sync your library across devices.
          </p>
          <SignInButton mode="modal">
            <button className="amp-button">Sign in to continue</button>
          </SignInButton>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const list = await create(name, description, isPublic);
            setBusy(false);
            if (list) {
              close();
              navigate(`/playlist/${list._id}`);
            }
          }}
        >
          <label>
            Playlist name
            <input
              required
              maxLength={80}
              placeholder="Sunday state of mind"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            A little description
            <textarea
              maxLength={500}
              placeholder="The soundtrack to…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label className="amp-checkbox">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setPublic(e.target.checked)}
            />{" "}
            Share with the community
          </label>
          <button disabled={busy || !name.trim()} className="amp-button">
            {busy ? "Creating…" : "Create playlist"}
            <Plus size={16} />
          </button>
        </form>
      )}
    </Modal>
  );
}
export function AddToList({ song, close }: { song: Song; close: () => void }) {
  const { collections, saveList } = useCatalog();
  const [busy, setBusy] = useState(false);
  return (
    <Modal title="Add to a playlist" close={close}>
      {collections.length ? (
        <div className="amp-picker">
          {collections.map((p) => (
            <button
              disabled={busy || p.songs.some((s) => s._id === song._id)}
              key={p._id}
              onClick={async () => {
                setBusy(true);
                const ok = await saveList(p._id, {
                  songs: [...p.songs.map((s) => s._id), song._id],
                });
                setBusy(false);
                if (ok) close();
              }}
            >
              <span>
                {p.name}
                <small>{p.songs.length} tracks</small>
              </span>
              <Plus size={18} />
            </button>
          ))}
        </div>
      ) : (
        <p>
          Create a playlist from the sidebar to start collecting your favorites.
        </p>
      )}
    </Modal>
  );
}
export function TrackList({
  songs,
  remove,
  move,
}: {
  songs: Song[];
  remove?: (id: string) => void;
  move?: (index: number) => void;
}) {
  const { song, playing, play, toggle, add } = useDeck();
  const { profile, like } = useCatalog();
  const [selected, setSelected] = useState<Song | null>(null);
  if (!songs.length)
    return (
      <Empty title="A little quiet here">
        Add music from Discover to make this space yours.
      </Empty>
    );
  return (
    <>
      <div className="amp-tracks">
        <div className="amp-track-head">
          <span>#</span>
          <span>TRACK / ARTIST</span>
          <span className="amp-track-time">TIME</span>
          <span />
        </div>
        {songs.map((s, i) => (
          <div
            key={`${s._id}-${i}`}
            className={`amp-track ${song?._id === s._id ? "current" : ""}`}
          >
            <button
              className="amp-track-number"
              aria-label={`Play ${s.title}`}
              onClick={() => (song?._id === s._id ? toggle() : play(songs, i))}
            >
              {song?._id === s._id && playing ? (
                <span className="amp-equalizer">▥</span>
              ) : (
                <>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <Play size={15} />
                </>
              )}
            </button>
            <div className="amp-track-title">
              <img src={s.imageUrl} alt="" loading="lazy" />
              <div>
                <Link to={`/track/${s._id}`}>{s.title}</Link>
                <Link to={`/artist/${encodeURIComponent(s.artist)}`}>
                  {s.artist}
                </Link>
              </div>
            </div>
            <span className="amp-track-time">{duration(s.duration)}</span>
            <div className="amp-track-actions">
              <button
                aria-label={`Like ${s.title}`}
                className={
                  profile.likes.some((x) => x._id === s._id) ? "active" : ""
                }
                onClick={() => like(s)}
              >
                <Heart size={16} />
              </button>
              <button aria-label={`Queue ${s.title}`} onClick={() => add(s)}>
                <ListPlus size={17} />
              </button>
              <button
                aria-label={`Add ${s.title} to playlist`}
                onClick={() => setSelected(s)}
              >
                <Plus size={17} />
              </button>
              {move && i > 0 && (
                <button
                  aria-label={`Move ${s.title} up`}
                  onClick={() => move(i)}
                >
                  ↑
                </button>
              )}
              {remove && (
                <button
                  aria-label={`Remove ${s.title}`}
                  onClick={() => remove(s._id)}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <AddToList song={selected} close={() => setSelected(null)} />
      )}
    </>
  );
}
export function SongCards({ songs }: { songs: Song[] }) {
  const play = useDeck((s) => s.play);
  return (
    <div className="amp-card-grid">
      {songs.map((song, i) => (
        <article className="amp-song-card" key={song._id}>
          <div className="amp-cover">
            <Link to={`/track/${song._id}`}>
              <img
                src={song.imageUrl}
                alt={`${song.title} cover`}
                loading="lazy"
              />
            </Link>
            <button
              aria-label={`Play ${song.title}`}
              onClick={() => play(songs, i)}
            >
              <Play size={20} fill="currentColor" />
            </button>
          </div>
          <Link to={`/track/${song._id}`}>{song.title}</Link>
          <Link
            className="amp-muted"
            to={`/artist/${encodeURIComponent(song.artist)}`}
          >
            {song.artist}
          </Link>
        </article>
      ))}
    </div>
  );
}
export function CollectionCards({ lists }: { lists: Collection[] }) {
  return (
    <div className="amp-card-grid">
      {lists.map((p, i) => (
        <Link className="amp-song-card" key={p._id} to={`/playlist/${p._id}`}>
          <div className={`amp-list-art tone-${i % 4}`}>
            {p.songs[0] ? (
              <img src={p.songs[0].imageUrl} alt="" />
            ) : (
              <Music2 size={48} />
            )}
            <span>{String(i + 1).padStart(2, "0")}</span>
          </div>
          <strong>{p.name}</strong>
          <span className="amp-muted">
            {p.songs.length} tracks · {p.isPublic ? "Public" : "Private"}
          </span>
        </Link>
      ))}
    </div>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  to,
}: {
  eyebrow?: string;
  title: string;
  to?: string;
}) {
  return (
    <div className="amp-section-title">
      <div>
        {eyebrow && <span className="amp-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {to && (
        <Link to={to}>
          View all <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}
