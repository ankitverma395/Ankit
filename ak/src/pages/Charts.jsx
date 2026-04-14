import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { BarChart3 } from 'lucide-react';

const Charts = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        if (!API_URL) {
          setError('API URL not configured');
          return;
        }

        const res = await axios.get(`${API_URL}/youtube/trending`);

        console.log("🔥 Charts API:", res.data);

        // ✅ FIX: correct data extraction
        const data = res.data?.songs || [];

        if (data.length === 0) {
          setError('No songs available');
        }

        setSongs(data);

      } catch (err) {
        console.error('❌ Charts error:', err);
        setError('Failed to load charts');
      } finally {
        setLoading(false);
      }
    };

    fetchCharts();
  }, []);

  // ================= UI =================

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 size={32} className="text-purple-400" />
        <h1 className="text-3xl font-bold">Top Charts</h1>
      </div>

      {/* Songs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {songs.map((song, idx) => (
          <motion.div
            key={song.youtubeId || idx}
            whileHover={{ scale: 1.05 }}
          >
            <SongCard
              song={song}
              index={idx}
              allSongs={songs}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Charts;