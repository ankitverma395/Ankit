import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { Heart } from 'lucide-react';

const LikedSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/liked-songs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSongs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedSongs();
  }, [token]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart size={32} className="text-purple-400" />
        <h1 className="text-3xl font-bold">Liked Songs</h1>
      </div>
      {songs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No liked songs yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song, idx) => (
            <SongCard key={song._id} song={song} index={idx} allSongs={songs} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;