import React, { useState, useEffect } from 'react';
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Send, User, Save, X, Camera, AtSign, FileText, Users, Palette, Eye, HelpCircle, ChevronRight, Shield, UserCheck, HeadphonesIcon } from "lucide-react";
import toast from "react-hot-toast";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [showHelpOptions, setShowHelpOptions] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    username: '',
    bio: '',
    gender: 'prefer-not-to-say'
  });
  const [profilePic, setProfilePic] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [tempTheme, setTempTheme] = useState(theme);

  // Initialize profile data when authUser changes or component mounts
  useEffect(() => {
    if (authUser) {
      setProfile({
        fullName: authUser.fullName || '',
        username: authUser.username || '',
        bio: authUser.bio || '',
        gender: authUser.gender || 'prefer-not-to-say'
      });
      setPreviewImage(authUser.profilePic || "");
    }
  }, [authUser]);

  // Update temp theme when actual theme changes
  useEffect(() => {
    setTempTheme(theme);
  }, [theme]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const validateForm = () => {
    if (!profile.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (profile.username && profile.username.trim()) {
      if (profile.username.length < 3 || profile.username.length > 20) {
        toast.error("Username must be between 3 and 20 characters");
        return false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
        toast.error("Username can only contain letters, numbers, and underscores");
        return false;
      }
    }

    if (profile.bio && profile.bio.length > 300) {
      toast.error("Bio must be less than 300 characters");
      return false;
    }

    return true;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const updateData = {
        fullName: profile.fullName.trim(),
        username: profile.username.trim() || null,
        bio: profile.bio.trim(),
        gender: profile.gender,
      };

      if (profilePic) {
        updateData.profilePic = profilePic;
      }

      await updateProfile(updateData);
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
      setProfilePic(null);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleProfileCancel = () => {
    if (authUser) {
      setProfile({
        fullName: authUser.fullName || '',
        username: authUser.username || '',
        bio: authUser.bio || '',
        gender: authUser.gender || 'prefer-not-to-say'
      });
      setPreviewImage(authUser.profilePic || "");
      setProfilePic(null);
    }
    setIsEditingProfile(false);
  };

  const handleThemeSubmit = (e) => {
    e.preventDefault();
    setTheme(tempTheme);
    toast.success("Theme updated successfully");
    setIsEditingTheme(false);
    // Force a re-render by updating the document theme
    document.documentElement.setAttribute('data-theme', tempTheme);
  };

  const handleThemeCancel = () => {
    setTempTheme(theme);
    setIsEditingTheme(false);
  };

  const handleHelpItemClick = (item) => {
    // You can implement actual help functionality here
    // For now, we'll just show a toast
    switch(item) {
      case 'help-center':
        toast.success("Opening Help Center...");
        // window.open('/help-center', '_blank');
        break;
      case 'account-status':
        toast.success("Checking Account Status...");
        break;
      case 'privacy-security':
        toast.success("Opening Privacy and Security Help...");
        break;
      case 'support-requests':
        toast.success("Opening Support Requests...");
        break;
      default:
        toast.info("Help feature coming soon!");
    }
  };

  // Show loading if authUser is not available
  if (!authUser) {
    return (
      <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-base-100 rounded-lg p-6 shadow-sm border border-base-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">Profile</h2>
                  <p className="text-sm text-base-content/70">Manage your profile information</p>
                </div>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="btn btn-primary gap-2"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Edit Profile Form */}
            {isEditingProfile && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                    value={profile.fullName}
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
                    value={profile.username}
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
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered w-full min-h-[80px] resize-none"
                    placeholder="Tell us about yourself..."
                    disabled={isUpdatingProfile}
                    maxLength="300"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      {profile.bio.length}/300 characters
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
                    value={profile.gender}
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

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary gap-2 flex-1"
                    disabled={isUpdatingProfile}
                  >
                    <Save className="w-4 h-4" />
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleProfileCancel}
                    className="btn btn-ghost gap-2 flex-1"
                    disabled={isUpdatingProfile}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Theme Section */}
        <div className="bg-base-100 rounded-lg p-6 shadow-sm border border-base-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">Theme</h2>
                  <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
                </div>
              </div>
              {!isEditingTheme && (
                <button
                  onClick={() => setIsEditingTheme(true)}
                  className="btn btn-primary gap-2"
                >
                  Change Theme
                </button>
              )}
            </div>

            {/* Theme Selection Form */}
            {isEditingTheme && (
              <form onSubmit={handleThemeSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Select Theme</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {THEMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`
                          group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors border-2
                          ${tempTheme === t ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/50"}
                        `}
                        onClick={() => setTempTheme(t)}
                      >
                        <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                          <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                            <div className="rounded bg-primary"></div>
                            <div className="rounded bg-secondary"></div>
                            <div className="rounded bg-accent"></div>
                            <div className="rounded bg-neutral"></div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium truncate w-full text-center">
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Preview */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </span>
                  </label>
                  <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg" data-theme={tempTheme}>
                    <div className="p-4 bg-base-200">
                      <div className="max-w-lg mx-auto">
                        <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                          {/* Chat Header */}
                          <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                                J
                              </div>
                              <div>
                                <h3 className="font-medium text-sm">John Doe</h3>
                                <p className="text-xs text-base-content/70">Online</p>
                              </div>
                            </div>
                          </div>

                          {/* Chat Messages */}
                          <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                            {PREVIEW_MESSAGES.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`
                                    max-w-[80%] rounded-xl p-3 shadow-sm
                                    ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}
                                  `}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`
                                      text-[10px] mt-1.5
                                      ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}
                                    `}
                                  >
                                    12:00 PM
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Chat Input */}
                          <div className="p-4 border-t border-base-300 bg-base-100">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                className="input input-bordered flex-1 text-sm h-10"
                                placeholder="Type a message..."
                                value="This is a preview"
                                readOnly
                              />
                              <button className="btn btn-primary h-10 min-h-0">
                                <Send size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary gap-2 flex-1"
                  >
                    <Save className="w-4 h-4" />
                    Apply Theme
                  </button>
                  <button
                    type="button"
                    onClick={handleThemeCancel}
                    className="btn btn-ghost gap-2 flex-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-base-100 rounded-lg p-6 shadow-sm border border-base-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">Help</h2>
                  <p className="text-sm text-base-content/70">Get support and find answers</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpOptions(!showHelpOptions)}
                className="btn btn-primary gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                {showHelpOptions ? 'Hide Help' : 'Show Help'}
              </button>
            </div>

            {/* Help Options (shown when showHelpOptions is true) */}
            {showHelpOptions && (
              <div className="space-y-2">
                {/* Help Center */}
                <button 
                  onClick={() => handleHelpItemClick('help-center')}
                  className="w-full flex items-center justify-between p-4 bg-base-50 hover:bg-base-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium">Help Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-base-content/60" />
                </button>

                {/* Account Status */}
                <button 
                  onClick={() => handleHelpItemClick('account-status')}
                  className="w-full flex items-center justify-between p-4 bg-base-50 hover:bg-base-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Account status</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-base-content/60" />
                </button>

                {/* Privacy and Security Help */}
                <button 
                  onClick={() => handleHelpItemClick('privacy-security')}
                  className="w-full flex items-center justify-between p-4 bg-base-50 hover:bg-base-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Privacy and security help</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-base-content/60" />
                </button>

                {/* Support Requests */}
                <button 
                  onClick={() => handleHelpItemClick('support-requests')}
                  className="w-full flex items-center justify-between p-4 bg-base-50 hover:bg-base-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <HeadphonesIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Support requests</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-base-content/60" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;