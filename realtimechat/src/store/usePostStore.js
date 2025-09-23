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
        image: postData.image,
      };

      const res = await axiosInstance.post("/posts", payload);
      const newPost = {
        ...res.data,
        likes: Array.isArray(res.data.likes) ? res.data.likes : [],
        comments: Array.isArray(res.data.comments) ? res.data.comments : [],
        shares: Array.isArray(res.data.shares) ? res.data.shares : [],
      };
      set({ posts: [newPost, ...get().posts] });
      toast.success("Post created successfully!");
      return newPost;
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
      const sharedPost = {
        ...res.data,
        likes: Array.isArray(res.data.likes) ? res.data.likes : [],
        comments: Array.isArray(res.data.comments) ? res.data.comments : [],
        shares: Array.isArray(res.data.shares) ? res.data.shares : [],
      };
      set({ posts: [sharedPost, ...get().posts] });
      toast.success("Post shared successfully!");
      return sharedPost;
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
      const filteredPosts = currentPosts.filter((post) => post._id !== postId);

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
      const authUserId = useAuthStore.getState().authUser?._id;
      const transformedPosts = res.data.map((post) => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes : [],
        comments: Array.isArray(post.comments) ? post.comments : [],
        shares: Array.isArray(post.shares) ? post.shares : [],
        isLiked: Array.isArray(post.likes) && post.likes.includes(authUserId) || false,
        likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
        commentsCount: Array.isArray(post.comments) ? post.comments.length : 0,
        sharesCount: Array.isArray(post.shares) ? post.shares.length : 0,
        comments: Array.isArray(post.comments)
          ? post.comments.map((comment) => ({
              ...comment,
              likes: Array.isArray(comment.likes) ? comment.likes : [],
              replies: Array.isArray(comment.replies)
                ? comment.replies.map((reply) => ({
                    ...reply,
                    likes: Array.isArray(reply.likes) ? reply.likes : [],
                  }))
                : [],
            }))
          : [],
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
      const authUserId = useAuthStore.getState().authUser?._id;
      set({
        posts: get().posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: res.data.isLiked,
                likes: res.data.isLiked
                  ? [...(Array.isArray(post.likes) ? post.likes : []), authUserId]
                  : (Array.isArray(post.likes) ? post.likes : []).filter((id) => id !== authUserId),
                likesCount: res.data.isLiked
                  ? (Array.isArray(post.likes) ? post.likes.length : 0) + 1
                  : (Array.isArray(post.likes) ? post.likes.length : 0) - 1,
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
      const newComment = {
        ...res.data,
        likes: Array.isArray(res.data.likes) ? res.data.likes : [],
        replies: Array.isArray(res.data.replies) ? res.data.replies : [],
      };
      set({
        posts: get().posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...(Array.isArray(post.comments) ? post.comments : []), newComment],
                commentsCount: (Array.isArray(post.comments) ? post.comments.length : 0) + 1,
              }
            : post
        ),
      });
      return newComment;
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
      const authUserId = useAuthStore.getState().authUser?._id;
      set({
        posts: get().posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        likes: res.data.isLiked
                          ? [...(Array.isArray(comment.likes) ? comment.likes : []), authUserId]
                          : (Array.isArray(comment.likes) ? comment.likes : []).filter((id) => id !== authUserId),
                      }
                    : comment
                ),
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
      const newReply = {
        ...res.data,
        likes: Array.isArray(res.data.likes) ? res.data.likes : [],
      };
      set({
        posts: get().posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        replies: [...(Array.isArray(comment.replies) ? comment.replies : []), newReply],
                      }
                    : comment
                ),
              }
            : post
        ),
      });
      return newReply;
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
      const authUserId = useAuthStore.getState().authUser?._id;
      set({
        posts: get().posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map((reply) =>
                          reply._id === replyId
                            ? {
                                ...reply,
                                likes: res.data.isLiked
                                  ? [...(Array.isArray(reply.likes) ? reply.likes : []), authUserId]
                                  : (Array.isArray(reply.likes) ? reply.likes : []).filter((id) => id !== authUserId),
                              }
                            : reply
                        ),
                      }
                    : comment
                ),
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
        likes: Array.isArray(newPost.likes) ? newPost.likes : [],
        comments: Array.isArray(newPost.comments) ? newPost.comments : [],
        shares: Array.isArray(newPost.shares) ? newPost.shares : [],
        isLiked: false,
        likesCount: Array.isArray(newPost.likes) ? newPost.likes.length : 0,
        commentsCount: Array.isArray(newPost.comments) ? newPost.comments.length : 0,
        sharesCount: Array.isArray(newPost.shares) ? newPost.shares.length : 0,
        comments: Array.isArray(newPost.comments)
          ? newPost.comments.map((comment) => ({
              ...comment,
              likes: Array.isArray(comment.likes) ? comment.likes : [],
              replies: Array.isArray(comment.replies)
                ? comment.replies.map((reply) => ({
                    ...reply,
                    likes: Array.isArray(reply.likes) ? reply.likes : [],
                  }))
                : [],
            }))
          : [],
      };
      set({ posts: [transformedPost, ...get().posts] });
    });

    socket.on("postUpdate", (update) => {
      set({
        posts: get().posts.map((post) =>
          post._id === update.postId
            ? {
                ...post,
                ...update,
                likes: Array.isArray(update.likes) ? update.likes : [],
                comments: Array.isArray(update.comments) ? update.comments : [],
                shares: Array.isArray(update.shares) ? update.shares : [],
              }
            : post
        ),
      });
    });

    socket.on("newComment", (update) => {
      set({
        posts: get().posts.map((post) =>
          post._id === update.postId
            ? {
                ...post,
                comments: [...(Array.isArray(post.comments) ? post.comments : []), {
                  ...update.comment,
                  likes: Array.isArray(update.comment.likes) ? update.comment.likes : [],
                  replies: Array.isArray(update.comment.replies) ? update.comment.replies : [],
                }],
                commentsCount: update.commentsCount,
              }
            : post
        ),
      });
    });

    socket.on("newReply", (update) => {
      set({
        posts: get().posts.map((post) =>
          post._id === update.postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === update.commentId
                    ? {
                        ...comment,
                        replies: [...(Array.isArray(comment.replies) ? comment.replies : []), {
                          ...update.reply,
                          likes: Array.isArray(update.reply.likes) ? update.reply.likes : [],
                        }],
                      }
                    : comment
                ),
              }
            : post
        ),
      });
    });

    socket.on("commentUpdate", (update) => {
      set({
        posts: get().posts.map((post) =>
          post._id === update.postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === update.commentId
                    ? {
                        ...comment,
                        likes: Array.isArray(update.likes) ? update.likes : [],
                        isLiked: update.isLiked,
                      }
                    : comment
                ),
              }
            : post
        ),
      });
    });

    socket.on("replyUpdate", (update) => {
      set({
        posts: get().posts.map((post) =>
          post._id === update.postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === update.commentId
                    ? {
                        ...comment,
                        replies: comment.replies.map((reply) =>
                          reply._id === update.replyId
                            ? {
                                ...reply,
                                likes: Array.isArray(update.likes) ? update.likes : [],
                                isLiked: update.isLiked,
                              }
                            : reply
                        ),
                      }
                    : comment
                ),
              }
            : post
        ),
      });
    });

    socket.on("postDeleted", (update) => {
      set({
        posts: get().posts.filter((post) => post._id !== update.postId),
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