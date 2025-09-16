import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useStoryStore } from "../store/useStoryStore";
import { getTimeAgo } from "../lib/utils";

const StoryViewer = ({ storyGroup, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeAgo, setTimeAgo] = useState("");
  const { viewStory } = useStoryStore();

  const currentStory = storyGroup?.stories[currentStoryIndex];

  // Update time ago every minute
  useEffect(() => {
    if (!currentStory) return;

    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(currentStory.createdAt));
    };

    updateTimeAgo(); // Initial update
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [currentStory]);

  useEffect(() => {
    if (!currentStory) return;

    // Mark story as viewed
    viewStory(currentStory._id);
  }, [currentStory, viewStory]);

  useEffect(() => {
    if (!isPlaying) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next story or close
          if (currentStoryIndex < storyGroup.stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStoryIndex, storyGroup.stories.length, onClose, isPlaying]);

  const goToPrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  };

  const goToNext = () => {
    if (currentStoryIndex < storyGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePause = () => setIsPlaying(false);
  const handleResume = () => setIsPlaying(true);

  if (!currentStory) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {storyGroup.stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: index < currentStoryIndex ? '100%' : 
                       index === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Story Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src={storyGroup.author.profilePic || "/avatar.png"}
            alt={storyGroup.author.fullName}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <h3 className="text-white font-medium text-sm">
              {storyGroup.author.fullName}
            </h3>
            <p className="text-white/70 text-xs">
              {timeAgo}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Story Content */}
      <div
        className="w-full h-full flex items-center justify-center relative"
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {currentStory.content?.image ? (
          <img
            src={currentStory.content.image}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white p-8"
            style={{
              backgroundColor: currentStory.content?.backgroundColor || '#000000'
            }}
          >
            <div className="text-center max-w-md">
              <p className="text-2xl font-medium leading-relaxed break-words">
                {currentStory.content?.text || "No content"}
              </p>
            </div>
          </div>
        )}

        {/* Text overlay for image stories */}
        {currentStory.content?.image && currentStory.content?.text && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-lg p-4 max-w-md mx-4">
              <p className="text-white text-center text-lg font-medium">
                {currentStory.content.text}
              </p>
            </div>
          </div>
        )}

        {/* Navigation areas */}
        <div className="absolute inset-0 flex">
          <button
            className="flex-1 flex items-center justify-start pl-4"
            onClick={goToPrevious}
            disabled={currentStoryIndex === 0}
          >
            {currentStoryIndex > 0 && (
              <ChevronLeft className="w-8 h-8 text-white/70 hover:text-white" />
            )}
          </button>
          <button
            className="flex-1 flex items-center justify-end pr-4"
            onClick={goToNext}
          >
            <ChevronRight className="w-8 h-8 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Story info at bottom */}
      <div className="absolute bottom-4 left-4 right-4 text-white/70 text-sm z-10">
        <div className="flex items-center justify-between">
          <span>
            {currentStoryIndex + 1} of {storyGroup.stories.length}
          </span>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{currentStory.viewers?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;