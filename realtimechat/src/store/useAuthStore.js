import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Unable to connect to the server. Please check your network or try again later."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while checking authentication."
        );
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.log("Error in signup:", error);
      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Unable to connect to the server. Please check your network or try again later."
        );
      } else {
        toast.error(
          error.response?.data?.message || "An error occurred during signup."
        );
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.log("Error in login:", error);
      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Unable to connect to the server. Please check your network or try again later."
        );
      } else {
        toast.error(
          error.response?.data?.message || "An error occurred during login."
        );
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.log("Error in logout:", error);
      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Unable to connect to the server. Please check your network or try again later."
        );
      } else {
        toast.error(
          error.response?.data?.message || "An error occurred during logout."
        );
      }
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      console.log("Updating profile with data:", data);
      console.log(
        "Request URL:",
        axiosInstance.defaults.baseURL + "/auth/update-profile"
      );
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile:", error);
      if (error.code === "ERR_NETWORK") {
        toast.error(
          "Unable to connect to the server. Please check your network or try again later."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "An error occurred during profile update."
        );
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io("/", {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();

    socket.off("getOnlineUsers");
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket: socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.off("getOnlineUsers");
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));

export { io };
