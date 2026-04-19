import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { BarChart3, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

const Charts = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCharts = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      if (!API_URL) {
        setError('API configuration missing');
        return;
      }

      const res = await axios.get(`${API_URL}/youtube/trending`);
      const data = res.data?.songs || [];

      if (data.length === 0) {
        setError('The charts are empty right now.');
      } else {
        setSongs(data);
        setError('');
      }
    } catch (err) {
      console.error('❌ Charts error:', err);
      setError('Failed to sync with trending global charts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4"
      >
        <div className="p-4 bg-red-500/10 rounded-full text-red-400">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-white">{error}</h2>
        <button 
          onClick={fetchCharts}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
        >
          <RefreshCw size={18} /> Retry
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-purple-400">
            <TrendingUp size={20} className="animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Live Pulse</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
            Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Charts</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-md">
            The most played tracks across the globe, updated in real-time from Nexora's network.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
          <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-bold shadow-xl">Global</button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-300 rounded-xl text-sm font-bold transition-all">Local</button>
        </div>
      </div>

      {/* FEATURED #1 TRACK (Hero Style) */}
      {songs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <img 
            src={songs[0].thumbnail} 
            alt="Trending #1" 
            className="w-full h-[300px] md:h-[400px] object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-600 w-fit rounded-full text-[10px] font-black uppercase tracking-widest text-white">
              Trending No. 1
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white line-clamp-1">{songs[0].title}</h2>
            <p className="text-xl text-gray-300 font-medium">{songs[0].artist}</p>
          </div>
        </motion.div>
      )}

      {/* THE REST OF THE GRID */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 size={20} className="text-pink-500" />
          Rising Hits
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <AnimatePresence mode='popLayout'>
            {songs.slice(1).map((song, idx) => (
              <motion.div
                key={song.youtubeId || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <SongCard
                  song={song}
                  index={idx + 1}
                  allSongs={songs}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Charts;