import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Library, User, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/library', label: 'Library', icon: Library },
    { path: '/liked-songs', label: 'Liked', icon: Heart },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-2"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-0.5 group"
            >
              <item.icon
                size={22}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'text-purple-500'
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium transition-all ${
                  isActive ? 'text-purple-500' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-2 w-6 h-0.5 bg-purple-500 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;