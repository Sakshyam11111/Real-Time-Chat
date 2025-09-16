import express from "express";
import {
  getPosts,
  createPost,
  deletePost,
  likePost,
  commentOnPost,
  getUserPosts,
  getFeedPosts
} from "../contollers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getPosts);
router.get("/feed", protectRoute, getFeedPosts);
router.get("/user/:userId", protectRoute, getUserPosts);
router.post("/", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/:id/like", protectRoute, likePost);
router.post("/:id/comment", protectRoute, commentOnPost);

export default router;