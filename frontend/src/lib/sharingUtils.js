export const createShareUrl = (postId) => {
  return `${window.location.origin}/post/${postId}`;
};

export const createShareText = (post) => {
  if (post.content) {
    const truncated = post.content.substring(0, 100);
    return `Check out this post: "${truncated}${post.content.length > 100 ? '...' : ''}"`;
  }
  return 'Check out this post';
};

export const createShareTitle = (post) => {
  return `Post by ${post.author?.fullName}`;
};

export const shareToFacebook = (url, text) => {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

export const shareToTwitter = (url, text) => {
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

export const shareToLinkedIn = (url) => {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

export const shareToWhatsApp = (text, url) => {
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  window.open(shareUrl, '_blank');
};

export const shareToViber = (text, url) => {
  const shareUrl = `viber://forward?text=${encodeURIComponent(`${text} ${url}`)}`;
  window.open(shareUrl, '_blank');
};

export const shareToTelegram = (text, url) => {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank');
};

export const shareToEmail = (title, text, url) => {
  const subject = encodeURIComponent(title);
  const body = encodeURIComponent(`${text}\n\n${url}`);
  const shareUrl = `mailto:?subject=${subject}&body=${body}`;
  window.open(shareUrl);
};

export const shareToPinterest = (url, imageUrl, text) => {
  const shareUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(imageUrl || '')}&description=${encodeURIComponent(text)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

export const shareToReddit = (url, title) => {
  const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

export const shareToInstagramStory = () => {
  // Instagram Stories sharing requires their SDK or deep linking
  // This opens Instagram app on mobile
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  
  if (isIOS) {
    window.open('instagram://story-camera', '_blank');
  } else if (isAndroid) {
    window.open('intent://story-camera/#Intent;package=com.instagram.android;scheme=instagram;end', '_blank');
  } else {
    window.open('https://www.instagram.com/', '_blank');
  }
};

export const shareToDiscord = (text, url) => {
  // Discord doesn't have a direct web share URL, but we can format for easy pasting
  const discordText = `${text}\n${url}`;
  navigator.clipboard.writeText(discordText).then(() => {
    window.open('https://discord.com/app', '_blank');
  });
};

// Hook for social sharing
import { useState } from 'react';
import toast from 'react-hot-toast';

export const useSocialShare = (post) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const shareUrl = createShareUrl(post._id);
  const shareText = createShareText(post);
  const shareTitle = createShareTitle(post);

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

  const downloadImage = () => {
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
      handler: () => shareToFacebook(shareUrl, shareText),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      handler: () => shareToTwitter(shareUrl, shareText),
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'LinkedIn',
      handler: () => shareToLinkedIn(shareUrl),
      color: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      name: 'WhatsApp',
      handler: () => shareToWhatsApp(shareText, shareUrl),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Viber',
      handler: () => shareToViber(shareText, shareUrl),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Telegram',
      handler: () => shareToTelegram(shareText, shareUrl),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      name: 'Email',
      handler: () => shareToEmail(shareTitle, shareText, shareUrl),
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      name: 'Pinterest',
      handler: () => shareToPinterest(shareUrl, post.image, shareText),
      color: 'bg-red-600 hover:bg-red-700',
      showIf: !!post.image,
    },
    {
      name: 'Reddit',
      handler: () => shareToReddit(shareUrl, shareTitle),
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      name: 'Instagram',
      handler: shareToInstagramStory,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    },
    {
      name: 'Discord',
      handler: () => shareToDiscord(shareText, shareUrl),
      color: 'bg-indigo-600 hover:bg-indigo-700',
    },
  ];

  return {
    shareUrl,
    shareText,
    shareTitle,
    copySuccess,
    copyToClipboard,
    downloadImage,
    handleNativeShare,
    shareOptions,
  };
};