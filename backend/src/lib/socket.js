import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000", // Add fallback
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  console.log("Received userId from handshake:", userId); 
  
  if (userId && userId !== "undefined" && userId !== "null") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ${socket.id}`);
    console.log("Current userSocketMap:", userSocketMap); 
    
    // Emit updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Emitted online users:", Object.keys(userSocketMap));
  } else {
    console.log("Invalid userId received:", userId);
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
    let disconnectedUserId = null;
    for (const [uid, socketId] of Object.entries(userSocketMap)) {
      if (socketId === socket.id) {
        delete userSocketMap[uid];
        disconnectedUserId = uid;
        console.log(`User ${uid} disconnected`);
        break;
      }
    }
    
    // Only emit if a user was actually removed
    if (disconnectedUserId) {
      // Emit updated online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log("Online users after disconnect:", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };