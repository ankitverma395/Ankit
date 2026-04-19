import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { Podcast, Loader, Mic2, Sparkles, WifiOff, AlertCircle } from 'lucide-react';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) throw new Error('API URL not configured');

        const res = await axios.get(
          `${API_URL}/youtube/search?q=popular podcast episodes 2026&maxResults=20`
        );

        const data = res.data?.songs || [];
        if (data.length === 0) setError('No podcasts found');
        setPodcasts(data);
      } catch (err) {
        setError(err.message === 'API URL not configured' ? err.message : 'Failed to load podcasts');
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="relative">
          <Loader className="w-12 h-12 animate-spin text-purple-500" />
          <Mic2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-white" />
        </div>
        <p className="text-gray-500 font-black tracking-widest text-[10px] uppercase animate-pulse">
          Tuning into the world...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center max-w-lg mx-auto mt-20 border-red-500/20"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tighter">Connection Interrupted</h2>
        <p className="text-gray-400 text-sm mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black rounded-xl font-black text-xs hover:bg-purple-500 hover:text-white transition-all"
        >
          RETRY CONNECTION
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-32 px-4 md:px-0">
      
      {/* --- Header & Spotlight --- */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950/30 border border-white/5 p-8 md:p-12">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Mic2 size={200} />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-black tracking-[0.3em] uppercase text-[10px]">
            <Sparkles size={14} /> Nexora Originals & More
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic text-white leading-none">
            PODCAST <br /> <span className="text-purple-500">STUDIO.</span>
          </h1>
          <p className="text-gray-400 max-w-md font-medium text-sm md:text-base">
            Deep dives, interviews, and stories that move you. Curated long-form content from around the globe.
          </p>
        </div>
      </div>

      {/* --- Featured Row --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3">
            <Mic2 className="text-purple-500" size={24} /> Trending Episodes
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/20 to-transparent ml-4" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          <AnimatePresence>
            {podcasts.map((podcast, idx) => (
              <motion.div
                key={podcast.youtubeId || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className="absolute -inset-2 bg-gradient-to-b from-purple-500/10 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                <SongCard
                  song={podcast}
                  index={idx}
                  allSongs={podcasts}
                />
                {/* Podcast Badge */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 pointer-events-none">
                   <p className="text-[8px] font-black text-white uppercase tracking-widest">Episode</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* --- Empty State --- */}
      {podcasts.length === 0 && (
        <div className="glass-card py-20 text-center rounded-[3rem] border-dashed border-2 border-white/5">
          <Podcast size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No episodes in range</p>
        </div>
      )}
    </div>
  );
};

export default Podcasts;