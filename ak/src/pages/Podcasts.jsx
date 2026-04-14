import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { Podcast, Loader } from 'lucide-react';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        if (!API_URL) {
          setError('API URL not configured');
          return;
        }

        const res = await axios.get(
          `${API_URL}/youtube/search?q=podcast episodes&maxResults=20`
        );

        console.log("🔥 Podcasts API:", res.data);

        // ✅ FIX: extract songs array
        const data = res.data?.songs || [];

        if (data.length === 0) {
          setError('No podcasts found');
        }

        setPodcasts(data);

      } catch (err) {
        console.error('❌ Podcasts error:', err);
        setError('Failed to load podcasts');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  // ================= UI =================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center">
        <Podcast size={48} className="mx-auto text-gray-500 mb-3" />
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Podcast size={32} className="text-purple-400" />
        <h1 className="text-3xl font-bold">Podcasts</h1>
      </div>

      <p className="text-gray-400">
        Discover popular podcast episodes
      </p>

      {podcasts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Podcast size={48} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No podcasts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {podcasts.map((podcast, idx) => (
            <motion.div
              key={podcast.youtubeId || idx}
              whileHover={{ scale: 1.05 }}
            >
              <SongCard
                song={podcast}
                index={idx}
                allSongs={podcasts}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Podcasts;