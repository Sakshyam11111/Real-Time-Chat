import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const usePostStore = create((set, get) => ({
  posts: [],
  isPostsLoading: false,
  isCreatingPost: false,
  isDeletingPost: false,
  isSharingPost: false,

  // Create post
  createPost: async (postData) => {
    set({ isCreatingPost: true });
    try {
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

  // Share post
  sharePost: async (postId, content = "") => {
    set({ isSharingPost: true });
    try {
      const res = await axiosInstance.post(`/posts/${postId}/share`, { content });
      set({ posts: [res.data, ...get().posts] });
      toast.success("Post shared successfully!");
      return res.data;
    } catch (error) {
      console.error("Error sharing post:", error);
      toast.error(error.response?.data?.error || "Failed to share post");
      throw error;
    } finally {
      set({ isSharingPost: false });
    }
  },

  // Delete post
  deletePost: async (postId) => {
    set({ isDeletingPost: true });
    try {
      const response = await axiosInstance.delete(`/posts/${postId}`);
      const currentPosts = get().posts;
      const filteredPosts = currentPosts.filter(post => post._id !== postId);
      
      set({ posts: filteredPosts });
      toast.success("Post deleted successfully!");
      return response.data;
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.response?.data?.error || "Failed to delete post");
      throw error;
    } finally {
      set({ isDeletingPost: false });
    }
  },

  // Get feed posts
  getFeedPosts: async (page = 1) => {
    set({ isPostsLoading: true });
    try {
      const res = await axiosInstance.get("/posts");
      
      const transformedPosts = res.data.map(post => ({
        ...post,
        isLiked: post.likes?.includes(useAuthStore.getState().authUser?._id) || false,
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
        sharesCount: post.shares?.length || 0
      }));
      
      set({ posts: transformedPosts });
    } catch (error) {
      console.error("Error getting feed posts:", error);
      toast.error(error.response?.data?.message || "Failed to load posts");
    } finally {
      set({ isPostsLoading: false });
    }
  },

  // Toggle like on post
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
                likes: res.data.isLiked 
                  ? [...(post.likes || []), useAuthStore.getState().authUser._id]
                  : (post.likes || []).filter(id => id !== useAuthStore.getState().authUser._id)
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
      const res = await axiosInstance.post(`/posts/${postId}/comment`, { content });

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

  // Like comment
  likeComment: async (postId, commentId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment/${commentId}/like`);
      
      set({
        posts: get().posts.map(post =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        likes: res.data.isLiked 
                          ? [...(comment.likes || []), useAuthStore.getState().authUser._id]
                          : (comment.likes || []).filter(id => id !== useAuthStore.getState().authUser._id)
                      }
                    : comment
                )
              }
            : post
        ),
      });
    } catch (error) {
      console.error("Error liking comment:", error);
      toast.error(error.response?.data?.error || "Failed to like comment");
    }
  },

  // Reply to comment
  replyToComment: async (postId, commentId, content) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment/${commentId}/reply`, { content });

      set({
        posts: get().posts.map(post =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), res.data]
                      }
                    : comment
                )
              }
            : post
        ),
      });

      return res.data;
    } catch (error) {
      console.error("Error replying to comment:", error);
      toast.error(error.response?.data?.error || "Failed to reply");
      throw error;
    }
  },

  // Like reply
  likeReply: async (postId, commentId, replyId) => {
    try {
      const res = await axiosInstance.post(`/posts/${postId}/comment/${commentId}/reply/${replyId}/like`);
      
      set({
        posts: get().posts.map(post =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map(reply =>
                          reply._id === replyId
                            ? {
                                ...reply,
                                likes: res.data.isLiked 
                                  ? [...(reply.likes || []), useAuthStore.getState().authUser._id]
                                  : (reply.likes || []).filter(id => id !== useAuthStore.getState().authUser._id)
                              }
                            : reply
                        )
                      }
                    : comment
                )
              }
            : post
        ),
      });
    } catch (error) {
      console.error("Error liking reply:", error);
      toast.error(error.response?.data?.error || "Failed to like reply");
    }
  },

  // Subscribe to real-time updates
  subscribeToPostUpdates: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newPost", (newPost) => {
      const transformedPost = {
        ...newPost,
        isLiked: false,
        likesCount: newPost.likes?.length || 0,
        commentsCount: newPost.comments?.length || 0,
        sharesCount: newPost.shares?.length || 0
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

    socket.on("newReply", (update) => {
      set({
        posts: get().posts.map(post =>
          post._id === update.postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment._id === update.commentId
                    ? {
                        ...comment,
                        replies: [...(comment.replies || []), update.reply]
                      }
                    : comment
                )
              }
            : post
        ),
      });
    });

    socket.on("commentUpdate", (update) => {
      set({
        posts: get().posts.map(post =>
          post._id === update.postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment._id === update.commentId
                    ? { ...comment, likes: update.likes, isLiked: update.isLiked }
                    : comment
                )
              }
            : post
        ),
      });
    });

    socket.on("replyUpdate", (update) => {
      set({
        posts: get().posts.map(post =>
          post._id === update.postId
            ? {
                ...post,
                comments: post.comments.map(comment =>
                  comment._id === update.commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map(reply =>
                          reply._id === update.replyId
                            ? { ...reply, likes: update.likes, isLiked: update.isLiked }
                            : reply
                        )
                      }
                    : comment
                )
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
      socket.off("newReply");
      socket.off("commentUpdate");
      socket.off("replyUpdate");
      socket.off("postDeleted");
    }
  },
}));