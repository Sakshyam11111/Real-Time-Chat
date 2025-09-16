import React from "react";
import { Home, MessageSquare, User, Search, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const SocialNavbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 px-4 py-2 z-40 sm:hidden">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        <Link
          to="/social"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/social") ? "text-primary bg-primary/10" : "text-base-content/60"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Feed</span>
        </Link>

        <Link
          to="/search"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/search") ? "text-primary bg-primary/10" : "text-base-content/60"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs">Search</span>
        </Link>

        <Link
          to="/"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/") ? "text-primary bg-primary/10" : "text-base-content/60"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs">Chat</span>
        </Link>

        <Link
          to="/notifications"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/notifications") ? "text-primary bg-primary/10" : "text-base-content/60"
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-xs">Alerts</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
            isActive("/profile") ? "text-primary bg-primary/10" : "text-base-content/60"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default SocialNavbar;