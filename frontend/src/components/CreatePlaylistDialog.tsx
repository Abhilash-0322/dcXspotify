import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLibraryStore } from "@/stores/useLibraryStore";
import { ListPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreatePlaylistDialog() {
	const createPlaylist = useLibraryStore((state) => state.createPlaylist);
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
	const [saving, setSaving] = useState(false);
	const submit = async () => {
		if (!title.trim()) return;
		setSaving(true);
		try { await createPlaylist(title, description, visibility); setTitle(""); setDescription(""); setOpen(false); toast.success("Playlist created"); }
		catch { toast.error("Could not create playlist."); }
		finally { setSaving(false); }
	};
	return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button className='action-primary'><ListPlus size={16} /> New playlist</Button></DialogTrigger>
		<DialogContent className='bg-zinc-900 border-zinc-700'><DialogHeader><DialogTitle>Create a playlist</DialogTitle><DialogDescription>Give a collection a name and choose who can find it.</DialogDescription></DialogHeader>
			<div className='space-y-4 py-3'><label className='field-label'>Name<Input autoFocus maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} placeholder='Late night, long drive…' /></label>
				<label className='field-label'>Description<textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder='What belongs in this mix?' /></label>
				<label className='field-label'>Visibility<select value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)}><option value='public'>Public · appears in Explore</option><option value='unlisted'>Unlisted · link only</option><option value='private'>Private · only you</option></select></label></div>
			<DialogFooter><Button variant='outline' onClick={() => setOpen(false)}>Cancel</Button><Button className='action-primary' onClick={() => void submit()} disabled={saving || !title.trim()}>{saving ? "Creating…" : "Create playlist"}</Button></DialogFooter>
		</DialogContent></Dialog>;
}
