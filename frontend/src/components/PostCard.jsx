import React, { useState } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Send, X, Trash2, Edit, Smile, Reply, ExternalLink, Copy, Download } from "lucide-react";
import { usePostStore } from "../store/usePostStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useSocialShare } from "../lib/sharingUtils";
import SocialShareModal from "./SocialShareModal";

const EMOJIS = [
  "😊", "😂", "❤️", "👍", "🔥", "💯", "🎉", "😍", "🤔", "😎",
  "🥳", "😢", "😮", "😴", "🤗", "😘", "🙄", "😤", "🤩", "🥰"
];

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSocialShareModal, setSocialShareModal] = useState(false);
  const [shareText, setShareText] = useState("");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyEmojis, setShowReplyEmojis] = useState(false);
  
  const { toggleLike, addComment, sharePost, deletePost, likeComment, replyToComment, likeReply } = usePostStore();
  const { authUser } = useAuthStore();
  const socialShare = useSocialShare(post);

  const handleLike = () => {
    toggleLike(post._id);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment(post._id, commentText.trim());
      setCommentText("");
      setShowEmojis(false);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      await replyToComment(post._id, commentId, replyText.trim());
      setReplyText("");
      setReplyingTo(null);
      setShowReplyEmojis(false);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleCommentLike = (commentId) => {
    likeComment(post._id, commentId);
  };

  const handleReplyLike = (commentId, replyId) => {
    likeReply(post._id, commentId, replyId);
  };

  const handleInternalShare = async (e) => {
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

  const addEmoji = (emoji) => {
    setCommentText(prev => prev + emoji);
    setShowEmojis(false);
  };

  const addReplyEmoji = (emoji) => {
    setReplyText(prev => prev + emoji);
    setShowReplyEmojis(false);
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

  const isAuthor = authUser?._id === post.author?._id;
  const isSharedPost = post.isShared && post.originalPost;

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
              {isSharedPost && <span className="ml-2 text-primary">shared a post</span>}
            </p>
          </div>
        </div>
        
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
                  onClick={() => setSocialShareModal(true)}
                  className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                  type="button"
                >
                  <ExternalLink className="w-4 h-4" />
                  Share Externally
                </button>
                <button
                  onClick={socialShare.copyToClipboard}
                  className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                  type="button"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                {post.image && (
                  <button
                    onClick={socialShare.downloadImage}
                    className="w-full text-left px-4 py-2 hover:bg-base-200 flex items-center gap-2"
                    type="button"
                  >
                    <Download className="w-4 h-4" />
                    Download Image
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

      {/* Share Content */}
      {isSharedPost && post.shareContent && (
        <div className="px-4 pb-2">
          <p className="text-sm text-base-content/80">{post.shareContent}</p>
        </div>
      )}

      {/* Original Post Content (if shared) or Regular Post Content */}
      {isSharedPost ? (
        <div className="mx-4 mb-2 border border-base-300 rounded-lg">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <img
                src={post.originalPost.author?.profilePic || "/avatar.png"}
                alt={post.originalPost.author?.fullName}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{post.originalPost.author?.fullName}</span>
              <span className="text-xs text-base-content/60">
                {formatMessageTime(post.originalPost.createdAt)}
              </span>
            </div>
            
            {post.originalPost.content && (
              <p className="text-sm mb-2">{post.originalPost.content}</p>
            )}
            
            {post.originalPost.image && (
              <img
                src={post.originalPost.image}
                alt="Original post content"
                className="w-full rounded-lg max-h-96 object-cover"
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Regular Post Content */}
          <div className="px-4 pb-2">
            {post.content && (
              <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
            )}
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="px-4 pb-3">
              <img
                src={post.image}
                alt="Post content"
                className="w-full rounded-lg max-h-96 object-cover"
              />
            </div>
          )}
        </>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-base-200 flex items-center justify-between text-sm text-base-content/60">
        <span>{post.likes?.length || 0} likes</span>
        <div className="flex gap-4">
          <span>{post.comments?.length || 0} comments</span>
          <span>{post.shares?.length || 0} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-base-200 flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`btn btn-ghost btn-sm flex-1 ${
            post.likes?.includes(authUser?._id) ? "text-red-500" : ""
          }`}
        >
          <Heart className={`w-4 h-4 mr-2 ${post.likes?.includes(authUser?._id) ? "fill-current" : ""}`} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="btn btn-ghost btn-sm flex-1"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Comment
        </button>
        
        {/* Share Button with Dropdown */}
        <div className="relative flex-1">
          <div className="dropdown dropdown-top dropdown-end w-full">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm w-full"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </button>
            <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-56 mb-2">
              <li>
                <a onClick={() => setSocialShareModal(true)} className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Share to social media
                </a>
              </li>
              <li>
                <a onClick={() => setShowShareModal(true)} className="flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  Share on platform
                </a>
              </li>
              <li>
                <a onClick={socialShare.handleNativeShare} className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Native share
                </a>
              </li>
              <li>
                <a onClick={socialShare.copyToClipboard} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {socialShare.copySuccess ? 'Copied!' : 'Copy link'}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-base-200 p-4">
          {/* Comments List */}
          <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="space-y-2">
                {/* Main Comment */}
                <div className="flex gap-2">
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
                    
                    {/* Comment Actions */}
                    <div className="flex items-center gap-4 mt-1 text-xs text-base-content/60">
                      <span>{formatMessageTime(comment.createdAt)}</span>
                      <button
                        onClick={() => handleCommentLike(comment._id)}
                        className={`flex items-center gap-1 hover:text-red-500 ${
                          comment.likes?.includes(authUser?._id) ? "text-red-500" : ""
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${comment.likes?.includes(authUser?._id) ? "fill-current" : ""}`} />
                        {comment.likes?.length || 0}
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        className="hover:text-primary"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies?.length > 0 && (
                      <div className="ml-4 mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex gap-2">
                            <img
                              src={reply.user?.profilePic || "/avatar.png"}
                              alt={reply.user?.fullName}
                              className="w-5 h-5 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="bg-base-300 rounded-lg px-3 py-2">
                                <p className="font-medium text-xs">{reply.user?.fullName}</p>
                                <p className="text-sm">{reply.content}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-base-content/60">
                                <span>{formatMessageTime(reply.createdAt)}</span>
                                <button
                                  onClick={() => handleReplyLike(comment._id, reply._id)}
                                  className={`flex items-center gap-1 hover:text-red-500 ${
                                    reply.likes?.includes(authUser?._id) ? "text-red-500" : ""
                                  }`}
                                >
                                  <Heart className={`w-3 h-3 ${reply.likes?.includes(authUser?._id) ? "fill-current" : ""}`} />
                                  {reply.likes?.length || 0}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                      <div className="mt-2 ml-4">
                        <form onSubmit={(e) => handleReply(e, comment._id)} className="flex gap-2">
                          <img
                            src={authUser?.profilePic || "/avatar.png"}
                            alt="You"
                            className="w-5 h-5 rounded-full flex-shrink-0 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={`Reply to ${comment.user?.fullName}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="input input-bordered input-sm flex-1"
                                maxLength={500}
                              />
                              
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowReplyEmojis(!showReplyEmojis)}
                                  className="btn btn-ghost btn-sm"
                                >
                                  <Smile className="w-4 h-4" />
                                </button>

                                {showReplyEmojis && (
                                  <div className="absolute bottom-full right-0 mb-2 bg-base-100 border rounded-lg p-2 shadow-lg grid grid-cols-5 gap-1 w-48 z-20">
                                    {EMOJIS.map((emoji, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => addReplyEmoji(emoji)}
                                        className="btn btn-ghost btn-sm text-lg p-1 h-auto min-h-0"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <button
                                type="submit"
                                disabled={!replyText.trim()}
                                className="btn btn-primary btn-sm"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-xs text-base-content/60 mt-1">
                              {replyText.length}/500
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
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
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input input-bordered input-sm flex-1"
                  maxLength={500}
                />
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojis(!showEmojis)}
                    className="btn btn-ghost btn-sm"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {showEmojis && (
                    <div className="absolute bottom-full right-0 mb-2 bg-base-100 border rounded-lg p-2 shadow-lg grid grid-cols-5 gap-1 w-48 z-20">
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

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="btn btn-primary btn-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-base-content/60 mt-1">
                {commentText.length}/500
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Internal Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Share Post</h2>
              <button onClick={() => setShowShareModal(false)} className="btn btn-ghost btn-sm btn-circle">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInternalShare} className="p-4 space-y-4">
              <textarea
                className="textarea textarea-bordered w-full min-h-[100px] resize-none"
                placeholder="Add your thoughts about this post..."
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                maxLength={500}
              />

              <div className="text-sm text-base-content/60 text-right">
                {shareText.length}/500
              </div>

              {/* Preview of original post */}
              <div className="border border-base-300 rounded-lg p-3 bg-base-50">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={post.author?.profilePic || "/avatar.png"}
                    alt={post.author?.fullName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{post.author?.fullName}</span>
                </div>
                
                {post.content && (
                  <p className="text-sm text-base-content/80 line-clamp-3">{post.content}</p>
                )}
                
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post preview"
                    className="w-full rounded-lg max-h-32 object-cover mt-2"
                  />
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Share Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Social Share Modal */}
      <SocialShareModal 
        isOpen={showSocialShareModal}
        onClose={() => setSocialShareModal(false)}
        post={post}
      />

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

      {/* Click outside to close menus */}
      {showOptionsMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={(e) => {
            e.preventDefault();
            setShowOptionsMenu(false);
          }}
        />
      )}

      {showEmojis && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowEmojis(false)}
        />
      )}

      {showReplyEmojis && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowReplyEmojis(false)}
        />
      )}
    </div>
  );
};

export default PostCard;