import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Mic, Music } from 'lucide-react';

const TopArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;

        if (!API_URL) {
          setError('API URL not configured');
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_URL}/youtube/trending`);

        console.log("🔥 Full API Response:", res.data);

        // ✅ IMPORTANT FIX (songs array)
        const data = res.data?.songs || [];

        if (data.length === 0) {
          setError('No trending songs available');
          setLoading(false);
          return;
        }

        const artistMap = new Map();

        data.forEach((song) => {
          // ✅ Artist name extraction (robust)
          const artistName =
            song.channelTitle ||
            song.artist ||
            song.snippet?.channelTitle ||
            'Unknown Artist';

          // ✅ Thumbnail extraction (robust)
          const thumbnail =
            song.thumbnail ||
            song.thumbnails?.medium?.url ||
            song.snippet?.thumbnails?.medium?.url ||
            '';

          if (!artistMap.has(artistName)) {
            artistMap.set(artistName, {
              name: artistName,
              thumbnail,
              songs: 1,
            });
          } else {
            artistMap.get(artistName).songs += 1;
          }
        });

        // ✅ Sort by most songs
        const artistsList = Array.from(artistMap.values()).sort(
          (a, b) => b.songs - a.songs
        );

        console.log("✅ Final Artists:", artistsList);

        setArtists(artistsList);

      } catch (err) {
        console.error('❌ Error fetching top artists:', err);
        setError('Failed to load top artists');
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, []);

  // ================= UI =================

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">
        Loading top artists...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        {error}
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Mic size={48} className="mx-auto text-gray-500 mb-3" />
        <p className="text-gray-400">No artists found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Mic size={32} className="text-purple-400" />
        <h1 className="text-3xl font-bold">Top Artists</h1>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {artists.map((artist, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.08 }}
            className="glass-card p-4 text-center cursor-pointer transition"
          >
            {/* Avatar */}
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-3 overflow-hidden">
              {artist.thumbnail ? (
                <img
                  src={artist.thumbnail}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music size={40} className="text-white" />
              )}
            </div>

            {/* Name */}
            <h3 className="font-semibold text-sm truncate">
              {artist.name}
            </h3>

            {/* Song Count */}
            <p className="text-xs text-gray-400">
              {artist.songs} {artist.songs === 1 ? 'song' : 'songs'}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopArtists;