import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { MessageCircle } from 'lucide-react'; 

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout();
  };

  const handleHomeClick = () => {
    navigate('/social');
  };

  const handleChatClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/social" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">C</span>
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Home Button */}
            <button
              onClick={handleHomeClick}
              className="btn btn-sm gap-2 transition-colors hover:bg-base-200"
            >
              <Home className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {/* Chat Button  */}
            <button onClick={handleChatClick}
              className="btn btn-sm gap-2 transition-colors hover:bg-base-200"
            >
              <MessageCircle className="size-4" />
              Chat
            </button>

            {/* Settings Link */}
            <Link to="/settings" className="btn btn-sm gap-2 transition-colors">
              <Settings className="size-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* Profile Link */}
            <Link to="/profile" className="btn btn-sm gap-2 transition-colors">
              <User className="size-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            {/* User Info & Logout */}
            {authUser && (
              <>
                <div className="flex items-center gap-2">
                  <div className="avatar">
                    <div className="size-8 rounded-full">
                      <img
                        src={authUser.profilePic || "/avatar.png"}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="flex gap-2 items-center text-sm hover:bg-zinc-700 transition-colors btn btn-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-8 rounded-full">
                  <img
                    alt={authUser?.fullName || "User"}
                    src={authUser?.profilePic || "/avatar.png"}
                  />
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                <li>
                  <button onClick={handleHomeClick} className="flex items-center gap-2">
                    <Home className="size-4" />
                    Social
                  </button>
                </li>
                <li>
                  <button onClick={handleChatClick} className="flex items-center gap-2">
                    <MessageCircle className="size-4" />
                    Chat
                  </button>
                </li>
                <li>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="size-4" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;