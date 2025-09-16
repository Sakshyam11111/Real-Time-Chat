import express from "express";
import {
  getPosts,
  createPost,
  deletePost,
  likePost,
  commentOnPost,
  likeComment,
  replyToComment,
  likeReply,
  sharePost,
  getUserPosts,
  getFeedPosts
} from "../contollers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Post routes
router.get("/", protectRoute, getPosts);
router.get("/feed", protectRoute, getFeedPosts);
router.get("/user/:userId", protectRoute, getUserPosts);
router.post("/", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);

// Like routes
router.post("/:id/like", protectRoute, likePost);

// Comment routes
router.post("/:id/comment", protectRoute, commentOnPost);
router.post("/:postId/comment/:commentId/like", protectRoute, likeComment);

// Reply routes
router.post("/:postId/comment/:commentId/reply", protectRoute, replyToComment);
router.post("/:postId/comment/:commentId/reply/:replyId/like", protectRoute, likeReply);

// Share routes
router.post("/:id/share", protectRoute, sharePost);

export default router;