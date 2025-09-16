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
      <div className="max-w-2xl mx-auto p-4">
        {/* Stories Section */}
        <StoriesBar />

        {/* Create Post Button */}
        <div className="bg-base-100 rounded-lg p-4 mb-4 border border-base-200">
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full text-left p-3 bg-base-200 rounded-full hover:bg-base-300 transition-colors flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <span className="text-base-content/60">What's on your mind?</span>
          </button>
        </div>

        {/* Posts Feed */}
        {isPostsLoading && posts.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-base-100 rounded-lg p-4 border border-base-200">
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-base-300 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-base-300 rounded w-1/4"></div>
                      <div className="h-3 bg-base-300 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-base-300 rounded"></div>
                    <div className="h-4 bg-base-300 rounded w-3/4"></div>
                    <div className="h-48 bg-base-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            {posts.length === 0 ? (
              <div className="bg-base-100 rounded-lg p-8 text-center border border-base-200">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-base-content/60 mb-4">
                  Be the first to share something with your friends!
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="btn btn-primary"
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