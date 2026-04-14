import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Music, Trash2 } from 'lucide-react';
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
  const { playSong } = usePlayer();
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
      console.error('Error fetching playlist:', err);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const removeSong = async (songId) => {
    if (!confirm('Remove this song from playlist?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/playlists/${id}/songs/${songId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPlaylist(); // Refresh
    } catch (err) {
      console.error('Error removing song:', err);
      alert('Failed to remove song');
    }
  };

  const deletePlaylist = async () => {
    if (!confirm('Delete this playlist permanently?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/profile');
    } catch (err) {
      console.error('Error deleting playlist:', err);
      alert('Failed to delete playlist');
    }
  };

  const handlePlayAll = () => {
    if (playlist?.songs?.length) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (!playlist) return <div className="text-center py-12">Playlist not found</div>;

  return (
    <motion.div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={20} /> Back
        </button>
        <button onClick={deletePlaylist} className="flex items-center gap-2 text-red-400 hover:text-red-300">
          <Trash2 size={18} /> Delete Playlist
        </button>
      </div>

      <div className="glass-card p-6 flex flex-col md:flex-row gap-6">
        <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
          <Music size={64} className="text-white/80" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          <p className="text-gray-400 mt-1">{playlist.songs?.length || 0} songs</p>
          <button onClick={handlePlayAll} className="mt-4 btn-primary flex items-center gap-2">
            <Play size={18} /> Play All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Songs</h2>
        {playlist.songs?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No songs in this playlist yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlist.songs.map((song, idx) => (
              <div key={song._id} className="relative group">
                <SongCard song={song} index={idx} allSongs={playlist.songs} />
                <button
                  onClick={() => removeSong(song._id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-500 z-10"
                  aria-label="Remove from playlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlaylistPage;