import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Clock, Music2, Plus, Disc, LogOut, 
  TrendingUp, Radio, Calendar, Mic, Podcast,
  LayoutGrid, Search, Library, Sparkles
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Sidebar = () => {
  const { logout, user, token } = useAuth();
  const { currentSong } = usePlayer();
  const location = useLocation();
  const [playlists, setPlaylists] = useState([]);
  const [likedSongsCount, setLikedSongsCount] = useState(0);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  useEffect(() => {
    if (!token) return;
    
    const fetchData = async () => {
      try {
        const [playlistsRes, likedRes, recentRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/playlists`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/auth/liked-songs`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/analytics/recent`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setPlaylists(playlistsRes.data);
        setLikedSongsCount(likedRes.data.length);
        setRecentlyPlayed(recentRes.data.slice(0, 5));
      } catch (err) {
        console.error('Sidebar fetch error:', err);
      }
    };
    fetchData();
  }, [token]);

  const handleCreatePlaylist = async () => {
    const name = prompt('Enter playlist name:');
    if (!name) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/playlists`, 
        { name, description: '', isPublic: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaylists([...playlists, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  // Reusable Nav Component with Active States
  const NavItem = ({ to, icon: Icon, label, badge, color = "text-gray-400" }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10' 
            : `${color} hover:text-white hover:bg-white/5`
        }`}
      >
        <Icon size={18} className={isActive ? 'text-purple-400' : 'group-hover:scale-110 transition-transform'} />
        <span className="text-sm font-medium">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="ml-auto text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`
        hidden md:flex flex-col w-64 fixed left-0 top-16 z-30
        bg-black/20 backdrop-blur-2xl border-r border-white/5
        ${currentSong ? 'bottom-[88px]' : 'bottom-0'}
      `}
    >
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 custom-scrollbar">
        
        {/* RESTORED: MAIN DISCOVERY */}
        <div className="space-y-1">
          <p className="sidebar-label">Discovery</p>
          <NavItem to="/" icon={LayoutGrid} label="Explore" />
          <NavItem to="/trending" icon={TrendingUp} label="Trending" />
          <NavItem to="/radio" icon={Radio} label="Nexora Radio" />
          <NavItem to="/podcasts" icon={Podcast} label="Podcasts" />
          <NavItem to="/charts" icon={Calendar} label="Top Charts" />
          <NavItem to="/top-artists" icon={Mic} label="Artists" />
        </div>

        {/* YOUR COLLECTION */}
        <div className="space-y-1">
          <p className="sidebar-label">Your Library</p>
          <NavItem to="/liked-songs" icon={Heart} label="Liked Songs" badge={likedSongsCount} color="text-pink-400/80" />
          <NavItem to="/daily-stats" icon={Clock} label="History" />
        </div>

        {/* RESTORED: RECENTLY PLAYED */}
        {recentlyPlayed.length > 0 && (
          <div className="space-y-2">
            <p className="sidebar-label">Jump Back In</p>
            <div className="space-y-1">
              {recentlyPlayed.map((song, idx) => (
                <Link
                  key={idx}
                  to={`/player/${song.youtubeId}`}
                  className="flex items-center gap-3 px-3 py-1.5 group hover:bg-white/5 rounded-lg transition-all"
                >
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                    <img src={song.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-400 group-hover:text-white truncate font-medium">{song.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* PLAYLISTS SECTION */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 mb-2">
            <p className="sidebar-label !mb-0">Playlists</p>
            <button 
              onClick={handleCreatePlaylist}
              className="p-1 hover:bg-purple-500/20 rounded-md text-gray-500 hover:text-purple-400 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {playlists.map((pl) => (
              <NavItem key={pl._id} to={`/playlist/${pl._id}`} icon={Disc} label={pl.name} />
            ))}
          </div>
        </div>
      </div>

      {/* USER & LOGOUT */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 mb-3 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg font-bold text-sm">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.username}</p>
            <div className="flex items-center gap-1">
               <Sparkles size={10} className="text-yellow-500" />
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Premium</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;