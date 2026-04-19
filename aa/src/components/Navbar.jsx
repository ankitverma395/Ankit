import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, Heart, User, LogOut, 
  ChevronDown, Home, Library, Grid3x3, Sun, Moon, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile search when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileSearchOpen(false);
    }
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/library', label: 'Library', icon: Library },
    { path: '/liked-songs', label: 'Liked', icon: Heart },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-black/40 backdrop-blur-xl border-b border-white/5 py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* LEFT: BRAND (desktop) & PROFILE PHOTO (mobile) */}
            <div className="flex items-center gap-8">
              {/* Mobile: Profile photo instead of logo */}
              <button
                onClick={() => navigate('/profile')}
                className="block md:hidden relative w-9 h-9 flex-shrink-0"
              >
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center p-[1px]">
                  <div className="w-full h-full rounded-[11px] bg-black flex items-center justify-center overflow-hidden">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <span className="text-sm font-black text-white">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Desktop: App Logo */}
              <Link to="/" className="hidden md:flex items-center gap-3 group">
                <div className="relative w-9 h-9 flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl blur-md opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-full h-full rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                    <img src="/icon-192.png" alt="Nexora" className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                <span className="text-xl font-black tracking-tighter text-white hidden lg:block">
                  NEXORA
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center bg-white/[0.03] p-1 rounded-2xl border border-white/5 backdrop-blur-md">
                {navLinks.slice(0, 2).map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-5 py-2 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <link.icon size={14} strokeWidth={isActive ? 3 : 2} />
                        {link.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-sm"
                          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* DESKTOP SEARCH BAR */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden sm:block relative group">
              <div className="absolute inset-0 bg-purple-500/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists, tracks, or vibes..."
                className="w-full h-11 pl-12 pr-12 bg-white/[0.03] border border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white/[0.07] transition-all placeholder:text-gray-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-1.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-gray-500">
                ⌘K
              </div>
            </form>

            {/* RIGHT: ACTIONS & USER */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile search button */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="sm:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5">
                <NavButton icon={Bell} />
                <NavButton icon={Heart} onClick={() => navigate('/liked-songs')} className="hidden sm:flex" />
                <NavButton 
                  icon={darkMode ? Sun : Moon} 
                  onClick={toggleTheme} 
                  className={darkMode ? "text-yellow-500 hover:bg-yellow-500/10" : "text-purple-400 hover:bg-purple-500/10"} 
                />
              </div>

              <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

              {/* Desktop Profile Dropdown */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all active:scale-95 group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center p-[1px]">
                    <div className="w-full h-full rounded-[7px] bg-black flex items-center justify-center overflow-hidden">
                      {user?.profilePicture ? (
                        <img src={user.profilePicture} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-xs font-black text-white">{user?.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] origin-top-right z-[60]"
                    >
                      <div className="px-4 py-4 mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-500 mb-1">Account</p>
                        <p className="font-bold text-white truncate text-sm">{user?.username || 'Nexora User'}</p>
                        <p className="text-[11px] text-gray-500 truncate font-medium">{user?.email}</p>
                      </div>
                      
                      <div className="space-y-0.5">
                        <DropdownLink to="/profile" icon={User} label="Profile" />
                        <DropdownLink to="/daily-stats" icon={Grid3x3} label="Analytics" />
                        <DropdownLink to="/library" icon={Library} label="Library" />
                        
                        <div className="h-px bg-white/5 my-2 mx-2" />
                        
                        <button
                          onClick={() => { logout(); navigate('/login'); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* MOBILE SEARCH OVERLAY */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 z-[60] sm:hidden"
          >
            <div className="bg-black/90 backdrop-blur-xl border-b border-white/10 p-4 pt-16">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artists, tracks, or vibes..."
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none text-base"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] sm:hidden bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-64 bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-purple-400 font-black text-sm">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      location.pathname === link.path
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <link.icon size={18} />
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-white/10 my-3" />
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 w-full"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Sub-components
const NavButton = ({ icon: Icon, onClick, className }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-90 ${className}`}
  >
    <Icon size={18} />
  </button>
);

const DropdownLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all"
  >
    <Icon size={14} /> {label}
  </Link>
);

export default Navbar;