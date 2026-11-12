import { clerkClient } from "@clerk/express";


export const protectedRoute = async(req,res,next) => {
    if(!req.auth?.userId){
        return res.status(401).json({message: 'Unauthorized'});
    }
    next();
}

export const requireAdmin=async(req,res,next)=>{
    try{
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
        const currentEmail = String(currentUser.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();
        const isAdmin = Boolean(adminEmail) && adminEmail === currentEmail;
        // const isAdmin=true;
        if(!isAdmin){
            return res.status(403).json({message: 'Unauthorized- You must be an Admin'});
            // return;
        }
        
        next();
    }
    catch(err){
        next(err);
    }  
}
