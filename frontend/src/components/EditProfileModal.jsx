import React, { useState, useRef, useEffect } from "react";
import { X, Camera, User, AtSign, FileText, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    gender: "prefer-not-to-say",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const fileInputRef = useRef(null);

  // Initialize form data when modal opens or authUser changes
  useEffect(() => {
    if (authUser && isOpen) {
      setFormData({
        fullName: authUser.fullName || "",
        username: authUser.username || "",
        bio: authUser.bio || "",
        gender: authUser.gender || "prefer-not-to-say",
      });
      setPreviewImage(authUser.profilePic || "");
      setProfilePic(null);
    }
  }, [authUser, isOpen]);

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
      setProfilePic(reader.result);
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (formData.username && formData.username.trim()) {
      if (formData.username.length < 3 || formData.username.length > 20) {
        toast.error("Username must be between 3 and 20 characters");
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        toast.error("Username can only contain letters, numbers, and underscores");
        return false;
      }
    }

    if (formData.bio && formData.bio.length > 300) {
      toast.error("Bio must be less than 300 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const updateData = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim() || null,
        bio: formData.bio.trim(),
        gender: formData.gender,
      };

      if (profilePic) {
        updateData.profilePic = profilePic;
      }

      await updateProfile(updateData);
      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      // Error is already handled in the store
      console.error("Profile update error:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: "",
      username: "",
      bio: "",
      gender: "prefer-not-to-say",
    });
    setProfilePic(null);
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button 
            onClick={handleClose} 
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isUpdatingProfile}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={previewImage || "/avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary"
              />
              <label
                htmlFor="profile-pic-input"
                className="absolute bottom-0 right-0 bg-primary hover:bg-primary-focus text-white p-2 rounded-full cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  ref={fileInputRef}
                  id="profile-pic-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-base-content/60 text-center">
              Click the camera icon to change your profile picture
            </p>
          </div>

          {/* Full Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="Enter your full name"
              required
              disabled={isUpdatingProfile}
              maxLength="50"
            />
          </div>

          {/* Username */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Username
              </span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="input input-bordered w-full"
              placeholder="Enter a unique username"
              disabled={isUpdatingProfile}
              minLength="3"
              maxLength="20"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                Letters, numbers, and underscores only. 3-20 characters.
              </span>
            </label>
          </div>

          {/* Bio */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio
              </span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="textarea textarea-bordered w-full min-h-[80px] resize-none"
              placeholder="Tell us about yourself..."
              disabled={isUpdatingProfile}
              maxLength="300"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {formData.bio.length}/300 characters
              </span>
            </label>
          </div>

          {/* Gender */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gender
              </span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="select select-bordered w-full"
              disabled={isUpdatingProfile}
            >
              <option value="prefer-not-to-say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-ghost flex-1"
              disabled={isUpdatingProfile}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;