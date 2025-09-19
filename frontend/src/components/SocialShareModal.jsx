// SocialShareModal.jsx
import React, { useState } from 'react';
import { 
  Share, 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  MessageCircle, 
  Phone,
  Copy,
  Download,
  X,
  ExternalLink,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const SocialShareModal = ({ isOpen, onClose, post }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen || !post) return null;

  const shareUrl = `${window.location.origin}/post/${post._id}`;
  const shareText = post.content ? 
    `Check out this post: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"` 
    : 'Check out this post';
  const shareTitle = `Post by ${post.author?.fullName}`;

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToViber = () => {
    const url = `viber://forward?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url);
  };

  const shareToPinterest = () => {
    const imageUrl = post.image || '';
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToReddit = () => {
    const url = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopySuccess(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const downloadPost = () => {
    if (post.image) {
      const link = document.createElement('a');
      link.href = post.image;
      link.download = `post-${post._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Image downloaded!');
    } else {
      toast.error('No image to download');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      handler: shareToFacebook,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      handler: shareToTwitter,
    },
    {
      name: 'LinkedIn',
      icon: ExternalLink,
      color: 'bg-blue-700 hover:bg-blue-800',
      handler: shareToLinkedIn,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      handler: shareToWhatsApp,
    },
    {
      name: 'Viber',
      icon: Phone,
      color: 'bg-purple-600 hover:bg-purple-700',
      handler: shareToViber,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-400 hover:bg-blue-500',
      handler: shareToTelegram,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-500 hover:bg-gray-600',
      handler: shareToEmail,
    },
    {
      name: 'Pinterest',
      icon: ExternalLink,
      color: 'bg-red-600 hover:bg-red-700',
      handler: shareToPinterest,
      showIf: !!post.image,
    },
    {
      name: 'Reddit',
      icon: ExternalLink,
      color: 'bg-orange-600 hover:bg-orange-700',
      handler: shareToReddit,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="bg-base-100 rounded-xl w-full max-w-lg sm:max-w-md max-h-[90vh] overflow-y-auto modal-scroll">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-base-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Post
          </h2>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-circle"
            aria-label="Close share modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-6 p-4 bg-base-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={post.author?.profilePic || "/avatar.png"}
                alt={post.author?.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{post.author?.fullName}</span>
            </div>
            
            {post.content && (
              <p className="text-sm text-base-content/80 line-clamp-3 mb-3">
                {post.content}
              </p>
            )}
            
            {post.image && (
              <img
                src={post.image}
                alt="Post preview"
                className="w-full rounded-lg max-h-40 object-cover"
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {navigator.share && (
              <button
                onClick={handleNativeShare}
                className="btn btn-primary btn-sm flex items-center gap-2"
                aria-label="Share via native API"
              >
                <Share className="w-4 h-4" />
                Share
              </button>
            )}
            
            <button
              onClick={copyToClipboard}
              className={`btn btn-outline btn-sm flex items-center gap-2 ${copySuccess ? 'btn-success' : ''}`}
              aria-label="Copy share link"
            >
              <Copy className="w-4 h-4" />
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </button>

            {post.image && (
              <button
                onClick={downloadPost}
                className="btn btn-outline btn-sm flex items-center gap-2"
                aria-label="Download post image"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-base-content/70">Share to social media</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {shareOptions.map((option) => {
                if (option.showIf === false) return null;
                
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    onClick={option.handler}
                    className={`${option.color} text-white p-3 rounded-lg flex flex-col items-center gap-1 text-xs transition-colors hover:shadow-md`}
                    aria-label={`Share to ${option.name}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-base-content/70 block mb-1">
              Share URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input input-bordered input-sm flex-1 text-sm bg-base-200"
                aria-label="Share URL"
              />
              <button
                onClick={copyToClipboard}
                className="btn btn-outline btn-sm"
                aria-label="Copy URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PostCardWithSharing.jsx
const PostCardWithSharing = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState("");
  const [showSocialShareModal, setSocialShareModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyEmojis, setShowReplyEmojis] = useState(false);
  
  const handleShareClick = () => {
    setSocialShareModal(true);
  };

  const handleInternalShare = () => {
    setShowShareModal(true);
  };

  return (
    <div className="bg-base-100 rounded-xl shadow-sm border border-base-200 mb-6">
      <div className="px-4 py-3 border-b border-base-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={post.author?.profilePic || "/avatar.png"}
            alt={post.author?.fullName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-sm font-medium">{post.author?.fullName}</span>
        </div>
      </div>

      <div className="p-4">
        {post.content && (
          <p className="text-base text-base-content/90 mb-3">{post.content}</p>
        )}
        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="w-full rounded-lg max-h-96 object-cover"
          />
        )}
      </div>

      <div className="px-4 py-2 border-t border-base-200 flex items-center gap-2">
        <button
          onClick={handleLike}
          className={`btn btn-ghost btn-sm flex-1 flex items-center gap-2 ${
            post.likes?.includes(authUser?._id) ? "text-red-500" : ""
          }`}
          aria-label={post.likes?.includes(authUser?._id) ? "Unlike post" : "Like post"}
        >
          <Heart className={`w-4 h-4 ${post.likes?.includes(authUser?._id) ? "fill-current" : ""}`} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="btn btn-ghost btn-sm flex-1 flex items-center gap-2"
          aria-label="Toggle comments"
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
        
        <div className="relative flex-1">
          <div className="dropdown dropdown-top">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm w-full flex items-center gap-2"
              aria-label="Share options"
            >
              <Share className="w-4 h-4" />
              Share
            </button>
            <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-xl w-52 mb-2">
              <li>
                <a onClick={handleShareClick} className="flex items-center gap-2 py-2 px-3 hover:bg-base-200">
                  <ExternalLink className="w-4 h-4" />
                  Share to social media
                </a>
              </li>
              <li>
                <a onClick={handleInternalShare} className="flex items-center gap-2 py-2 px-3 hover:bg-base-200">
                  <Share className="w-4 h-4" />
                  Share on platform
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="p-4 border-t border-base-200">
          {/* Placeholder for comments section */}
          <p className="text-sm text-base-content/60">Comments section...</p>
        </div>
      )}

      <SocialShareModal 
        isOpen={showSocialShareModal}
        onClose={() => setSocialShareModal(false)}
        post={post}
      />
    </div>
  );
};

export default SocialShareModal;
export { PostCardWithSharing };