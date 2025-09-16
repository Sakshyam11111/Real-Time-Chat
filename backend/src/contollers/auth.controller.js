import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Signup function
export const signup = async (req, res) => {
  const { fullName, email, password, username } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: "Email already exists" });

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) return res.status(400).json({ message: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      username: username || null,
    });

    await newUser.save();

    // Generate JWT token after saving the user
    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      username: newUser.username,
      profilePic: newUser.profilePic,
      bio: newUser.bio,
      gender: newUser.gender,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Login function
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token on successful login
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
      gender: user.gender,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout function
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, username, bio, gender } = req.body;
    const userID = req.user._id;

    // Validate username if provided
    if (username) {
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
      }
      
      // Check if username is already taken by another user
      const existingUsername = await User.findOne({ username, _id: { $ne: userID } });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    // Validate bio length
    if (bio && bio.length > 300) {
      return res.status(400).json({ message: "Bio must be less than 300 characters" });
    }

    // Validate gender
    if (gender && !['male', 'female', 'other', 'prefer-not-to-say'].includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value" });
    }

    let updateFields = {};

    // Add fields to update object if they exist
    if (fullName) updateFields.fullName = fullName;
    if (username !== undefined) updateFields.username = username || null;
    if (bio !== undefined) updateFields.bio = bio;
    if (gender) updateFields.gender = gender;

    // Handle profile picture upload
    if (profilePic) {
      console.log("Uploading profile pic to Cloudinary...");
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          resource_type: "auto",
        });
        updateFields.profilePic = uploadResponse.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({ message: "Failed to upload profile picture" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      updateFields,
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Test Cloudinary endpoint (optional - for debugging)
export const testCloudinary = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    );
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};