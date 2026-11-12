import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Plus,
  Headphones,
  Disc3,
  Heart,
  Music2,
  Users,
  Clock3,
  Globe,
  Lock,
  Pencil,
  Share2,
  Trash2,
  Send,
  Radio,
  Check,
} from "lucide-react";
import { SignInButton, useAuth, useUser } from "@clerk/clerk-react";
import { useCatalog, useDeck, duration, type Collection } from "./store";
import {
  CollectionCards,
  Empty,
  Modal,
  SectionTitle,
  SongCards,
  TrackList,
} from "./components";
import type { Song } from "@/types";
import { axiosInstance as api } from "@/lib/axios";
import { useChatStore } from "@/stores/useChatStore";
import toast from "react-hot-toast";
function Heading({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="amp-heading">
      <div>
        <span className="amp-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {children}
    </header>
  );
}
function Home() {
  const { songs, albums, profile } = useCatalog();
  const play = useDeck((s) => s.play);
  const { user } = useUser();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const recommendations = useMemo(() => {
    const artists = new Set([
      ...profile.artists,
      ...profile.likes.map((s) => s.artist),
    ]);
    const match = songs.filter(
      (s) =>
        artists.has(s.artist) && !profile.likes.some((l) => l._id === s._id),
    );
    return [...match, ...songs.filter((s) => !match.includes(s))].slice(0, 5);
  }, [songs, profile]);
  return (
    <>
      <Heading
        eyebrow="YOUR WORLD, IN SOUND"
        title={`${greeting}${user?.firstName ? `, ${user.firstName}` : ""}.`}
        text="A fresh soundtrack for whatever today brings."
      >
        <span className="amp-date">
          {new Date().toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            weekday: "short",
          })}
        </span>
      </Heading>
      <section className="amp-hero">
        <div className="amp-hero-copy">
          <span className="amp-pill">
            <span /> THE DAILY DISCOVERY
          </span>
          <h2>
            Less scrolling.
            <br />
            More <em>feeling.</em>
          </h2>
          <p>
            Step outside your usual rotation.
            <br />
            Your next favorite is waiting to be found.
          </p>
          <button
            disabled={!songs.length}
            className="amp-button dark"
            onClick={() => play(songs)}
          >
            <Play size={16} fill="currentColor" /> Find my frequency{" "}
            <ArrowUpRight size={16} />
          </button>
          <div className="amp-hero-meta">
            <span>
              <Headphones size={15} /> Made for curious ears
            </span>
            <span>VOL. 01 — ON REPEAT</span>
          </div>
        </div>
        <div className="amp-vinyl-scene" aria-hidden="true">
          <div className="amp-orbit orbit-one" />
          <div className="amp-orbit orbit-two" />
          <div className="amp-record">
            <div className="amp-record-label">
              <AudioMark />
              <span>
                AMPLIFY
                <br />
                SIDE A
              </span>
              <i />
            </div>
          </div>
          <div className="amp-vinyl-sticker">
            FEEL
            <br />
            EVERY
            <br />
            <em>BEAT.</em>
          </div>
          <span className="amp-vinyl-caption">
            33⅓ RPM / ENDLESS POSSIBILITIES
          </span>
        </div>
      </section>
      <div className="amp-quick-links">
        <Link to="/favorites">
          <span className="amp-quick-icon pink">
            <Heart size={21} />
          </span>
          <div>
            <strong>Your kind of love</strong>
            <small>{profile.likes.length} liked tracks</small>
          </div>
          <ArrowUpRight size={19} />
        </Link>
        <Link to="/discover">
          <span className="amp-quick-icon lime">
            <Radio size={21} />
          </span>
          <div>
            <strong>Out of your orbit</strong>
            <small>Discover something new</small>
          </div>
          <ArrowUpRight size={19} />
        </Link>
        <Link to="/community">
          <span className="amp-quick-icon lavender">
            <Users size={21} />
          </span>
          <div>
            <strong>Better together</strong>
            <small>Playlists from the community</small>
          </div>
          <ArrowUpRight size={19} />
        </Link>
      </div>
      <SectionTitle
        eyebrow={
          profile.likes.length || profile.artists.length
            ? "INSPIRED BY YOUR LIBRARY"
            : "A GOOD PLACE TO START"
        }
        title="Meet your next favorites"
        to="/discover"
      />
      {recommendations.length ? (
        <SongCards songs={recommendations} />
      ) : (
        <Empty title="The stage is ready">
          Add your first tracks in the creator studio to bring Amplify to life.
        </Empty>
      )}
      <div className="amp-home-bottom">
        <section>
          <SectionTitle
            eyebrow="STRAIGHT FROM THE CATALOG"
            title="Fresh in the rotation"
            to="/discover?sort=newest"
          />
          <TrackList
            songs={[...songs]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 4)}
          />
        </section>
        <Link to="/albums" className="amp-album-promo">
          <Disc3 size={35} />
          <span className="amp-eyebrow">FROM FIRST TRACK TO LAST</span>
          <h2>
            Some stories
            <br />
            deserve a<br />
            <em>full listen.</em>
          </h2>
          <span>
            {albums.length} albums. Find your moment. <ArrowUpRight size={18} />
          </span>
        </Link>
      </div>
    </>
  );
}
function AudioMark() {
  return (
    <div className="amp-audio-mark">
      <i />
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
function Discover() {
  const { songs, albums } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);
  const [artist, setArtist] = useState("all");
  const [length, setLength] = useState("all");
  const sort = params.get("sort") || "title";
  const filtered = songs
    .filter(
      (s) =>
        `${s.title} ${s.artist}`.toLowerCase().includes(query.toLowerCase()) &&
        (artist === "all" || s.artist === artist) &&
        (length === "all" ||
          (length === "short" ? s.duration < 180 : s.duration >= 180)),
    )
    .sort((a, b) =>
      sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : sort === "duration"
          ? a.duration - b.duration
          : a.title.localeCompare(b.title),
    );
  return (
    <>
      <Heading
        eyebrow="FOLLOW YOUR CURIOSITY"
        title="A world beyond your rotation."
        text={`${songs.length} tracks. ${new Set(songs.map((s) => s.artist)).size} artists. Endless ways to find your sound.`}
      />
      <div className="amp-discovery-banner">
        <Radio size={34} />
        <div>
          <h3>Great taste starts with an open mind.</h3>
          <p>
            Browse the whole catalog, find an artist, or let a new track take
            the lead.
          </p>
        </div>
        <button
          className="amp-button dark"
          disabled={!filtered.length}
          onClick={() => {
            useDeck.setState({ shuffle: true });
            useDeck
              .getState()
              .play(filtered, Math.floor(Math.random() * filtered.length));
          }}
        >
          Surprise me <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="amp-filters">
        <input
          aria-label="Search catalog"
          placeholder="Search a title or artist…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Filter by artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        >
          <option value="all">All artists</option>
          {[...new Set(songs.map((s) => s.artist))].sort().map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select
          aria-label="Track length"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        >
          <option value="all">Any length</option>
          <option value="short">Under 3 minutes</option>
          <option value="long">3 minutes and up</option>
        </select>
        <select
          aria-label="Sort tracks"
          value={sort}
          onChange={(e) => setParams({ q: query, sort: e.target.value })}
        >
          <option value="title">A to Z</option>
          <option value="newest">Newest first</option>
          <option value="duration">Shortest first</option>
        </select>
      </div>
      <SectionTitle
        title={`${filtered.length} ${filtered.length === 1 ? "track" : "tracks"} to get lost in`}
      />
      <TrackList songs={filtered} />
      {query &&
        albums.some((a) =>
          `${a.title} ${a.artist}`.toLowerCase().includes(query.toLowerCase()),
        ) && (
          <>
            <SectionTitle title="Matching albums" />
            <Albums query={query} />
          </>
        )}
    </>
  );
}
function Library({ create }: { create: () => void }) {
  const { profile, collections } = useCatalog();
  const [tab, setTab] = useState("playlists");
  return (
    <>
      <Heading
        eyebrow="EVERYTHING THAT FEELS LIKE YOU"
        title="Your little corner of sound."
        text="The music you love, all in one place."
      >
        <button className="amp-button" onClick={create}>
          <Plus size={17} /> New playlist
        </button>
      </Heading>
      <div className="amp-library-stats">
        <div>
          <Heart />
          <strong>{profile.likes.length}</strong>
          <span>Liked tracks</span>
        </div>
        <div>
          <Music2 />
          <strong>{collections.length}</strong>
          <span>Playlists</span>
        </div>
        <div>
          <Headphones />
          <strong>{profile.history.length}</strong>
          <span>Recent listens</span>
        </div>
        <div>
          <Users />
          <strong>{profile.artists.length}</strong>
          <span>Artists followed</span>
        </div>
      </div>
      <div className="amp-tabs">
        {["playlists", "history", "artists"].map((t) => (
          <button
            className={tab === t ? "selected" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "playlists" ? (
        collections.length ? (
          <CollectionCards lists={collections} />
        ) : (
          <Empty title="Your next chapter starts here">
            Create a playlist and fill it with songs that feel like you.
          </Empty>
        )
      ) : tab === "history" ? (
        <TrackList
          songs={profile.history
            .map((h) => h.song)
            .filter((s): s is Song => !!s)}
        />
      ) : (
        <div className="amp-artist-grid">
          {profile.artists.map((a) => (
            <Link key={a} to={`/artist/${encodeURIComponent(a)}`}>
              <div className="amp-artist-avatar">{a[0]}</div>
              <h3>{a}</h3>
              <span>
                View artist <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
          {!profile.artists.length && (
            <Empty title="Find your people">
              Follow an artist from any track to keep their music close.
            </Empty>
          )}
        </div>
      )}
    </>
  );
}
function Favorites() {
  const { profile } = useCatalog();
  return (
    <>
      <Heading
        eyebrow="THE ONES THAT STAY"
        title="A little love. On repeat."
        text={`${profile.likes.length} tracks you’ve made your own.`}
      >
        <button
          className="amp-button"
          disabled={!profile.likes.length}
          onClick={() => useDeck.getState().play(profile.likes)}
        >
          <Play size={17} /> Play favorites
        </button>
      </Heading>
      <TrackList songs={profile.likes} />
    </>
  );
}
function Albums({ query = "" }: { query?: string }) {
  const { albums } = useCatalog();
  return (
    <>
      <SectionTitle
        eyebrow="LISTEN TO THE WHOLE STORY"
        title="The album collection"
      />
      <div className="amp-card-grid">
        {albums
          .filter((a) =>
            `${a.title} ${a.artist}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          )
          .map((a) => (
            <Link className="amp-song-card" to={`/albums/${a._id}`} key={a._id}>
              <div className="amp-cover">
                <img src={a.imageUrl} alt={a.title} loading="lazy" />
              </div>
              <strong>{a.title}</strong>
              <span className="amp-muted">
                {a.artist} · {a.releaseYear}
              </span>
            </Link>
          ))}
      </div>
      {!albums.length && <Empty title="Albums are on their way" />}
    </>
  );
}
function Album() {
  const { id } = useParams();
  const { albums, songs } = useCatalog();
  const album = albums.find((a) => a._id === id);
  if (!album) return <Empty title="Album not found" />;
  const tracks = songs.filter((s) => s.albumId === id);
  return (
    <>
      <div className="amp-detail-hero">
        <img src={album.imageUrl} alt={album.title} />
        <div>
          <span className="amp-eyebrow">ALBUM / {album.releaseYear}</span>
          <h1>{album.title}</h1>
          <Link to={`/artist/${encodeURIComponent(album.artist)}`}>
            {album.artist}
          </Link>
          <p>
            {tracks.length} tracks ·{" "}
            {Math.round(tracks.reduce((n, s) => n + s.duration, 0) / 60)}{" "}
            minutes
          </p>
          <button
            className="amp-button"
            disabled={!tracks.length}
            onClick={() => useDeck.getState().play(tracks)}
          >
            <Play size={17} /> Play album
          </button>
        </div>
      </div>
      <TrackList songs={tracks} />
    </>
  );
}
function Artist() {
  const { name = "" } = useParams();
  const { songs, profile, follow } = useCatalog();
  const tracks = songs.filter((s) => s.artist === name);
  return (
    <>
      <div className="amp-artist-hero">
        <div className="amp-artist-avatar">{name[0]}</div>
        <div>
          <span className="amp-eyebrow">IN THEIR OWN FREQUENCY</span>
          <h1>{name}</h1>
          <p>{tracks.length} tracks in the catalog</p>
          <button className="amp-button" onClick={() => follow(name)}>
            {profile.artists.includes(name) ? (
              <Check size={17} />
            ) : (
              <Plus size={17} />
            )}{" "}
            {profile.artists.includes(name) ? "Following" : "Follow artist"}
          </button>
        </div>
      </div>
      <SectionTitle title="Get to know their sound" />
      <TrackList songs={tracks} />
    </>
  );
}
function Playlist() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { collections, publicLists, saveList, deleteList } = useCatalog();
  const local = [...collections, ...publicLists].find((p) => p._id === id);
  const [fetched, setFetched] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(!local);
  const [edit, setEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    setFetched(null);
    setLoading(!local);
    if (!local)
      api
        .get(`/workspace/collections/${id}`)
        .then((r) => {
          if (live) setFetched(r.data);
        })
        .catch(() => {})
        .finally(() => {
          if (live) setLoading(false);
        });
    return () => {
      live = false;
    };
  }, [id, local]);
  const list = local || fetched;
  if (loading) return <p>Opening playlist…</p>;
  if (!list)
    return <Empty title="This playlist is private or no longer available" />;
  const owner = list.owner === userId;
  const ids = list.songs.map((s) => s._id);
  return (
    <>
      <div className="amp-detail-hero">
        <div className="amp-detail-art">
          {list.songs[0] ? (
            <img src={list.songs[0].imageUrl} alt="" />
          ) : (
            <Music2 size={70} />
          )}
        </div>
        <div>
          <span className="amp-eyebrow">
            {list.isPublic ? "COMMUNITY PLAYLIST" : "YOUR PRIVATE MIX"}
          </span>
          <h1>{list.name}</h1>
          <p>{list.description || "A collection of good feelings."}</p>
          <small>
            {list.songs.length} tracks ·{" "}
            {Math.round(list.songs.reduce((n, s) => n + s.duration, 0) / 60)}{" "}
            minutes
          </small>
          <div className="amp-actions">
            <button
              disabled={!ids.length}
              className="amp-button"
              onClick={() => useDeck.getState().play(list.songs)}
            >
              <Play size={17} /> Play collection
            </button>
            {owner && (
              <>
                <button
                  className="amp-button secondary"
                  onClick={() => {
                    setName(list.name);
                    setDescription(list.description);
                    setVisible(list.isPublic);
                    setEdit(true);
                  }}
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  aria-label="Delete playlist"
                  onClick={() => setDeleting(true)}
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            {list.isPublic && (
              <button
                className="amp-button secondary"
                onClick={() =>
                  navigator.clipboard
                    .writeText(window.location.href)
                    .then(() => toast.success("Playlist link copied"))
                    .catch(() => toast.error("Could not copy link"))
                }
              >
                <Share2 size={16} /> Share
              </button>
            )}
          </div>
        </div>
      </div>
      {owner && (
        <p className="amp-helper">
          Add tracks with the + button in Discover. Use ↑ to reorder your
          playlist.
        </p>
      )}
      <TrackList
        songs={list.songs}
        remove={
          owner
            ? (songId) =>
                saveList(list._id, { songs: ids.filter((s) => s !== songId) })
            : undefined
        }
        move={
          owner
            ? (index) => {
                const reordered = [...ids];
                [reordered[index - 1], reordered[index]] = [
                  reordered[index],
                  reordered[index - 1],
                ];
                saveList(list._id, { songs: reordered });
              }
            : undefined
        }
      />
      {edit && (
        <Modal title="Make it yours" close={() => setEdit(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const ok = await saveList(list._id, {
                name,
                description,
                isPublic: visible,
              });
              setBusy(false);
              if (ok) setEdit(false);
            }}
          >
            <label>
              Name
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label className="amp-checkbox">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />
              {visible ? <Globe size={15} /> : <Lock size={15} />} Share
              publicly
            </label>
            <button disabled={busy} className="amp-button">
              Save changes
            </button>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title={`Delete ${list.name}?`} close={() => setDeleting(false)}>
          <p>Your playlist will be permanently removed.</p>
          <button
            className="amp-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const ok = await deleteList(list._id);
              setBusy(false);
              if (ok) navigate("/library");
            }}
          >
            Delete playlist
          </button>
        </Modal>
      )}
    </>
  );
}
interface Note {
  _id: string;
  author: string;
  body: string;
  createdAt: string;
}
function Track() {
  const { id } = useParams();
  const { userId } = useAuth();
  const { songs, like, profile } = useCatalog();
  const song = songs.find((s) => s._id === id);
  const [notes, setNotes] = useState<Note[]>([]);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    setNotes([]);
    setError("");
    api
      .get(`/workspace/notes/${id}`)
      .then((r) => {
        if (live) setNotes(r.data);
      })
      .catch(() => {
        if (live) setError("Comments could not be loaded.");
      });
    return () => {
      live = false;
    };
  }, [id]);
  if (!song) return <Empty title="Track not found" />;
  return (
    <>
      <div className="amp-detail-hero">
        <img src={song.imageUrl} alt={song.title} />
        <div>
          <span className="amp-eyebrow">A TRACK TO GET LOST IN</span>
          <h1>{song.title}</h1>
          <Link to={`/artist/${encodeURIComponent(song.artist)}`}>
            {song.artist} <ArrowUpRight size={15} />
          </Link>
          <p>{duration(song.duration)}</p>
          <div className="amp-actions">
            <button
              className="amp-button"
              onClick={() => useDeck.getState().play([song])}
            >
              <Play size={16} /> Play track
            </button>
            <button className="amp-button secondary" onClick={() => like(song)}>
              <Heart size={16} />
              {profile.likes.some((s) => s._id === id) ? "Liked" : "Save track"}
            </button>
          </div>
        </div>
      </div>
      <div className="amp-track-detail-columns">
        <section>
          <SectionTitle title="What does this one make you feel?" />
          <p className="amp-muted">
            Leave a little note for the next listener.
          </p>
          {userId ? (
            <form
              className="amp-comment-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const r = await api.post(`/workspace/notes/${id}`, { body });
                  setNotes([r.data, ...notes]);
                  setBody("");
                } catch {
                  toast.error("Could not post your comment");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <textarea
                required
                maxLength={500}
                aria-label="Your comment"
                placeholder="This sounds like…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <button className="amp-button" disabled={busy || !body.trim()}>
                Leave a note <Send size={15} />
              </button>
            </form>
          ) : (
            <SignInButton mode="modal">
              <button className="amp-button secondary">
                Sign in to join the conversation
              </button>
            </SignInButton>
          )}
          {error && <p role="alert">{error}</p>}
          {notes.map((n) => (
            <article className="amp-note" key={n._id}>
              <div className="amp-note-top">
                <span>{n.author === userId ? "You" : "A fellow listener"}</span>
                <time>{new Date(n.createdAt).toLocaleDateString()}</time>
                {n.author === userId && (
                  <button
                    aria-label="Delete comment"
                    onClick={async () => {
                      try {
                        await api.delete(`/workspace/notes/${n._id}`);
                        setNotes(notes.filter((x) => x._id !== n._id));
                      } catch {
                        toast.error("Could not delete comment");
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p>{n.body}</p>
            </article>
          ))}
        </section>
        <section>
          <SectionTitle eyebrow="KEEP EXPLORING" title="In the same orbit" />
          <TrackList
            songs={songs
              .filter((s) => s.artist === song.artist && s._id !== song._id)
              .slice(0, 4)}
          />
        </section>
      </div>
    </>
  );
}
function Community() {
  const { publicLists } = useCatalog();
  return (
    <>
      <Heading
        eyebrow="FIND YOUR PEOPLE"
        title="Good taste is better shared."
        text="Explore collections made by listeners like you."
      />
      <div className="amp-community-banner">
        <div>
          <span className="amp-eyebrow">MUSIC IS A CONVERSATION</span>
          <h2>
            Same song.
            <br />A thousand different stories.
          </h2>
          <Link to="/chat" className="amp-button dark">
            Meet other listeners <ArrowRight size={16} />
          </Link>
        </div>
        <div className="amp-community-art" aria-hidden="true">
          <span>☺</span>
          <span>♪</span>
          <span>✳</span>
        </div>
      </div>
      <SectionTitle title="From the community, with love" />
      {publicLists.length ? (
        <CollectionCards lists={publicLists} />
      ) : (
        <Empty title="Be the first to set the mood">
          Publish a playlist from your library to share it with everyone.
        </Empty>
      )}
    </>
  );
}
function Profile() {
  const { user } = useUser();
  const { profile, ready, sync } = useCatalog();
  const counts = new Map<string, number>();
  profile.history.forEach((h) => {
    if (h.song) counts.set(h.song.artist, (counts.get(h.song.artist) || 0) + 1);
  });
  const top = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <>
      <Heading
        eyebrow="YOUR LISTENING IDENTITY"
        title={`${user?.firstName || "Your"}’s sound story.`}
        text="A snapshot of your latest 100 listens, shaped by you."
      />
      {!ready && (
        <div className="amp-discovery-banner">
          <p>
            {user
              ? "Your library is not synced yet."
              : "Sign in to build your personal listening story."}
          </p>
          {user ? (
            <button className="amp-button" onClick={sync}>
              Retry sync
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="amp-button">Sign in</button>
            </SignInButton>
          )}
        </div>
      )}
      <div className="amp-library-stats">
        <div>
          <Headphones />
          <strong>{profile.history.length}</strong>
          <span>Recent plays</span>
        </div>
        <div>
          <Clock3 />
          <strong>
            {Math.round(
              profile.history.reduce((n, h) => n + (h.song?.duration || 0), 0) /
                60,
            )}
          </strong>
          <span>Minutes in recent tracks</span>
        </div>
        <div>
          <Heart />
          <strong>{profile.likes.length}</strong>
          <span>Tracks loved</span>
        </div>
      </div>
      <SectionTitle title="The artists in your orbit" />
      {top.map(([artist, count]) => (
        <Link
          className="amp-insight-row"
          to={`/artist/${encodeURIComponent(artist)}`}
          key={artist}
        >
          <span>{artist}</span>
          <div>
            <i style={{ width: `${(count / top[0][1]) * 100}%` }} />
          </div>
          <small>{count} plays</small>
          <ArrowUpRight size={17} />
        </Link>
      ))}
      {!top.length && (
        <Empty title="Your story starts with a listen">
          Play a track for at least 10 seconds to start building your listening
          history.
        </Empty>
      )}
      <p className="amp-helper">
        Minutes reflect the full length of tracks in your recent history, not
        measured listening time. Your current queue and playback preferences are
        saved on this device.
      </p>
    </>
  );
}
function Chat() {
  const { user } = useUser();
  const chat = useChatStore();
  const [message, setMessage] = useState("");
  const userId = user?.id;
  const selectedId = chat.selectedUser?.clerkId;
  const { fetchUsers, fetchMessages } = chat;
  useEffect(() => {
    if (userId) fetchUsers();
  }, [userId, fetchUsers]);
  useEffect(() => {
    if (selectedId) fetchMessages(selectedId);
  }, [selectedId, fetchMessages]);
  const messages = chat.messages.filter(
    (m) =>
      chat.selectedUser &&
      ((m.senderId === user?.id &&
        m.receiverId === chat.selectedUser.clerkId) ||
        (m.receiverId === user?.id &&
          m.senderId === chat.selectedUser.clerkId)),
  );
  if (!user)
    return (
      <>
        <Heading
          eyebrow="MUSIC CONNECTS US"
          title="Find your frequency together."
          text="Sign in to chat with fellow music lovers."
        />
        <SignInButton mode="modal">
          <button className="amp-button">Sign in to chat</button>
        </SignInButton>
      </>
    );
  return (
    <>
      <Heading
        eyebrow="THE LISTENING ROOM"
        title="Turn a song into a conversation."
        text={
          chat.isConnected
            ? "Connected. Say hello to a fellow listener."
            : "Connecting to the listening room…"
        }
      />
      <div className="amp-chat">
        <aside>
          <h3>Listeners</h3>
          {chat.users.map((u) => (
            <button
              className={chat.selectedUser?._id === u._id ? "selected" : ""}
              key={u._id}
              onClick={() => chat.setSelectedUser(u)}
            >
              <img src={u.imageUrl} alt="" />
              <span>
                {u.fullName}
                <small>
                  {chat.onlineUsers.has(u.clerkId) ? "● Online" : "Offline"}
                </small>
              </span>
            </button>
          ))}
          {!chat.users.length && <p>No other listeners yet.</p>}
        </aside>
        <section>
          {chat.selectedUser ? (
            <>
              <h3>{chat.selectedUser.fullName}</h3>
              <div className="amp-messages">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`amp-message ${m.senderId === user.id ? "mine" : ""}`}
                  >
                    <p>{m.content}</p>
                    <small>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                ))}
                {chat.error && <p role="alert">{chat.error}</p>}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    !message.trim() ||
                    !chat.selectedUser ||
                    !chat.isConnected
                  )
                    return;
                  chat.sendMessage(
                    chat.selectedUser.clerkId,
                    user.id,
                    message.trim(),
                  );
                  setMessage("");
                }}
              >
                <input
                  aria-label="Message"
                  maxLength={2000}
                  placeholder="Share a thought, a song, a feeling…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  aria-label="Send message"
                  disabled={!message.trim() || !chat.isConnected}
                >
                  <Send size={19} />
                </button>
              </form>
            </>
          ) : (
            <Empty title="Every good conversation starts with hello">
              Choose a listener to start chatting.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
export function Screens({ create }: { create: () => void }) {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/library" element={<Library create={create} />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/albums" element={<Albums />} />
      <Route path="/albums/:id" element={<Album />} />
      <Route path="/playlist/:id" element={<Playlist />} />
      <Route path="/track/:id" element={<Track />} />
      <Route path="/artist/:name" element={<Artist />} />
      <Route path="/community" element={<Community />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/auth-callback" element={<Home />} />
      <Route
        path="*"
        element={<Empty title="This frequency doesn’t exist" />}
      />
    </Routes>
  );
}
