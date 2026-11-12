// import { SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";
// import { LayoutDashboardIcon } from "lucide-react";
// import { Link } from "react-router-dom";
// import SignInOAuthButtons from "./SignInOAuthButtons";

// const Topbar = () => {
//     const isAdmin=false;
//     return (
//         <div className="flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
//         backdrop-blur-md z-10">
//             <div className="flex gap-2 items-center">
//                 Spotify
//             </div>
//             <div className="flex items-center gap-4">
//                 {isAdmin &&(
//                     <Link to="/admin">
//                         <LayoutDashboardIcon className="size-4 mr-2"/>
//                         Admin Dashboard
//                     </Link>
//                 )}
                
//                 <SignedIn>
//                     <SignOutButton/>
//                 </SignedIn>

//                 <SignedOut>
//                     <SignInOAuthButtons/>
//                 </SignedOut>
//             </div>
//         </div>
//     )
// }

// export default Topbar


import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { Headphones, Radio } from "lucide-react";

const Topbar = () => {
	const { isAdmin } = useAuthStore();
	// console.log({ isAdmin });

	return (
		<div className='topbar'>
			<div className='topbar-context'>
				<div className='mobile-brand'><Headphones size={17} /><span>sonora</span></div>
				<div className='listening-badge'><span className='live-dot' /><Radio size={14} /> <span>YOUR SOUND, YOUR SPACE</span></div>
			</div>
			<div className='topbar-actions'>
				{isAdmin && (
					<Link to='/admin' className='admin-link'>
						<LayoutDashboardIcon size={15} /> <span>Studio</span>
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<SignedIn><UserButton /></SignedIn>
			</div>
		</div>
	);
};
export default Topbar;
