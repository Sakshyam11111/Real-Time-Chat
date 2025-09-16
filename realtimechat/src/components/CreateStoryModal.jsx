import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Type, Palette } from "lucide-react";
import { useStoryStore } from "../store/useStoryStore";
import toast from "react-hot-toast";

const BACKGROUND_COLORS = [
  "#000000", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#FF7675", "#6C5CE7", "#00B894"
];

const CreateStoryModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [mode, setMode] = useState("text"); // "text" or "image"
  const fileInputRef = useRef(null);
  const { createStory, isCreatingStory, getStories } = useStoryStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setMode("image");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !image) {
      toast.error("Please add some content to your story");
      return;
    }

    try {
      // Create the story data object to match your backend expectations
      const storyData = {
        text: text.trim(),
        image: mode === "image" ? image : null,
        backgroundColor: mode === "text" ? backgroundColor : "#000000",
      };

      console.log("Creating story with data:", storyData);
      
      await createStory(storyData);
      
      console.log("Story created, refreshing stories...");
      
      // The createStory function already calls getStories(), but let's add a small delay to ensure it completes
      setTimeout(async () => {
        await getStories();
        console.log("Stories refreshed after story creation");
      }, 500);
      
      // Reset form
      setText("");
      setImage(null);
      setMode("text");
      setBackgroundColor("#000000");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      // Error already handled in store
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Story</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`btn btn-sm flex-1 ${mode === "text" ? "btn-primary" : "btn-outline"}`}
            >
              <Type className="w-4 h-4 mr-1" />
              Text
            </button>
            <button
              type="button"
              onClick={() => setMode("image")}
              className={`btn btn-sm flex-1 ${mode === "image" ? "btn-primary" : "btn-outline"}`}
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Image
            </button>
          </div>

          {/* Preview */}
          <div 
            className="w-full h-64 rounded-lg flex items-center justify-center text-white relative overflow-hidden"
            style={{ 
              backgroundColor: mode === "text" ? backgroundColor : "#000",
              backgroundImage: mode === "image" && image ? `url(${image})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {text && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p 
                  className="text-lg font-medium text-center break-words max-w-full"
                  style={{
                    textShadow: mode === "image" ? "2px 2px 4px rgba(0,0,0,0.8)" : "none",
                    color: mode === "image" ? "#ffffff" : "#ffffff"
                  }}
                >
                  {text}
                </p>
              </div>
            )}
            {!text && !image && (
              <p className="text-white/60">Your story preview</p>
            )}
          </div>

          {/* Text Input */}
          <textarea
            className="textarea textarea-bordered w-full min-h-[80px] resize-none"
            placeholder="Add text to your story..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
          />

          {/* Controls */}
          {mode === "text" && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4" />
                <span className="text-sm">Background Color</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBackgroundColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      backgroundColor === color ? "border-primary" : "border-base-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {mode === "image" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-outline w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose Image
              </button>
            </div>
          )}

          <div className="text-sm text-base-content/60 text-right">
            {text.length}/500
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isCreatingStory}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingStory || (!text.trim() && !image)}
              className="btn btn-primary flex-1"
            >
              {isCreatingStory ? "Creating..." : "Share Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;