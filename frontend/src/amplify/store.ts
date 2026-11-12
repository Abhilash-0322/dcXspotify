import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance as api } from "@/lib/axios";
import type { Song, Album } from "@/types";
import toast from "react-hot-toast";
export interface Collection {
  _id: string;
  owner: string;
  name: string;
  description: string;
  isPublic: boolean;
  songs: Song[];
}
export interface Profile {
  likes: Song[];
  artists: string[];
  history: { song: Song | null; playedAt: string }[];
}
interface Catalog {
  songs: Song[];
  albums: Album[];
  collections: Collection[];
  publicLists: Collection[];
  profile: Profile;
  loading: boolean;
  error: string;
  ready: boolean;
  load: () => Promise<void>;
  sync: () => Promise<void>;
  reset: () => void;
  like: (song: Song) => Promise<void>;
  follow: (artist: string) => Promise<void>;
  createList: (
    name: string,
    description: string,
    isPublic: boolean,
  ) => Promise<Collection | undefined>;
  saveList: (
    id: string,
    patch: Partial<Pick<Collection, "name" | "description" | "isPublic">> & {
      songs?: string[];
    },
  ) => Promise<boolean>;
  deleteList: (id: string) => Promise<boolean>;
  record: (song: Song) => void;
}
let accountRevision = 0;
const empty = (): Profile => ({ likes: [], artists: [], history: [] });
const failure = (error: unknown) => {
  toast.error(
    error instanceof Error ? error.message : "Unable to save changes",
  );
};
export const useCatalog = create<Catalog>((set, get) => ({
  songs: [],
  albums: [],
  collections: [],
  publicLists: [],
  profile: empty(),
  loading: true,
  error: "",
  ready: false,
  load: async () => {
    set({ loading: true, error: "" });
    try {
      const [songs, albums, lists] = await Promise.all([
        api.get("/songs"),
        api.get("/albums"),
        api.get("/workspace/public"),
      ]);
      set({ songs: songs.data, albums: albums.data, publicLists: lists.data });
    } catch {
      set({ error: "We couldn’t reach your music library. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
  sync: async () => {
    const revision = accountRevision;
    try {
      const { data } = await api.get("/workspace");
      if (revision !== accountRevision) return;
      set({
        profile: data.profile,
        collections: data.collections,
        ready: true,
      });
    } catch {
      if (revision !== accountRevision) return;
      set({ ready: false });
      toast.error("Your library could not be synced. Please retry.");
    }
  },
  reset: () => {
    accountRevision++;
    set({ profile: empty(), collections: [], ready: false });
  },
  like: async (song) => {
    if (!get().ready) {
      toast("Sign in to save your favorites");
      return;
    }
    try {
      const liked = !get().profile.likes.some((s) => s._id === song._id);
      await api.put(`/workspace/likes/${song._id}`, { liked });
      set((s) => ({
        profile: {
          ...s.profile,
          likes: liked
            ? [...s.profile.likes, song]
            : s.profile.likes.filter((x) => x._id !== song._id),
        },
      }));
    } catch (e) {
      failure(e);
    }
  },
  follow: async (artist) => {
    if (!get().ready) {
      toast("Sign in to follow artists");
      return;
    }
    try {
      const follow = !get().profile.artists.includes(artist);
      await api.put("/workspace/artists", { artist, follow });
      set((s) => ({
        profile: {
          ...s.profile,
          artists: follow
            ? [...s.profile.artists, artist]
            : s.profile.artists.filter((a) => a !== artist),
        },
      }));
    } catch (e) {
      failure(e);
    }
  },
  createList: async (name, description, isPublic) => {
    try {
      const { data } = await api.post("/workspace/collections", {
        name,
        description,
        isPublic,
      });
      set((s) => ({
        collections: [data, ...s.collections],
        publicLists: isPublic ? [data, ...s.publicLists] : s.publicLists,
      }));
      toast.success("Playlist created");
      return data;
    } catch (e) {
      failure(e);
    }
  },
  saveList: async (id, patch) => {
    try {
      const { data } = await api.put(`/workspace/collections/${id}`, patch);
      set((s) => ({
        collections: s.collections.map((p) => (p._id === id ? data : p)),
        publicLists: [
          ...s.publicLists.filter((p) => p._id !== id),
          ...(data.isPublic ? [data] : []),
        ],
      }));
      toast.success("Playlist updated");
      return true;
    } catch (e) {
      failure(e);
      return false;
    }
  },
  deleteList: async (id) => {
    try {
      await api.delete(`/workspace/collections/${id}`);
      set((s) => ({
        collections: s.collections.filter((p) => p._id !== id),
        publicLists: s.publicLists.filter((p) => p._id !== id),
      }));
      toast.success("Playlist deleted");
      return true;
    } catch (e) {
      failure(e);
      return false;
    }
  },
  record: (song) => {
    if (!get().ready) return;
    api
      .post(`/workspace/history/${song._id}`)
      .then(() =>
        set((s) => ({
          profile: {
            ...s.profile,
            history: [
              { song, playedAt: new Date().toISOString() },
              ...s.profile.history,
            ].slice(0, 100),
          },
        })),
      )
      .catch(() => {});
  },
}));
interface Deck {
  song: Song | null;
  queue: Song[];
  index: number;
  playing: boolean;
  shuffle: boolean;
  repeat: "off" | "all" | "one";
  volume: number;
  sleepAt: number | null;
  play: (songs: Song[], index?: number) => void;
  toggle: () => void;
  next: (ended?: boolean) => void;
  previous: () => void;
  add: (song: Song) => void;
  remove: (index: number) => void;
}
export const useDeck = create<Deck>()(
  persist(
    (set, get) => ({
      song: null,
      queue: [],
      index: -1,
      playing: false,
      shuffle: false,
      repeat: "off",
      volume: 0.7,
      sleepAt: null,
      play: (queue, index = 0) => {
        if (!queue[index]) return;
        set({ queue, index, song: queue[index], playing: true });
      },
      toggle: () => {
        if (get().song) set({ playing: !get().playing });
      },
      next: (ended = false) => {
        const s = get();
        if (!s.queue.length) return;
        if (ended && s.repeat === "one") {
          set({ playing: true });
          return;
        }
        let index = s.index + 1;
        if (s.shuffle && s.queue.length > 1)
          index =
            (s.index + 1 + Math.floor(Math.random() * (s.queue.length - 1))) %
            s.queue.length;
        if (index >= s.queue.length) {
          if (s.repeat !== "all") {
            set({ playing: false });
            return;
          }
          index = 0;
        }
        set({ index, song: s.queue[index], playing: true });
      },
      previous: () => {
        const s = get();
        const index = Math.max(0, s.index - 1);
        if (s.queue[index]) set({ index, song: s.queue[index], playing: true });
      },
      add: (song) => {
        set((s) => ({ queue: [...s.queue, song] }));
        toast.success("Added to queue");
      },
      remove: (index) => {
        const s = get();
        if (index === s.index) return;
        set({
          queue: s.queue.filter((_, i) => i !== index),
          index: index < s.index ? s.index - 1 : s.index,
        });
      },
    }),
    {
      name: "amplify-player-v1",
      partialize: (s) => ({
        song: s.song,
        queue: s.queue,
        index: s.index,
        volume: s.volume,
        repeat: s.repeat,
        shuffle: s.shuffle,
      }),
    },
  ),
);
export const duration = (n: number) =>
  `${Math.floor((n || 0) / 60)}:${String(Math.floor((n || 0) % 60)).padStart(2, "0")}`;
