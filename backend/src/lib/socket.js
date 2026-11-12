import { Server } from "socket.io";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors:{ origin:process.env.NODE_ENV === "production" ? true : "http://localhost:3000", credentials:true },
	});
	io.use(async (socket, next) => {
		try {
			const token = socket.handshake.auth?.token;
			if (!token || !process.env.CLERK_SECRET_KEY) return next(new Error("Authentication required"));
			const claims = await verifyToken(token, { secretKey:process.env.CLERK_SECRET_KEY });
			if (typeof claims.sub !== "string") return next(new Error("Invalid session"));
			socket.data.userId = claims.sub;
			next();
		} catch { next(new Error("Invalid session")); }
	});

	const userSockets = new Map();
	const userActivities = new Map();

	io.on("connection", (socket) => {
		const userId = socket.data.userId;
		let messageWindow = Date.now();
		let messageCount = 0;
		const sockets = userSockets.get(userId) || new Set();
		sockets.add(socket.id);
		userSockets.set(userId, sockets);
		socket.join(`user:${userId}`);
		userActivities.set(userId, "Idle");
		io.emit("user_connected", userId);
		socket.emit("users_online", Array.from(userSockets.keys()));
		io.emit("activities", Array.from(userActivities.entries()));

		socket.on("update_activity", ({ activity } = {}) => {
			if (typeof activity !== "string") return;
			const safeActivity = activity.slice(0, 180);
			userActivities.set(userId, safeActivity);
			io.emit("activity_updated", { userId, activity:safeActivity });
		});

		socket.on("send_message", async (data) => {
			try {
				if (Date.now() - messageWindow > 10000) { messageWindow = Date.now(); messageCount = 0; }
				if (++messageCount > 20) return socket.emit("message_error", "Slow down for a moment before sending another message.");
				const receiverId = typeof data?.receiverId === "string" ? data.receiverId : "";
				const content = typeof data?.content === "string" ? data.content.trim().slice(0, 2000) : "";
				if (!receiverId || receiverId === userId || !content) return socket.emit("message_error", "Choose a recipient and enter a message.");
				if (!(await User.exists({ clerkId:receiverId }))) return socket.emit("message_error", "This listener is not available.");
				const message = await Message.create({ senderId:userId, receiverId, content });
				io.to(`user:${receiverId}`).emit("receive_message", message);
				socket.emit("message_sent", message);
			} catch {
				socket.emit("message_error", "Message could not be sent.");
			}
		});

		socket.on("disconnect", () => {
			const userSocketsForId = userSockets.get(userId);
			userSocketsForId?.delete(socket.id);
			if (!userSocketsForId?.size) {
				userSockets.delete(userId);
				userActivities.delete(userId);
				io.emit("user_disconnected", userId);
			}
		});
	});
};
