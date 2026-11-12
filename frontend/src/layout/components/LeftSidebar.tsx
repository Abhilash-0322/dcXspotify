import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { SignedIn } from "@clerk/clerk-react";
import { Headphones, Heart, HomeIcon, Library, MessageCircle, Disc3 } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const LeftSidebar = () => {
	const { albums, fetchAlbums, isLoading } = useMusicStore();
	const location = useLocation();

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	const linkClass = (active: boolean) => cn(buttonVariants({ variant: "ghost", className: `sidebar-link w-full justify-start ${active ? "is-active" : ""}` }));

	return (
		<div className='sidebar-shell h-full flex flex-col gap-3'>
			{/* Navigation menu */}

			<div className='sidebar-nav'>
				<div className='sidebar-brand'><div className='brand-mark'><Headphones size={18} /></div><div><strong>sonora</strong><span>LISTEN TOGETHER</span></div></div>
				<div className='space-y-1'>
					<Link
						to={"/"}
						className={linkClass(location.pathname === "/")}
					>
						<HomeIcon className='mr-2 size-5' />
						<span className='hidden md:inline'>Home</span>
					</Link>
					<Link to='/liked' className={linkClass(location.pathname === "/liked")}><Heart className='mr-2 size-5' /><span className='hidden md:inline'>Liked songs</span></Link>

					<SignedIn>
						<Link
							to={"/chat"}
							className={linkClass(location.pathname === "/chat")}
						>
							<MessageCircle className='mr-2 size-5' />
							<span className='hidden md:inline'>Messages</span>
						</Link>
					</SignedIn>
				</div>
			</div>

			{/* Library section */}
			<div className='sidebar-library flex-1'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center library-heading px-2'>
						<Library className='size-5 mr-2' />
						<span className='hidden md:inline'>Your library</span>
					</div>
				</div>

				<ScrollArea className='h-[calc(100vh-300px)]'>
					<div className='space-y-2'>
						{isLoading ? (
							<PlaylistSkeleton />
						) : (
							albums.map((album) => (
								<Link
									to={`/albums/${album._id}`}
									key={album._id}
										className='library-item p-2 rounded-md flex items-center gap-3 group cursor-pointer'
								>
									<img
										src={album.imageUrl}
										alt={`${album.title} album cover`}
										className='size-12 rounded-md flex-shrink-0 object-cover'
									/>

									<div className='flex-1 min-w-0 hidden md:block'>
										<p className='font-medium truncate'>{album.title}</p>
										<p className='text-sm text-zinc-400 truncate'><Disc3 size={12} className='inline mr-1' />{album.artist} · {album.releaseYear}</p>
									</div>
								</Link>
							))
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
export default LeftSidebar;
