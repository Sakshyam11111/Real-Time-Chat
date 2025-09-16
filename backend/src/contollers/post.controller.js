import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username fullName profilePic")
      .populate("comments.user", "username fullName profilePic")
      .populate("comments.replies.user", "username fullName profilePic")
      .populate("shares.user", "username fullName profilePic")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "username fullName profilePic"
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPosts:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", "username fullName profilePic")
      .populate("comments.user", "username fullName profilePic")
      .populate("comments.replies.user", "username fullName profilePic")
      .populate("shares.user", "username fullName profilePic")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "username fullName profilePic"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getFeedPosts:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user._id;

    if (!content && !image) {
      return res.status(400).json({ error: "Post must have content or image" });
    }

    let imageUrl = null;
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          resource_type: "auto"
        });
        imageUrl = uploadResponse.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({ error: "Failed to upload image" });
      }
    }

    const newPost = new Post({
      author: userId,
      content,
      image: imageUrl,
    });

    await newPost.save();
    await newPost.populate("author", "username fullName profilePic");

    // Emit to all connected users
    io.emit("newPost", newPost);

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sharePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user._id;

    const originalPost = await Post.findById(postId)
      .populate("author", "username fullName profilePic");
    
    if (!originalPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Add share to original post
    originalPost.shares.push({
      user: userId,
      content: content || "",
    });

    await originalPost.save();

    // Create new shared post
    const sharedPost = new Post({
      author: userId,
      isShared: true,
      originalPost: originalPost._id,
      shareContent: content || "",
    });

    await sharedPost.save();
    await sharedPost.populate("author", "username fullName profilePic");
    await sharedPost.populate({
      path: "originalPost",
      populate: {
        path: "author",
        select: "username fullName profilePic"
      }
    });

    // Emit to all connected users
    io.emit("newPost", sharedPost);

    res.status(201).json(sharedPost);
  } catch (error) {
    console.error("Error in sharePost:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.warn("Failed to delete image from Cloudinary:", cloudinaryError);
      }
    }

    await Post.findByIdAndDelete(postId);

    // Emit to all connected users
    io.emit("postDeleted", { postId });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    // Emit to all connected users
    io.emit("postUpdate", {
      postId,
      likes: post.likes.length,
      isLiked: !isLiked
    });

    res.status(200).json({ likes: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    console.error("Error in likePost:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      user: userId,
      content: content.trim(),
      likes: [],
      replies: [],
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();
    
    await post.populate("comments.user", "username fullName profilePic");
    
    const newComment = post.comments[post.comments.length - 1];

    // Emit to all connected users
    io.emit("newComment", {
      postId,
      comment: newComment,
      commentsCount: post.comments.length
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error in commentOnPost:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const isLiked = comment.likes.includes(userId);
    
    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await post.save();

    // Emit to all connected users
    io.emit("commentUpdate", {
      postId,
      commentId,
      likes: comment.likes.length,
      isLiked: !isLiked
    });

    res.status(200).json({ likes: comment.likes.length, isLiked: !isLiked });
  } catch (error) {
    console.error("Error in likeComment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Reply content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const reply = {
      user: userId,
      content: content.trim(),
      likes: [],
      createdAt: new Date(),
    };

    comment.replies.push(reply);
    await post.save();

    await post.populate("comments.replies.user", "username fullName profilePic");
    
    const newReply = comment.replies[comment.replies.length - 1];

    // Emit to all connected users
    io.emit("newReply", {
      postId,
      commentId,
      reply: newReply
    });

    res.status(201).json(newReply);
  } catch (error) {
    console.error("Error in replyToComment:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeReply = async (req, res) => {
  try {
    const { postId, commentId, replyId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    const isLiked = reply.likes.includes(userId);
    
    if (isLiked) {
      reply.likes.pull(userId);
    } else {
      reply.likes.push(userId);
    }

    await post.save();

    // Emit to all connected users
    io.emit("replyUpdate", {
      postId,
      commentId,
      replyId,
      likes: reply.likes.length,
      isLiked: !isLiked
    });

    res.status(200).json({ likes: reply.likes.length, isLiked: !isLiked });
  } catch (error) {
    console.error("Error in likeReply:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const posts = await Post.find({ author: userId })
      .populate("author", "username fullName profilePic")
      .populate("comments.user", "username fullName profilePic")
      .populate("comments.replies.user", "username fullName profilePic")
      .populate("shares.user", "username fullName profilePic")
      .populate({
        path: "originalPost",
        populate: {
          path: "author",
          select: "username fullName profilePic"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getUserPosts:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};