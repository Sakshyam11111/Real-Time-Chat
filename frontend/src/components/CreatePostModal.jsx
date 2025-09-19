import React, { useState, useRef } from "react";
import { X, Image as ImageIcon, Smile } from "lucide-react";
import { usePostStore } from "../store/usePostStore";
import toast from "react-hot-toast";

const EMOJIS = [
  "😊", "😂", "❤️", "👍", "🔥", "💯", "🎉", "😍", "🤔", "😎",
  "🥳", "😢", "😮", "😴", "🤗", "😘", "🙄", "😤", "🤩", "🥰"
];

const CreatePostModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const fileInputRef = useRef(null);
  const { createPost, isCreatingPost } = usePostStore();

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
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !image) {
      toast.error("Please add some content to your post");
      return;
    }

    try {
      await createPost({
        text: text.trim(),
        image,
      });
      
      // Reset form
      setText("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  const addEmoji = (emoji) => {
    setText(prev => prev + emoji);
    setShowEmojis(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <textarea
            className="textarea textarea-bordered w-full min-h-[100px] resize-none"
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
          />

          {image && (
            <div className="relative">
              <img
                src={image}
                alt="Preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 btn btn-circle btn-sm bg-base-100/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                className="btn btn-ghost btn-sm"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="btn btn-ghost btn-sm"
                >
                  <Smile className="w-4 h-4" />
                </button>

                {showEmojis && (
                  <div className="absolute bottom-full left-0 mb-2 bg-base-100 border rounded-lg p-2 shadow-lg grid grid-cols-5 gap-1 w-48 z-10">
                    {EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="btn btn-ghost btn-sm text-lg p-1 h-auto min-h-0"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-base-content/60">
              {text.length}/2000
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingPost || (!text.trim() && !image)}
              className="btn btn-primary flex-1"
            >
              {isCreatingPost ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;