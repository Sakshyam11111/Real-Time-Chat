import React, { useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import SocialNavbar from './components/SocialNavbar';
import { useAuthStore } from './store/useAuthStore';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingPage from './pages/SettingPage';
import ProfilePage from './pages/ProfilePage';
import SocialFeedPage from './pages/SocialFeedPage';
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from './store/useThemeStore';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Define routes where navbar should be hidden
  const hideNavbarRoutes = ['/login', '/signup'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      {/* Conditionally render Navbar */}
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/social" element={authUser ? <SocialFeedPage /> : <Navigate to="/login" />} />
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/social" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/social" />} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      {/* Only show SocialNavbar when user is authenticated and navbar is not hidden */}
      {authUser && !shouldHideNavbar && <SocialNavbar />}

      <Toaster />
    </div>
  );
};

export default App;