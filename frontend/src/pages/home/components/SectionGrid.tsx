import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import SongCard from "./SongCard";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className='mb-8'>
			<div className='section-heading'><h2>{title}</h2><span>{songs.length} tracks</span></div>

			{songs.length ? <div className='song-grid'>{songs.map((song) => <SongCard key={song._id} song={song} />)}</div> : <p className='empty-inline'>No tracks found in this section.</p>}
		</div>
	);
};
export default SectionGrid;
