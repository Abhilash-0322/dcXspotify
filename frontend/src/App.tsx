import { Route, Routes } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";

const HomePage = lazy(() => import("./pages/home/HomePage"));
const AuthCallbackPage = lazy(() => import("./pages/auth-callback/AuthCallbackPage"));
const ChatPage = lazy(() => import("./pages/chat/ChatPage"));
const AlbumPage = lazy(() => import("./pages/album/AlbumPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/404/NotFoundPage"));
const LikedSongsPage = lazy(() => import("./pages/home/LikedSongsPage"));
const ExplorePage = lazy(() => import("./pages/explore/ExplorePage"));
const LibraryPage = lazy(() => import("./pages/library/LibraryPage"));
const CommunityPage = lazy(() => import("./pages/community/CommunityPage"));
const PlaylistDetailPage = lazy(() => import("./pages/playlists/PlaylistDetailPage"));
const CommunityPlaylistsPage = lazy(() => import("./pages/playlists/CommunityPlaylistsPage"));
const SongDetailPage = lazy(() => import("./pages/song/SongDetailPage"));

function App() {
	return (
		<>
			<Suspense fallback={<div className='page-loading'><Loader className='animate-spin' /></div>}><Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />
				<Route path='/admin' element={<AdminPage />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/liked' element={<LikedSongsPage />} />
					<Route path='/explore' element={<ExplorePage />} />
					<Route path='/library' element={<LibraryPage />} />
					<Route path='/community' element={<CommunityPage />} />
					<Route path='/community-playlists' element={<CommunityPlaylistsPage />} />
					<Route path='/playlists/:playlistId' element={<PlaylistDetailPage />} />
					<Route path='/songs/:songId' element={<SongDetailPage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes></Suspense>
			<Toaster />
		</>
	);
}

export default App;
