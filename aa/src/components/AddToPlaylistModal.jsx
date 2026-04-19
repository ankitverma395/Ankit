import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Music, Loader2, ListPlus } from 'lucide-react';
import axios from 'axios';

const AddToPlaylistModal = ({ song, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [success, setSuccess] = useState(null); // Track success per playlist
  const { token } = useAuth();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToPlaylist = async (playlistId) => {
    if (adding || success) return;
    setAdding(playlistId);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/songs`,
        { song },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess(playlistId);
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setAdding(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card p-0 w-full max-w-sm overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header Section */}
        <div className="p-6 pb-4 border-b border-white/5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-purple-400">
              <ListPlus size={20} />
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Save to Playlist</h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
            <img src={song.thumbnail} className="w-10 h-10 rounded-lg object-cover" alt="" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{song.title}</p>
              <p className="text-[10px] text-gray-500 font-medium truncate italic">{song.artist}</p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fetching your collections</p>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-10">
              <Music size={40} className="mx-auto text-gray-700 mb-3" />
              <p className="text-gray-400 text-sm mb-4 font-medium">Your library is empty</p>
              <button 
                onClick={onClose} 
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-full transition-all"
              >
                CREATE NEW PLAYLIST
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {playlists.map((playlist, idx) => (
                <motion.button
                  key={playlist._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => addToPlaylist(playlist._id)}
                  disabled={adding === playlist._id || success === playlist._id}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all group ${
                    success === playlist._id 
                      ? 'bg-green-500/20 ring-1 ring-green-500/50' 
                      : 'hover:bg-white/5 active:scale-[0.98]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      success === playlist._id ? 'bg-green-500 text-white' : 'bg-white/5 group-hover:bg-purple-500/20'
                    }`}>
                      {success === playlist._id ? <Check size={18} /> : <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:scale-150 transition-transform" />}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${success === playlist._id ? 'text-green-400' : 'text-gray-200'}`}>
                        {playlist.name}
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {playlist.songs?.length || 0} tracks
                      </p>
                    </div>
                  </div>

                  {adding === playlist._id && (
                    <Loader2 size={18} className="animate-spin text-purple-500" />
                  )}
                  {success === playlist._id && (
                    <span className="text-[10px] font-black text-green-400 uppercase tracking-tighter">Added!</span>
                  )}
                  {!adding && !success && (
                    <Plus size={18} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer padding */}
        <div className="h-4" />
      </motion.div>
    </motion.div>
  );
};

export default AddToPlaylistModal;