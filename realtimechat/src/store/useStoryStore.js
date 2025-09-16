import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useStoryStore = create((set, get) => ({
  stories: [],
  userStories: [], // New: for profile page
  isStoriesLoading: false,
  isUserStoriesLoading: false,
  isCreatingStory: false, // Add this missing property

  createStory: async (content) => {
    set({ isCreatingStory: true }); // Add loading state
    try {
      const res = await axiosInstance.post("/stories", { content });
      set({ stories: [res.data, ...get().stories] });
      toast.success("Story created successfully!");
      
      // Refresh stories after creation to ensure UI updates
      await get().getStories();
      
      return res.data;
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error(error.response?.data?.error || "Failed to create story");
      throw error;
    } finally {
      set({ isCreatingStory: false }); // Reset loading state
    }
  },

  getStories: async () => {
    set({ isStoriesLoading: true });
    try {
      const res = await axiosInstance.get("/stories/active");
      set({ stories: res.data });
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error(error.response?.data?.error || "Failed to fetch stories");
    } finally {
      set({ isStoriesLoading: false });
    }
  },

  // NEW: Get user's own stories for profile
  getUserStories: async (userId) => {
    set({ isUserStoriesLoading: true });
    try {
      const res = await axiosInstance.get(`/stories/user/${userId}`);
      set({ userStories: res.data });
    } catch (error) {
      console.error("Error fetching user stories:", error);
      toast.error(error.response?.data?.error || "Failed to fetch your stories");
    } finally {
      set({ isUserStoriesLoading: false });
    }
  },

  viewStory: async (storyId) => {
    try {
      const res = await axiosInstance.post(`/stories/${storyId}/view`);
      set({
        stories: get().stories.map((story) =>
          story._id === storyId ? res.data : story
        ),
      });
    } catch (error) {
      console.error("Error viewing story:", error);
      if (error.response?.status === 410) {
        // Story expired, remove from list
        set({
          stories: get().stories.filter((story) => story._id !== storyId),
        });
        toast.error("This story has expired");
      } else {
        toast.error(error.response?.data?.error || "Failed to view story");
      }
    }
  },

  deleteStory: async (storyId) => {
    try {
      await axiosInstance.delete(`/stories/${storyId}`);
      set({
        stories: get().stories.filter((story) => story._id !== storyId),
        userStories: get().userStories.filter((story) => story._id !== storyId),
      });
      toast.success("Story deleted successfully!");
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error(error.response?.data?.error || "Failed to delete story");
    }
  },

  subscribeToStoryUpdates: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.on("newStory", (newStory) => {
      set({ stories: [newStory, ...get().stories] });
    });

    socket.on("storyDeleted", (storyId) => {
      set({
        stories: get().stories.filter((story) => story._id !== storyId),
        userStories: get().userStories.filter((story) => story._id !== storyId),
      });
    });
  },

  unsubscribeFromStoryUpdates: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.off("newStory");
    socket.off("storyDeleted");
  },
}));