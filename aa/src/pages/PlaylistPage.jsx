import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Music, Trash2, Shuffle, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const PlaylistPage = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { playSong, setIsShuffle } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylist(res.data);
    } catch (err) {
      console.error('Error:', err);
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const removeSong = async (songId) => {
    try {
      // Optimistic Update: Update UI immediately
      setPlaylist(prev => ({
        ...prev,
        songs: prev.songs.filter(s => s._id !== songId)
      }));

      await axios.delete(`${import.meta.env.VITE_API_URL}/playlists/${id}/songs/${songId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error removing song:', err);
      fetchPlaylist(); // Revert on error
    }
  };

  const deletePlaylist = async () => {
    if (!confirm('Delete this collection permanently?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/library');
    } catch (err) {
      alert('Failed to delete playlist');
    }
  };

  const handlePlay = (shuffle = false) => {
    if (playlist?.songs?.length) {
      setIsShuffle(shuffle);
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!playlist) return null;

  return (
    <div className="max-w-[1400px] mx-auto pb-32 pt-4 px-4 md:px-0">
      
      {/* --- Cinematic Header --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] mb-12 p-8 md:p-12 group border border-white/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-black/40" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
          {/* Playlist Cover Art */}
          <div className="w-48 h-48 md:w-64 md:h-64 bg-white/5 rounded-[2rem] shadow-2xl flex items-center justify-center relative overflow-hidden group border border-white/10">
            {playlist.songs?.[0]?.thumbnail ? (
              <img src={playlist.songs[0].thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="" />
            ) : (
              <Music size={64} className="text-gray-600" />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <Music size={48} className="absolute text-white/20" />
          </div>

          {/* Playlist Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-4">
               <span className="text-xs font-black uppercase tracking-[0.4em] text-purple-300">Playlist Collection</span>
               <button onClick={deletePlaylist} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                 <Trash2 size={16} />
               </button>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic text-white leading-none uppercase">
              {playlist.name}
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-3 text-white/60 font-bold">
              <span className="flex items-center gap-1.5 text-sm">
                <Music size={14} className="text-purple-400" /> {playlist.songs?.length || 0} Tracks
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-sm">
                <Clock size={14} /> Localized Mix
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => handlePlay(false)}
                className="flex items-center gap-3 px-10 py-4 bg-white text-black rounded-2xl font-black hover:scale-105 transition-transform shadow-xl"
              >
                <Play size={20} fill="black" /> PLAY
              </button>
              <button 
                onClick={() => handlePlay(true)}
                className="flex items-center gap-3 px-8 py-4 glass-card text-white border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all"
              >
                <Shuffle size={20} /> SHUFFLE
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Song Grid --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">Tracklist</h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {playlist.songs?.length === 0 ? (
          <div className="glass-card py-24 text-center border-dashed border-2 border-white/5 rounded-[3rem]">
            <p className="text-gray-500 font-bold">This collection is currently empty.</p>
            <button onClick={() => navigate('/')} className="mt-4 text-purple-400 font-black text-sm uppercase tracking-widest">Add some magic</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            <AnimatePresence>
              {playlist.songs.map((song, idx) => (
                <motion.div
                  key={song._id || song.youtubeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: idx * 0.02 }}
                  layout
                  className="relative group"
                >
                  <SongCard song={song} index={idx} allSongs={playlist.songs} />
                  
                  {/* Remove Button Overlay */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSong(song._id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-red-500 z-20"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistPage;