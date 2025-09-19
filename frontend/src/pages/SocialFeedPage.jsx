// SocialFeedPage.jsx
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { usePostStore } from "../store/usePostStore";
import { useStoryStore } from "../store/useStoryStore";
import PostCard from "../components/PostCard";
import StoriesBar from "../components/StoriesBar";
import CreatePostModal from "../components/CreatePostModal";

const SocialFeedPage = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { posts, getFeedPosts, isPostsLoading, subscribeToPostUpdates, unsubscribeFromPostUpdates } = usePostStore();
  const { subscribeToStoryUpdates, unsubscribeFromStoryUpdates } = useStoryStore();

  useEffect(() => {
    getFeedPosts();
    subscribeToPostUpdates();
    subscribeToStoryUpdates();

    return () => {
      unsubscribeFromPostUpdates();
      unsubscribeFromStoryUpdates();
    };
  }, [getFeedPosts, subscribeToPostUpdates, unsubscribeFromPostUpdates, subscribeToStoryUpdates, unsubscribeFromStoryUpdates]);

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <StoriesBar />

        <div className="bg-base-100 rounded-xl p-4 mb-6 border border-base-200 shadow-sm">
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full text-left p-3 bg-base-200 rounded-full hover:bg-base-300 transition-colors flex items-center gap-3"
            aria-label="Create new post"
          >
            <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-base text-base-content/60">What's on your mind?</span>
          </button>
        </div>

        {isPostsLoading && posts.length === 0 ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-base-100 rounded-xl p-4 border border-base-200 shadow-sm">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-base-300 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-base-300 rounded w-1/3"></div>
                      <div className="h-3 bg-base-300 rounded w-1/5"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    <div className="h-4 bg-base-300 rounded w-1/2"></div>
                    <div className="h-48 bg-base-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-base-100 rounded-xl p-8 text-center border border-base-200 shadow-sm">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-base-content/60 mb-4">
                  Be the first to share something with your friends!
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="btn btn-primary"
                  aria-label="Create first post"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
        )}

        <CreatePostModal 
          isOpen={showCreatePost} 
          onClose={() => setShowCreatePost(false)} 
        />
      </div>
    </div>
  );
};

export default SocialFeedPage;