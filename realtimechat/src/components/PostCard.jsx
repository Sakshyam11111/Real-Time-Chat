import React, { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Send, X, Trash2, Edit } from "lucide-react";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState("");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { toggleLike, addComment, sharePost, deletePost } = usePostStore();
  const { authUser } = useAuthStore();

  const handleLike = () => {
    toggleLike(post._id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment(post._id, commentText.trim());
      setCommentText("");
    } catch (error) {
      // Error handled in store
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await sharePost(post._id, shareText.trim());
      setShareText("");
      setShowShareModal(false);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      setShowDeleteConfirm(false);
      setShowOptionsMenu(false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleOptionsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
    setShowOptionsMenu(false);
  };

  const handleDeleteConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelete();
  };

  // Check if current user is the author of the post
  const isAuthor = authUser?._id === post.author?._id;

  return (
    <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <img
            src={post.author?.profilePic || "/avatar.png"}
            alt={post.author?.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-medium text-sm">{post.author?.fullName}</h3>
            <p className="text-xs text-base-content/60">
              {formatMessageTime(post.createdAt)}
            </p>
          </div>
        </div>
        
        {/* Options Menu */}
        <div className="relative">
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={handleOptionsClick}
            type="button"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showOptionsMenu && (
            <>
              <div className="absolute right-0 top-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg py-2 z-50 min-w-32">
                {isAuthor && (
                  <button
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2 text-red-600"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowOptionsMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-base-200"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        {post.content?.text && (
          <p className="text-sm mb-3 whitespace-pre-wrap">{post.content.text}</p>
        )}
      </div>

      {/* Post Image */}
      {post.content?.image && (
        <div className="px-4 pb-3">
          <img
            src={post.content.image}
            alt="Post content"
            className="w-full rounded-lg max-h-96 object-cover"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-base-200 flex items-center justify-between text-sm text-base-content/60">
        <span>{post.likesCount} likes</span>
        <div className="flex gap-4">
          <span>{post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-base-200 flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`btn btn-ghost btn-sm flex-1 ${
            post.isLiked ? "text-red-500" : ""
          }`}
        >
          <Heart className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="btn btn-ghost btn-sm flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Comment
        </button>
        <button
          onClick={() => setShowShareModal(true)}
          className="btn btn-ghost btn-sm flex-1"
        >
          <Share className="w-4 h-4 mr-2" />
          Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-base-200 p-4">
          {/* Comments List */}
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {post.comments?.map((comment, index) => (
              <div key={index} className="flex gap-2">
                <img
                  src={comment.user?.profilePic || "/avatar.png"}
                  alt={comment.user?.fullName}
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="bg-base-200 rounded-lg px-3 py-2">
                    <p className="font-medium text-sm">{comment.user?.fullName}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <p className="text-xs text-base-content/60 mt-1">
                    {formatMessageTime(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <form onSubmit={handleComment} className="flex gap-2">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="You"
              className="w-6 h-6 rounded-full flex-shrink-0 mt-1"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="input input-bordered input-sm flex-1"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="btn btn-primary btn-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg w-full max-w-md border border-base-300">
              <div className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Post</h3>
                <p className="text-base-content/60 mb-6">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                    className="btn btn-ghost flex-1"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="btn btn-error flex-1"
                    type="button"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Click outside to close options menu */}
      {showOptionsMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={(e) => {
            e.preventDefault();
            setShowOptionsMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default PostCard;