import { lazy, Suspense, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AuthenticateWithRedirectCallback,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import {
  AudioLines,
  Compass,
  Heart,
  Home,
  Library,
  Plus,
  Search,
  Users,
  ArrowUpRight,
  ListMusic,
  X,
  PanelLeftClose,
  Menu,
  Settings,
  Clock3,
  Orbit,
  Sparkles,
  Moon,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useCatalog, useDeck } from "./store";
import { Player } from "./Player";
import { CreateList } from "./components";
import { Screens } from "./screens";
import { useAuthStore } from "@/stores/useAuthStore";
import "./style.css";
import "@/nocturne/dark.css";
import { Appearance } from "@/nocturne/Experience";
import { useNight } from "@/nocturne/state";
const Admin = lazy(() => import("@/pages/admin/AdminPage"));
function Queue({ close }: { close: () => void }) {
  const deck = useDeck();
  return (
    <aside className="amp-queue">
      <header>
        <div>
          <span className="amp-eyebrow">KEEP THE GOOD GOING</span>
          <h2>Your queue</h2>
        </div>
        <button aria-label="Close queue" onClick={close}>
          <X size={20} />
        </button>
      </header>
      {deck.queue.length ? (
        <>
          {deck.queue.map((s, i) => (
            <div
              className={`amp-queue-track ${i === deck.index ? "current" : ""}`}
              key={`${s._id}-${i}`}
            >
              <button onClick={() => deck.play(deck.queue, i)}>
                <img src={s.imageUrl} alt="" />
                <span>
                  <strong>{s.title}</strong>
                  <small>{s.artist}</small>
                </span>
              </button>
              {i !== deck.index && (
                <button
                  aria-label={`Remove ${s.title} from queue`}
                  onClick={() => deck.remove(i)}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            className="amp-text-button"
            onClick={() =>
              useDeck.setState((s) => ({
                queue: s.song ? [s.song] : [],
                index: s.song ? 0 : -1,
              }))
            }
          >
            Clear upcoming tracks
          </button>
        </>
      ) : (
        <p>Play a collection or add a song to start your queue.</p>
      )}
      <div className="amp-queue-tip">
        <Clock3 size={19} />
        <p>
          <strong>A little shortcut</strong>
          <br />
          Space to play or pause. Alt + arrow keys to skip tracks.
        </p>
      </div>
    </aside>
  );
}
export default function Amplify() {
  const catalog = useCatalog();
  const { motion, accent } = useNight();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [create, setCreate] = useState(false);
  const [queue, setQueue] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const isAdmin = useAuthStore((s) => s.isAdmin);
  useEffect(() => {
    useCatalog.getState().load();
  }, []);
  useEffect(() => {
    setMobile(false);
    document.querySelector(".amp-content")?.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <Routes>
        <Route
          path="/sso-callback"
          element={
            <AuthenticateWithRedirectCallback
              signUpForceRedirectUrl="/"
              signInForceRedirectUrl="/"
            />
          }
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<p>Opening studio…</p>}>
              <Admin />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <div
              className={`amp-app night-app accent-${accent} ${!motion ? "motion-off" : ""} ${mobile ? "nav-open" : ""}`}
            >
              <aside className="amp-sidebar">
                <Link to="/" className="amp-logo">
                  <span>
                    <AudioLines size={25} />
                  </span>
                  nocturne<span className="amp-logo-dot">®</span>
                </Link>
                <button
                  className="amp-mobile-close"
                  aria-label="Close navigation"
                  onClick={() => setMobile(false)}
                >
                  <PanelLeftClose />
                </button>
                <span className="amp-nav-label">YOUR UNIVERSE</span>
                <nav>
                  {[
                    [Home, "/", "Your space"],
                    [Compass, "/discover", "Discover"],
                    [Orbit, "/radar", "Radar"],
                    [Sparkles, "/sessions", "Sessions"],
                    [Moon, "/focus", "Focus room"],
                    [Library, "/library", "Your library"],
                    [Heart, "/favorites", "Liked songs"],
                    [Users, "/community", "Community"],
                  ].map(([Icon, to, label]) => {
                    const I = Icon as typeof Home;
                    return (
                      <NavLink
                        key={String(to)}
                        end={to === "/"}
                        to={String(to)}
                      >
                        <I size={19} />
                        {String(label)}
                        {to === "/discover" && (
                          <span className="amp-new">NEW</span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
                <div className="amp-playlist-label">
                  <span className="amp-nav-label">YOUR PLAYLISTS</span>
                  <button
                    aria-label="Create playlist"
                    onClick={() => setCreate(true)}
                  >
                    <Plus size={17} />
                  </button>
                </div>
                <div className="amp-sidebar-lists">
                  {catalog.collections.map((p) => (
                    <NavLink key={p._id} to={`/playlist/${p._id}`}>
                      <ListMusic size={17} />
                      <span>{p.name}</span>
                    </NavLink>
                  ))}
                  {!catalog.collections.length && (
                    <button
                      className="amp-text-button"
                      onClick={() => setCreate(true)}
                    >
                      Make your first playlist <Plus size={14} />
                    </button>
                  )}
                </div>
                <div className="amp-sidebar-bottom">
                  <div className="amp-listening-note">
                    <span>
                      AFTER DARK.
                      <br />
                      BEYOND ORDINARY.
                    </span>
                    <p>
                      Find your people.
                      <br />
                      Share your frequency.
                    </p>
                    <Link to="/community">
                      Meet the community <ArrowUpRight size={16} />
                    </Link>
                  </div>
                  {isAdmin && (
                    <Link className="amp-studio-link" to="/admin">
                      <Settings size={16} /> Creator studio
                    </Link>
                  )}
                  <Link className="amp-profile-link" to="/profile">
                    <div className="amp-avatar">
                      {user?.firstName?.[0] || "A"}
                    </div>
                    <div>
                      <strong>{user?.firstName || "Music lover"}</strong>
                      <small>Your listening space</small>
                    </div>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </aside>
              {mobile && (
                <button
                  className="amp-nav-scrim"
                  aria-label="Close navigation"
                  onClick={() => setMobile(false)}
                />
              )}
              <div className="amp-main">
                <header className="amp-topbar">
                  <div className="amp-top-left">
                    <button
                      className="amp-mobile-toggle"
                      aria-label="Open navigation"
                      onClick={() => setMobile(true)}
                    >
                      <Menu />
                    </button>
                    <span className="amp-top-caption">
                      THE WORLD OFF. YOUR SOUND ON.
                    </span>
                  </div>
                  <form
                    className="amp-search"
                    onSubmit={(e) => {
                      e.preventDefault();
                      navigate(`/discover?q=${encodeURIComponent(search)}`);
                    }}
                  >
                    <Search size={17} />
                    <input
                      aria-label="Search music"
                      placeholder="Search tracks, artists, albums…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <kbd>↵</kbd>
                  </form>
                  <Appearance />
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="amp-signin">
                        Enter your universe <ArrowUpRight size={15} />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </header>
                <main className="amp-content" id="main-content">
                  {catalog.error ? (
                    <div role="alert" className="amp-error">
                      <h2>Your music is taking a moment.</h2>
                      <p>{catalog.error}</p>
                      <button className="amp-button" onClick={catalog.load}>
                        Try again
                      </button>
                    </div>
                  ) : catalog.loading ? (
                    <div className="amp-loading">
                      <AudioLines size={42} />
                      <p>Tuning into your world…</p>
                      <div className="amp-skeleton" />
                      <div className="amp-skeleton" />
                    </div>
                  ) : (
                    <Screens create={() => setCreate(true)} />
                  )}
                  <div className="amp-page-footer">
                    <span>
                      <AudioLines size={16} /> nocturne
                    </span>
                    <p>Made for the ones who feel everything.</p>
                    <span>TURN IT UP. FEEL SOMETHING.</span>
                  </div>
                </main>
              </div>
              {queue && <Queue close={() => setQueue(false)} />}
              <Player onQueue={() => setQueue(!queue)} />
              {create && <CreateList close={() => setCreate(false)} />}
            </div>
          }
        />
      </Routes>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "#242522",
            color: "#fff",
            fontSize: "13px",
          },
        }}
      />
    </>
  );
}
