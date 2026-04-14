import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Plus, X } from 'lucide-react';
import axios from 'axios';

const AddToPlaylistModal = ({ song, onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
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
    setAdding(playlistId);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/playlists/${playlistId}/songs`,
        { song },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Show success briefly then close
      alert('Song added to playlist!');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add song');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add to Playlist</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4 truncate">{song.title}</p>
        {loading ? (
          <div className="text-center py-4">Loading playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-400">No playlists yet</p>
            <button onClick={onClose} className="mt-2 text-purple-400 text-sm">Create one in Profile</button>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {playlists.map((playlist) => (
              <button
                key={playlist._id}
                onClick={() => addToPlaylist(playlist._id)}
                disabled={adding === playlist._id}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                    <Plus size={14} />
                  </div>
                  <span className="text-sm">{playlist.name}</span>
                </div>
                {adding === playlist._id ? (
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus size={16} className="text-gray-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddToPlaylistModal;