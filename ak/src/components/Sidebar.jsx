// frontend/src/components/Sidebar.jsx
import { motion } from 'framer-motion';
import { 
  Heart, Clock, Music2, Plus, Disc, LogOut, 
  TrendingUp, Radio, Calendar, Star, Mic, Podcast
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Sidebar = () => {
  const { logout, user, token } = useAuth();
  const { currentSong } = usePlayer();
  const navigate = useNavigate();
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

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`
        hidden md:flex flex-col w-64 glass-sidebar
        fixed left-0 top-16 z-30
        ${currentSong ? 'bottom-20' : 'bottom-0'}
      `}
    >
      {/* Removed website name */}

      <div className="pt-4"></div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        
        {currentSong && (
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase px-2">Now Playing</p>
            <Link
              to={`/player/${currentSong.youtubeId}`}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full"
            >
              <Music2 size={20} className="text-purple-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentSong.title}</p>
                <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
              </div>
            </Link>
          </div>
        )}

        <div className="space-y-1">
          <Link
            to="/liked-songs"
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full"
          >
            <Heart size={20} />
            <span className="text-sm font-medium">Liked Songs</span>
            {likedSongsCount > 0 && (
              <span className="ml-auto text-xs bg-purple-500/20 px-2 py-0.5 rounded-full">
                {likedSongsCount}
              </span>
            )}
          </Link>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase px-2 mb-2">Discover</p>
          <div className="space-y-1">
            <Link to="/trending" className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full">
              <TrendingUp size={18} />
              <span className="text-sm">Trending</span>
            </Link>

            <Link to="/radio" className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full">
              <Radio size={18} />
              <span className="text-sm">Radio</span>
            </Link>

            <Link to="/podcasts" className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full">
              <Podcast size={18} />
              <span className="text-sm">Podcasts</span>
            </Link>

            <Link to="/charts" className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full">
              <Calendar size={18} />
              <span className="text-sm">Charts</span>
            </Link>

            <Link to="/top-artists" className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full">
              <Mic size={18} />
              <span className="text-sm">Top Artists</span>
            </Link>
          </div>
        </div>

        {recentlyPlayed.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase px-2 mb-2">Recently Played</p>
            <div className="space-y-1">
              {recentlyPlayed.map((song, idx) => (
                <Link
                  key={idx}
                  to={`/player/${song.youtubeId}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full"
                >
                  <Clock size={16} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{song.title}</p>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs text-gray-400 uppercase">Your Playlists</p>
            <button onClick={handleCreatePlaylist}>
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {playlists.length === 0 ? (
              <p className="text-xs text-gray-500 px-4 py-2">No playlists yet</p>
            ) : (
              playlists.map((pl) => (
                <Link
                  key={pl._id}
                  to={`/playlist/${pl._id}`}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-white/10 transition-all w-full"
                >
                  <Disc size={16} />
                  <span className="text-sm truncate">{pl.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">
            {user?.profilePicture ? (
              <img src={user.profilePicture} className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">Free Plan</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;