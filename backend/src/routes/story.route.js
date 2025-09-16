import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createStory,
  getActiveStories,
  getUserStories,
  viewStory,
  deleteStory
} from "../contollers/story.controller.js";

const router = express.Router();

router.post("/", protectRoute, createStory);
router.get("/active", protectRoute, getActiveStories);
router.get("/user/:userId", protectRoute, getUserStories); 
router.post("/:id/view", protectRoute, viewStory);
router.delete("/:id", protectRoute, deleteStory);

export default router;