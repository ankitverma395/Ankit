import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { Radio as RadioIcon } from 'lucide-react';

const Radio = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRadioSongs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        if (!API_URL) {
          setError('API URL not configured');
          return;
        }

        const res = await axios.get(
          `${API_URL}/youtube/search?q=radio hits`
        );

        console.log("🔥 Radio API:", res.data);

        // ✅ FIX: extract songs properly
        const data = res.data?.songs || [];

        if (data.length === 0) {
          setError('No radio songs found');
        }

        setSongs(data);

      } catch (err) {
        console.error('❌ Radio error:', err);
        setError('Failed to load radio songs');
      } finally {
        setLoading(false);
      }
    };

    fetchRadioSongs();
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
        <RadioIcon size={32} className="text-purple-400" />
        <h1 className="text-3xl font-bold">Radio</h1>
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

export default Radio;