import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { TrendingUp, Flame, Loader, Clock, Info } from 'lucide-react';

const Trending = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) throw new Error('API URL not configured');

        const res = await axios.get(`${API_URL}/youtube/trending`);
        const data = res.data?.songs || [];

        if (data.length === 0) setError('The charts are currently quiet.');
        setSongs(data);
      } catch (err) {
        console.error('❌ Trending error:', err);
        setError('Failed to load global trends.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="relative">
        <Loader className="animate-spin text-purple-500" size={48} />
        <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={18} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing with charts...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-32 pt-4 px-4 md:px-0">
      
      {/* --- Dynamic Trending Header --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-purple-600/20 via-zinc-900 to-black border border-white/5 p-8 md:p-16"
      >
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none rotate-12">
           <TrendingUp size={300} strokeWidth={1} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-black tracking-widest uppercase text-purple-400 border border-white/5">
              <Flame size={14} className="animate-bounce" /> Hot & Rising
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter italic text-white leading-[0.8]">
              TRENDING <br /> <span className="text-purple-500">NOW.</span>
            </h1>
            
            <div className="flex items-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
               <span className="flex items-center gap-2"><Clock size={14} /> Updated Live</span>
               <span className="flex items-center gap-2"><Info size={14} /> Top 25 Hits</span>
            </div>
          </div>

          <div className="hidden lg:block glass-card p-6 border-white/10 rounded-3xl w-64 rotate-2">
             <p className="text-[10px] font-black text-purple-500 uppercase mb-2">Editor's Pick</p>
             <p className="text-sm font-bold text-gray-300 italic">"The digital landscape is shifting. These tracks are leading the charge across all streaming frequencies."</p>
          </div>
        </div>
      </motion.div>

      {/* --- Chart Grid --- */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <TrendingUp className="text-purple-500" size={24} /> Global Resonance
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/20 to-transparent ml-6" />
        </div>

        {error ? (
          <div className="glass-card py-20 text-center rounded-[3rem] border-red-500/10">
             <p className="text-red-400 font-bold uppercase tracking-widest text-xs">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            <AnimatePresence>
              {songs.map((song, idx) => (
                <motion.div
                  key={song.youtubeId || idx}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group"
                >
                  {/* Rank Indicator */}
                  <div className="absolute -top-3 -left-3 z-20 w-10 h-10 bg-black border border-white/10 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-purple-600 group-hover:border-purple-400 transition-all duration-300">
                     <span className="text-[12px] font-black italic text-white">#{idx + 1}</span>
                  </div>

                  {/* Card Glow */}
                  <div className="absolute inset-0 bg-purple-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <SongCard
                    song={song}
                    index={idx}
                    allSongs={songs}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default Trending;