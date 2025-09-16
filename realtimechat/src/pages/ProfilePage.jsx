import React, { useEffect, useState } from "react";
import { Camera, MapPin, Calendar, Clock, Eye, Trash2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useStoryStore } from "../store/useStoryStore";
import { usePostStore } from "../store/usePostStore";
import { getTimeAgo } from "../lib/utils";
import PostCard from "../components/PostCard"; // Assuming PostCard is imported from components

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { userStories, getUserStories, isUserStoriesLoading, deleteStory } = useStoryStore();
  const { posts, getFeedPosts, isPostsLoading, deletePost } = usePostStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (authUser?._id) {
      getUserStories(authUser._id);
      getFeedPosts();
    }
  }, [getUserStories, getFeedPosts, authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImage(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
    reader.readAsDataURL(file);
  };

  const formatTimeLeft = (timeLeft) => {
    if (timeLeft <= 0) return "Expired";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      await deleteStory(storyId);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  const activeStories = userStories.filter((story) => !story.isExpired);
  const expiredStories = userStories.filter((story) => story.isExpired);
  const userPosts = posts.filter((post) => post.author._id === authUser?._id);

  return (
    <div className="min-h-screen bg-base-200 pt-20">
      <div className="max-w-2xl mx-auto p-4"> {/* Adjusted to match SocialFeedPage width */}
        {/* Profile Header */}
        <div className="bg-base-100 rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img
                src={selectedImage || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary-focus text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{authUser?.fullName}</h1>
              <p className="text-base-content/60 mb-4">@{authUser?.email.split("@")[0]}</p>

              <div className="flex justify-center md:justify-start gap-6 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{activeStories.length}</div>
                  <div className="text-sm text-base-content/60">Active Stories</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{expiredStories.length}</div>
                  <div className="text-sm text-base-content/60">Past Stories</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{userPosts.length}</div>
                  <div className="text-sm text-base-content/60">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">
                    {userStories.reduce((total, story) => total + story.viewers.length, 0)}
                  </div>
                  <div className="text-sm text-base-content/60">Total Views</div>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-base-content/60">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(authUser?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-base-100 rounded-lg mb-6 shadow-sm">
          <div className="flex border-b border-base-200">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 px-6 text-center transition-colors ${
                activeTab === "posts"
                  ? "border-b-2 border-primary text-primary font-medium"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              Posts ({userPosts.length})
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`flex-1 py-4 px-6 text-center transition-colors ${
                activeTab === "stories"
                  ? "border-b-2 border-primary text-primary font-medium"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              Stories ({userStories.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "posts" && (
          <div>
            {isPostsLoading && userPosts.length === 0 ? (
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
            ) : userPosts.length === 0 ? (
              <div className="bg-base-100 rounded-lg p-8 text-center border border-base-200">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-base-content/60 mb-4">Your posts will appear here when you create them.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {userPosts.map((post) => (
                  <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "stories" && (
          <div>
            {isUserStoriesLoading ? (
              <div className="bg-base-100 rounded-lg p-8 text-center shadow-sm">
                <div className="loading loading-spinner loading-md"></div>
                <p className="mt-2 text-base-content/60">Loading your stories...</p>
              </div>
            ) : userStories.length === 0 ? (
              <div className="bg-base-100 rounded-lg p-8 text-center shadow-sm">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
                <p className="text-base-content/60">Your stories will appear here when you create them.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activeStories.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      Active Stories ({activeStories.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeStories.map((story) => (
                        <StoryCard
                          key={story._id}
                          story={story}
                          onDelete={handleDeleteStory}
                          formatTimeLeft={formatTimeLeft}
                          isActive={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {expiredStories.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-base-content/40" />
                      Past Stories ({expiredStories.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {expiredStories.map((story) => (
                        <StoryCard
                          key={story._id}
                          story={story}
                          onDelete={handleDeleteStory}
                          formatTimeLeft={formatTimeLeft}
                          isActive={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// StoryCard Component (unchanged)
const StoryCard = ({ story, onDelete, formatTimeLeft, isActive }) => {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(story.createdAt));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [story.createdAt]);

  return (
    <div
      className={`bg-base-100 rounded-lg overflow-hidden shadow-sm border-2 transition-all hover:shadow-md ${
        isActive ? "border-green-200" : "border-base-200 opacity-75"
      }`}
    >
      <div className="aspect-[9/16] relative bg-base-200">
        {story.content?.image ? (
          <img src={story.content.image} alt="Story" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: story.content?.backgroundColor || "#000000" }}
          >
            <div className="text-center p-4">
              <p className="text-white text-lg font-medium break-words max-w-full">
                {story.content?.text || "Text story"}
              </p>
            </div>
          </div>
        )}

        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          {isActive ? "Active" : "Expired"}
        </div>

        <button
          onClick={() => onDelete(story._id)}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          title="Delete story"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-base-content/60">{timeAgo}</span>
          <div className="flex items-center gap-1 text-sm text-base-content/60">
            <Eye className="w-4 h-4" />
            {story.viewers.length}
          </div>
        </div>

        {isActive && (
          <div className="text-xs text-green-600 font-medium">{formatTimeLeft(story.timeLeft)}</div>
        )}

        {story.content?.text && <p className="text-sm mt-2 line-clamp-2">{story.content.text}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;