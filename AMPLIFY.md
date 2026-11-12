# Amplify

A separate application experience on `codex/amplify-rebuild`, branched directly from `main` (`81ecddb`).

## Experience

- New responsive application shell, editorial homepage, original CSS vinyl artwork, typography, navigation, and player.
- Catalog search, artist and duration filters, alphabetical/newest/duration sorting, and surprise playback.
- Track, artist, and album pages with full collection playback.
- Account-synced favorites, artist follows, and the latest 100 listening events.
- Private and public playlists: create, rename, describe, reorder, add/remove tracks, delete, publish, and copy share links.
- Community playlist discovery and track discussions with ownership-controlled comment deletion.
- Personal recommendations based on favorites and follows; listening insights based on recent history.
- Editable playback queue, shuffle, repeat one/all, seek, mute, volume, sleep timers, keyboard shortcuts, and device-local player preferences.
- New chat interface backed by authenticated sockets, with server-derived sender identity and multiple-tab presence support.
- Existing Cloudinary upload and administrator catalog tools remain available in Creator Studio.

## Deployment

Use the existing build/start commands and the same environment variables. No new environment variables, third-party accounts, runtime dependencies, or migration commands are required. Existing songs, albums, users, and messages retain their schemas. MongoDB automatically creates the additional `workspaces`, `collections`, and `notes` collections as features are used.

The existing `VITE_API_URL` remains supported. Without it, development uses `http://localhost:5000/api`; production uses `/api`. Socket connections derive the origin from that same API URL. Existing Clerk credentials authenticate HTTP and socket requests; existing Cloudinary credentials continue to handle uploads.

The existing song catalog is publicly readable, consistent with public music discovery. Playlist edits and deletes are restricted to their owner. Public playlist reads require either public visibility or ownership. Personal account data is cleared on sign out. Listening history stores track references and timestamps; the insights screen labels full-track minutes as an estimate rather than measured listening time.

## Local use and checks

Run `npm run dev --prefix backend` and `npm run dev --prefix frontend`. The frontend uses port 3000 and the backend retains the existing configured port, with 5000 as its fallback.

- Production build: `npm run build --prefix frontend`
- Ownership and validation tests: `node --test backend/tests/workspace.test.js`
- Backend syntax: `find backend/src -name '*.js' -print0 | xargs -0 -n1 node --check`

Verified against the existing database: 16 songs, 5 albums, public playlist endpoint, invalid playlist IDs, and unauthenticated workspace rejection. Desktop and 390px mobile discovery layouts were inspected in the browser. Signed-in writes and multi-account messaging still require a live Clerk session for an end-to-end check; automated route tests exercise ownership and validation with model stubs, without modifying the live database.
