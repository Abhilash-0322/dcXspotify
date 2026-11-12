# Nocturne dark edition

Branch: `codex/nocturne-dark`, based on the Amplify application. Uses the same MongoDB, Clerk, Cloudinary, build commands, and environment variables. No runtime packages or external services were added.

## New experience

- Dark violet surfaces, luminous lime controls, and fully themed library, playlists, chat, comments, search, and account screens.
- Original animated orbital artwork, floating highlights, animated decorative waveforms, card entrance transitions, and hover interactions.
- Three accent palettes, persisted locally; a global animation switch and automatic support for the system's reduced-motion setting.
- Daily rotation: stable picks for each local calendar day from the real catalog.
- Session builder: daily catalog mixes, followed/liked artists, tracks outside recent history, or favorites. Filter by artist, set track count, reshuffle, and play.
- Save up to 12 named sessions on the device; restore their queues and remove saved sessions. Missing/deleted catalog tracks are filtered when restoring a session.
- Radar discovery deck with playback, favorites, skipping, and a local skip reset.
- Immersive focus room with navigation hidden, playback controls, ambient animation, and a timer for time spent playing while the room is open.

Sessions and skips are stored on the device, separate from account-synced playlists and favorites. Mix rules use catalog metadata and existing library history; they do not classify audio by mood. Orbital art and decorative waveforms are ambient animations rather than audio analysis. Audio playback uses the shared player, so there is no duplicate audio stream.

## Validation

Production TypeScript/Vite build and targeted ESLint checks. Helper/state checks covered repeatable daily selection, changed date ordering, source immutability, shuffle integrity, saved-session limits/removal, skip deduplication/reset, and appearance persistence. Browser checks covered the desktop homepage, session saving, focus room, and a 390px mobile viewport.
