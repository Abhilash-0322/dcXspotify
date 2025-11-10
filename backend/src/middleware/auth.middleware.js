import { clerkClient } from "@clerk/express";


export const protectedRoute = async(req,res,next) => {
    if(!req.auth.userId){
        return res.status(401).json({message: 'Unauthorized'});
    }
    next();
}

export const requireAdmin=async(req,res,next)=>{
    try{
        const currentUser = await clerkClient.users.getUser(req.auth.userId);
        console.log(currentUser.primaryEmailAddress?.emailAddress);
        const isAdmin = process.env.ADMIN_EMAIL===currentUser.primaryEmailAddress?.emailAddress;
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