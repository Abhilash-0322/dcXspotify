import { User } from "../models/user.model.js";

export const authCallback = async (req, res, next) => {
	try {
		const { firstName, lastName, imageUrl } = req.body;
        const id = (typeof req.auth === "function" ? req.auth() : req.auth).userId;

		// check if user already exists
		const user = await User.findOne({ clerkId: id });

		if (!user) {
			// signup
			await User.create({
				clerkId: id,
				fullName: `${firstName || ""} ${lastName || ""}`.trim() || "Listener",
				imageUrl,
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback is here", error);
		next(error);
	}
};