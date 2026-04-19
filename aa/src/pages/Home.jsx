import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import axios from 'axios';
import { TrendingUp, Play, Sparkles, Headphones, ChevronRight, Radio, Music } from 'lucide-react';
import SongCard from '../components/SongCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const { user } = useAuth();
  const { playSong } = usePlayer();

  const getArray = (data) => (Array.isArray(data) ? data : data?.songs || []);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { if (page > 1) loadMoreTrending(); }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/youtube/trending?page=1`);
      const trendingData = getArray(res.data);
      setTrending(trendingData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTrending = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/youtube/trending?page=${page}`);
      const newSongs = getArray(res.data);
      if (!newSongs.length) return setHasMore(false);
      setTrending(prev => [...prev, ...newSongs]);
    } catch (err) {
      console.error(err);
    }
  };

  const lastSongRef = (node) => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setPage(prev => prev + 1);
    });

    if (node) observer.current.observe(node);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12 pb-28 px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 md:pt-6">

      {/* Hero Section - Made Smaller (Photo/Background reduced) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative min-h-[180px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[280px] rounded-xl sm:rounded-2xl md:rounded-2xl overflow-hidden group"
      >
        {/* Background Image with reduced opacity and scale */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-[3s] ease-out" />
        
        {/* Gradient layers - lighter */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-purple-900/50 to-black/60" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* Smaller glow effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/20 blur-[60px]" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/15 blur-[60px]" />

        <div className="relative h-full flex flex-col justify-center px-5 sm:px-8 md:px-10 py-5 sm:py-6">
          
          {/* Badge - smaller */}
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md rounded-full px-2.5 py-0.5 w-fit mb-2">
            <Sparkles size={10} className="text-purple-400" />
            <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-purple-300">NEXORA</span>
          </div>
          
          {/* Heading - smaller text */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight max-w-2xl">
            Keep the <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-white">
              Rhythm Flowing
            </span>
          </h1>

          {/* Subtext - shorter */}
          <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-md">
            Discover trending tracks. Your vibe, your playlist.
          </p>

          {/* Buttons - smaller */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-5">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playSong(trending[0])}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-xs sm:text-sm shadow-md"
            >
              <Play size={14} fill="currentColor" /> Play
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg font-bold text-xs sm:text-sm text-white"
            >
              <Headphones size={14} /> Explore
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Trending Section */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 sm:mb-6 px-1">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-500" />
              <span>Trending Now</span>
            </h2>
            <p className="text-gray-500 text-[11px] sm:text-xs mt-1">Most played tracks this week</p>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] sm:text-xs bg-white/5 px-2.5 py-1 rounded-full">
            <Radio size={12} />
            <span>Live</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          <AnimatePresence>
            {trending.map((song, idx) => (
              <motion.div 
                key={song.youtubeId || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                ref={trending.length === idx + 1 ? lastSongRef : null}
              >
                <SongCard song={song} index={idx} allSongs={trending} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </section>

      {trending.length === 0 && (
        <div className="text-center py-16">
          <Music size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-500 text-sm">No tracks available. Check back later!</p>
        </div>
      )}
    </div>
  );
};

export default Home;