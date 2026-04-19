import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Mic, Music, Loader, TrendingUp, Users } from 'lucide-react';

const TopArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) throw new Error('API URL not configured');

        const res = await axios.get(`${API_URL}/youtube/trending`);
        const data = res.data?.songs || [];

        if (data.length === 0) {
          setError('No trending artists found');
          return;
        }

        const artistMap = new Map();

        data.forEach((song) => {
          const artistName = song.channelTitle || song.artist || 'Unknown Artist';
          const thumbnail = song.thumbnail || song.thumbnails?.medium?.url || '';

          if (!artistMap.has(artistName)) {
            artistMap.set(artistName, {
              name: artistName,
              thumbnail,
              songsCount: 1,
            });
          } else {
            artistMap.get(artistName).songsCount += 1;
          }
        });

        // Sort by frequency and take top 20
        const artistsList = Array.from(artistMap.values())
          .sort((a, b) => b.songsCount - a.songsCount)
          .slice(0, 20);

        setArtists(artistsList);
      } catch (err) {
        setError('Failed to sync with global charts');
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader className="animate-spin text-purple-500" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Mapping the Soundscape...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-32 pt-4 px-4 md:px-0">
      
      {/* --- Artist Spotlight Header --- */}
      <div className="relative overflow-hidden rounded-[3rem] bg-zinc-900/50 border border-white/5 p-8 md:p-16">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Users size={250} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-purple-400 font-black tracking-widest uppercase text-[10px]">
            <TrendingUp size={14} /> Trending Creators
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic text-white leading-none">
            TOP <br /> <span className="text-purple-500">ARTISTS.</span>
          </h1>
          <p className="text-gray-400 max-w-sm font-medium">
            The voices defining the current era. Ranked by global resonance and frequency.
          </p>
        </div>
      </div>

      {/* --- Artist Grid --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        <AnimatePresence>
          {artists.map((artist, idx) => (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10 }}
              className="group flex flex-col items-center text-center space-y-4"
            >
              {/* Profile Image Container */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-transparent group-hover:border-purple-500 transition-all duration-300 p-1 bg-gradient-to-tr from-white/10 to-transparent">
                  <div className="w-full h-full rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {artist.thumbnail ? (
                      <img
                        src={artist.thumbnail}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <Mic size={40} className="text-zinc-600" />
                    )}
                  </div>
                </div>

                {/* Rank Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center shadow-xl border-4 border-black">
                  {idx + 1}
                </div>
              </div>

              {/* Artist Info */}
              <div className="space-y-1 w-full px-2">
                <h3 className="font-black italic uppercase tracking-tighter text-sm md:text-base text-white truncate group-hover:text-purple-400 transition-colors">
                  {artist.name}
                </h3>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Music size={10} className="text-purple-500" />
                  {artist.songsCount} Featured Hits
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- Error/Empty State --- */}
      {(error || artists.length === 0) && !loading && (
        <div className="glass-card py-24 text-center rounded-[3rem] border-dashed border-2 border-white/5">
          <Mic size={48} className="mx-auto text-gray-800 mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            {error || 'No artists currently trending'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TopArtists;