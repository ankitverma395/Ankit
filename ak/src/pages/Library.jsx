// frontend/src/pages/Library.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import PlaylistCard from '../components/PlaylistCard';
import { Plus, Music } from 'lucide-react';

const Library = () => {
  const { token } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, [token]);

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(res.data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/playlists`, {
        name: newPlaylistName,
        description: '',
        isPublic: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists([...playlists, res.data]);
      setNewPlaylistName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating playlist:', err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(playlists.filter(p => p._id !== playlistId));
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Music size={48} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No playlists yet</p>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 text-purple-400">
            Create your first playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((playlist, idx) => (
            <div key={playlist._id} className="relative group">
              <PlaylistCard playlist={playlist} index={idx} onDelete={deletePlaylist} />
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="input-glass mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/10">
                Cancel
              </button>
              <button onClick={createPlaylist} className="btn-primary px-5 py-2">
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Library;