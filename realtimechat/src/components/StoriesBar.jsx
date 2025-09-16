import React, { useState, useEffect } from "react";
import { Plus, Play } from "lucide-react";
import { useStoryStore } from "../store/useStoryStore";
import { useAuthStore } from "../store/useAuthStore";
import CreateStoryModal from "./CreateStoryModal";
import StoryViewer from "./StoryViewer";

const StoriesBar = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const { stories, getStories, isStoriesLoading } = useStoryStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    console.log("StoriesBar: Getting stories...");
    getStories();
  }, [getStories]);

  // Log stories for debugging
  useEffect(() => {
    console.log("StoriesBar: Stories updated:", stories);
  }, [stories]);

  // Group stories by user
  const groupedStories = React.useMemo(() => {
    console.log("Grouping stories:", stories);

    const grouped = stories.reduce((acc, story) => {
      if (!story.user) {
        console.warn("Story without user:", story);
        return acc;
      }

      const userId = story.user._id;
      if (!acc[userId]) {
        acc[userId] = {
          author: story.user,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    // Sort stories within each group by creation date (newest first)
    Object.values(grouped).forEach(group => {
      group.stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    console.log("Grouped stories:", grouped);
    return Object.values(grouped);
  }, [stories]);

  const userStories = groupedStories.find(group =>
    group.author && authUser && group.author._id === authUser._id
  );

  const otherStories = groupedStories.filter(group =>
    group.author && authUser && group.author._id !== authUser._id
  );

  console.log("User stories:", userStories);
  console.log("Other stories:", otherStories);

  if (isStoriesLoading && stories.length === 0) {
    return (
      <div className="bg-base-100 rounded-lg p-4 mb-4 border border-base-200">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-base-300">
                <div className="skeleton w-full h-full rounded-full"></div>
              </div>
              <div className="skeleton h-3 w-12"></div>
            </div>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="flex flex-col items-center gap-2">
                <div className="skeleton w-16 h-16 rounded-full"></div>
                <div className="skeleton h-3 w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-base-100 rounded-lg p-4 mb-4 border border-base-200">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* Add Your Story */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary flex items-center justify-center group-hover:border-primary/80 transition-colors relative">
                {userStories?.stories[0] ? (
                  <>
                    <img
                      src={
                        userStories.stories[0].content?.image ||
                        authUser?.profilePic ||
                        "/avatar.png"
                      }
                      alt="Your story"
                      className="w-full h-full rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-base-100">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={authUser?.profilePic || "/avatar.png"}
                      alt="You"
                      className="w-full h-full rounded-full object-cover opacity-50"
                    />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-base-100">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  </>
                )}
              </div>
              <span className="text-xs text-center max-w-16 truncate">
                {userStories ? "Add Story" : "Your Story"}
              </span>
            </button>
          </div>

          {/* User's Own Stories (if they exist) */}
          {userStories && (
            <div className="flex-shrink-0">
              <button
                onClick={() => setSelectedStory(userStories)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:from-green-400 group-hover:to-blue-400 transition-colors">
                  <div className="w-full h-full rounded-full border-2 border-base-100 overflow-hidden">
                    <img
                      src={
                        userStories.stories[0]?.content?.image ||
                        userStories.author.profilePic ||
                        "/avatar.png"
                      }
                      alt="Your story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-xs text-center max-w-16 truncate">
                  Your Story
                </span>
              </button>
            </div>
          )}

          {/* Other Users' Stories */}
          {otherStories.map((storyGroup) => (
            <div key={storyGroup.author._id} className="flex-shrink-0">
              <button
                onClick={() => setSelectedStory(storyGroup)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:from-pink-400 group-hover:to-purple-400 transition-colors">
                  <div className="w-full h-full rounded-full border-2 border-base-100 overflow-hidden">
                    <img
                      src={
                        storyGroup.stories[0]?.content?.image ||
                        storyGroup.author.profilePic ||
                        "/avatar.png"
                      }
                      alt={storyGroup.author.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-xs text-center max-w-16 truncate">
                  {storyGroup.author.fullName}
                </span>
              </button>
            </div>
          ))}

          {/* Empty state */}
          {stories.length === 0 && !isStoriesLoading && (
            <div className="flex-1 text-center py-4">
              <p className="text-base-content/60 text-sm">
                No stories yet. Be the first to share one!
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {selectedStory && (
        <StoryViewer
          storyGroup={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </>
  );
};

export default StoriesBar;