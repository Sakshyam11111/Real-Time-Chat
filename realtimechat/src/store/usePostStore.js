import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const usePostStore = create((set, get) => ({
  posts: [],
  isPostsLoading: false,
  isCreatingPost: false,
  isDeletingPost: false,

  // Create post
  createPost: async (postData) => {
    set({ isCreatingPost: true });
    try {
      // Map the data to match backend expectations
      const payload = {
        content: postData.text,
        image: postData.image
      };
      
      const res = await axiosInstance.post("/posts", payload);
      set({ posts: [res.data, ...get().posts] });
      toast.success("Post created successfully!");
      return res.data;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");
      throw error;
    } finally {
      set({ isCreatingPost: false });
    }
  },

  // Delete post
  deletePost: async (postId) => {
    console.log("🔥 DELETE POST CALLED");
    console.log("Post ID to delete:", postId);
    console.log("Current posts count:", get().posts.length);
    
    set({ isDeletingPost: true });
    
    try {
      console.log("Making DELETE request to:", `/posts/${postId}`);
      console.log("Using axios instance:", axiosInstance.defaults);
      
      const response = await axiosInstance.delete(`/posts/${postId}`);
      console.log("✅ Delete response status:", response.status);
      console.log("✅ Delete response data:", response.data);
      
      const currentPosts = get().posts;
      const filteredPosts = currentPosts.filter(post => post._id !== postId);
      console.log("Posts before filter:", currentPosts.length);
      console.log("Posts after filter:", filteredPosts.length);
      
      set({ 
        posts: filteredPosts
      });
      
      console.log("✅ Post removed from state");
      toast.success("Post deleted successfully!");
      return response.data;
    } catch (error) {
      console.error("❌ DELETE ERROR:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error response data:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error config:", error.config);
      
      // More detailed error logging
      if (error.response) {
        console.error("❌ Response error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error("❌ Request error:", error.request);
      } else {
        console.error("❌ General error:", error.message);
      }
      
      toast.error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        `Failed to delete post: ${error.message}`
      );
      throw error;
    } finally {
      console.log("🔚 Delete operation finished");
      set({ isDeletingPost: false });
    }
  },

  // Get feed posts - Fixed endpoint
  getFeedPosts: async (page = 1) => {
    console.log("Getting feed posts...");
    set({ isPostsLoading: true });
    try {
      // Use the correct endpoint that exists in your backend
      const res = await axiosInstance.get("/posts");
      console.log("Feed posts response:", res.data);
      
      // Transform posts to match frontend expectations
      const transformedPosts = res.data.map(post => {
        console.log("Transforming post:", post._id, "Author:", post.author);
        return {
          ...post,
          // Map backend fields to frontend expectations
          content: {
            text: post.content,
            image: post.image
          },
          isLiked: post.likes?.some(like => like === useAuthStore.getState().authUser?._id) || false,
          likesCount: post.likes?.length || 0,
          commentsCount: post.comments?.length || 0,
          sharesCount: 0 // Add default share count since backend doesn't have this yet
        };
      });
      
      console.log("Transformed posts:", transformedPosts);
      set({ posts: transformedPosts });
    } catch (error) {
      console.error("Error getting feed posts:", error);
      toast.error(error.response?.data?.message || "Failed to load posts");
    } finally {
      set({ isPostsLoading: false });
    }
  },

  // Toggle like
  toggleLike: async (postId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/like`);
      
      set({
        posts: get().posts.map(post =>
          post._id === postId
            ? {
                ...post,
                isLiked: res.data.isLiked,
                likesCount: res.data.likes,
              }
            : post
        ),
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(error.response?.data?.message || "Failed to update like");
    }
  },

  // Add comment
  addComment: async (postId, content) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment`, {
        content,
      });

      set({
        posts: get().posts.map(post =>
          post._id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), res.data],
                commentsCount: (post.commentsCount || 0) + 1,
              }
            : post
        ),
      });

      return res.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(error.response?.data?.message || "Failed to add comment");
      throw error;
    }
  },

  // Share post - Note: Backend doesn't implement sharing yet
  sharePost: async (postId, text = "") => {
    try {
      // This endpoint doesn't exist in your backend yet
      // const res = await axiosInstance.post(`/posts/${postId}/share`, { text });
      // set({ posts: [res.data, ...get().posts] });
      
      toast.error("Share functionality not implemented yet");
      throw new Error("Share functionality not implemented");
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error("Share functionality not available yet");
      throw error;
    }
  },

  // Subscribe to real-time updates
  subscribeToPostUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newPost", (newPost) => {
      // Transform new post to match frontend expectations
      const transformedPost = {
        ...newPost,
        content: {
          text: newPost.content,
          image: newPost.image
        },
        isLiked: false,
        likesCount: newPost.likes?.length || 0,
        commentsCount: newPost.comments?.length || 0,
        sharesCount: 0
      };
      
      set({ posts: [transformedPost, ...get().posts] });
    });

    socket.on("postUpdate", (update) => {
      set({
        posts: get().posts.map(post =>
          post._id === update.postId ? { ...post, ...update } : post
        ),
      });
    });

    socket.on("newComment", (update) => {
      set({
        posts: get().posts.map(post =>
          post._id === update.postId
            ? {
                ...post,
                comments: [...(post.comments || []), update.comment],
                commentsCount: update.commentsCount,
              }
            : post
        ),
      });
    });

    socket.on("postDeleted", (update) => {
      set({
        posts: get().posts.filter(post => post._id !== update.postId),
      });
    });
  },

  // Unsubscribe from updates
  unsubscribeFromPostUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newPost");
      socket.off("postUpdate");
      socket.off("newComment");
      socket.off("postDeleted");
    }
  },
}));