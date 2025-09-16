import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
    
    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Online users:", Object.keys(userSocketMap));
  }

  // Handle typing indicators for posts
  socket.on("typing", (data) => {
    socket.broadcast.emit("userTyping", {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    // Find and remove the user from userSocketMap
    for (const [uid, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[uid];
        console.log(`User ${uid} disconnected`);
        break;
      }
    }
    
    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Online users after disconnect:", Object.keys(userSocketMap));
  });
});

export { io, app, server };