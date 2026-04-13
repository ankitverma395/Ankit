// frontend/src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Heart, Upload, User, LogOut, 
  ChevronDown, Home, Library, Grid3x3, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/library', label: 'Library', icon: Library },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
          : 'bg-black/40 backdrop-blur-md'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-6 md:gap-8">
            
            {/* 🔥 CUSTOM LOGO */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition">
                <img 
                  src="/icon-192.png" 
                  alt="logo" 
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:inline">
                Nexora
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <link.icon size={16} />
                      {link.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* SEARCH BAR */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists..."
                className="w-full h-11 pl-11 pr-4 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10"
              />
            </div>
          </form>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 md:gap-4">
            <button className="hidden md:flex p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10">
              <Bell size={20} />
            </button>
            <button className="hidden md:flex p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10">
              <Heart size={20} />
            </button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ rotate: 180 }}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            <button className="hidden md:flex p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10">
              <Upload size={20} />
            </button>

            <div className="hidden md:block w-px h-6 bg-white/10" />

            {/* PROFILE */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-white/10"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>

                <span className="hidden md:inline text-sm text-gray-200">
                  {user?.username?.split(' ')[0] || 'User'}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="text-sm text-white">{user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>

                    <div className="p-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                      >
                        <User size={16} /> Profile
                      </Link>
                      <Link
                        to="/library"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                      >
                        <Library size={16} /> Playlists
                      </Link>
                      <Link
                        to="/analytics"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
                      >
                        <Grid3x3 size={16} /> Analytics
                      </Link>
                    </div>

                    <div className="p-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;