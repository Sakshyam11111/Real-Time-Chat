import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const createStory = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    console.log("Creating story with content:", content);

    if (!content || (!content.image && !content.text)) {
      return res.status(400).json({ error: "Story content is required" });
    }

    let processedContent = { ...content };

    // Upload image to Cloudinary if it's a base64 string
    if (content.image && content.image.startsWith('data:image/')) {
      try {
        console.log("Uploading image to Cloudinary...");
        const uploadResponse = await cloudinary.uploader.upload(content.image, {
          resource_type: "auto",
        });
        processedContent.image = uploadResponse.secure_url;
        console.log("Image uploaded successfully:", uploadResponse.secure_url);
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    const newStory = new Story({
      user: userId,
      content: processedContent,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    await newStory.save();
    await newStory.populate("user", "fullName profilePic");

    console.log("Story created successfully:", newStory._id);

    // Emit to all connected users
    io.emit("newStory", newStory);

    res.status(201).json(newStory);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getActiveStories = async (req, res) => {
  try {
    console.log("Fetching active stories...");
    
    // Only get stories that haven't expired and are active
    const stories = await Story.find({ 
      isActive: true,
      expiresAt: { $gt: new Date() } // Only non-expired stories
    })
      .populate("user", "fullName profilePic")
      .populate("viewers.user", "fullName profilePic")
      .sort({ createdAt: -1 });

    console.log(`Found ${stories.length} active stories`);

    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching active stories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// NEW: Get user's own stories (for profile page)
export const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user._id;

    // Only allow users to see their own stories
    if (userId !== requesterId.toString()) {
      return res.status(403).json({ error: "Not authorized to view these stories" });
    }

    // Get all user's stories (including expired ones for profile view)
    const stories = await Story.find({ 
      user: userId 
    })
      .populate("user", "fullName profilePic")
      .populate("viewers.user", "fullName profilePic")
      .sort({ createdAt: -1 });

    // Add expiry status to each story
    const storiesWithStatus = stories.map(story => ({
      ...story.toObject(),
      isExpired: new Date() > story.expiresAt,
      timeLeft: story.expiresAt > new Date() ? story.expiresAt - new Date() : 0
    }));

    res.status(200).json(storiesWithStatus);
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const viewStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    // Check if story is expired
    if (new Date() > story.expiresAt) {
      return res.status(410).json({ error: "Story has expired" });
    }

    // Check if user already viewed
    const alreadyViewed = story.viewers.some(
      viewer => viewer.user.toString() === userId.toString()
    );

    if (!alreadyViewed && story.user.toString() !== userId.toString()) {
      story.viewers.push({
        user: userId,
        viewedAt: new Date()
      });
      await story.save();
    }

    await story.populate("user", "fullName profilePic");
    await story.populate("viewers.user", "fullName profilePic");

    res.status(200).json(story);
  } catch (error) {
    console.error("Error viewing story:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    if (story.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this story" });
    }

    // Delete image from Cloudinary if it exists
    if (story.content?.image) {
      try {
        const publicId = story.content.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.warn("Failed to delete image from Cloudinary:", cloudinaryError);
        // Continue with story deletion even if image deletion fails
      }
    }

    await Story.findByIdAndDelete(id);

    // Emit to all connected users
    io.emit("storyDeleted", id);

    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};