import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "@/types";
export interface Session {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
}
interface NightState {
  motion: boolean;
  accent: "lime" | "violet" | "ice";
  sessions: Session[];
  skipped: string[];
  configure: (patch: Partial<Pick<NightState, "motion" | "accent">>) => void;
  save: (name: string, songs: Song[]) => void;
  remove: (id: string) => void;
  skip: (id: string) => void;
  reset: () => void;
}
export const useNight = create<NightState>()(
  persist(
    (set) => ({
      motion: true,
      accent: "lime",
      sessions: [],
      skipped: [],
      configure: (patch) => set(patch),
      save: (name, songs) =>
        set((s) => ({
          sessions: [
            {
              id: crypto.randomUUID(),
              name: name.trim().slice(0, 80) || "Untitled session",
              songIds: songs.map((t) => t._id),
              createdAt: new Date().toISOString(),
            },
            ...s.sessions,
          ].slice(0, 12),
        })),
      remove: (id) =>
        set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) })),
      skip: (id) =>
        set((s) => ({
          skipped: [...new Set([...s.skipped, id])].slice(-1000),
        })),
      reset: () => set({ skipped: [] }),
    }),
    { name: "nocturne-settings-v1" },
  ),
);
// Stable daily order: the same catalog and date produce the same discoveries.
export function dailyTracks(
  songs: Song[],
  date = new Date().toLocaleDateString("en-CA"),
) {
  const hash = (value: string) => {
    let n = 2166136261;
    for (const char of value) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
    n ^= n >>> 16;
    n = Math.imul(n, 0x85ebca6b);
    n ^= n >>> 13;
    return n >>> 0;
  };
  return [...songs].sort((a, b) => hash(date + a._id) - hash(date + b._id));
}
export function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
