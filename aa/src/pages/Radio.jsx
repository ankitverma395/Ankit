import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SongCard from '../components/SongCard';
import { Radio as RadioIcon, Signal, Activity, Zap, Info } from 'lucide-react';

const Radio = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRadioSongs = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) throw new Error('API URL not configured');

        // Enhanced query for better radio results
        const res = await axios.get(
          `${API_URL}/youtube/search?q=billboard hot 100 official music videos 2026&maxResults=25`
        );

        const data = res.data?.songs || [];
        if (data.length === 0) setError('Signal lost. No tracks found.');
        
        setSongs(data);
      } catch (err) {
        console.error('❌ Radio error:', err);
        setError('Frequency interference. Failed to load radio.');
      } finally {
        setLoading(false);
      }
    };

    fetchRadioSongs();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-purple-500 rounded-full blur-xl"
        />
        <RadioIcon size={48} className="text-purple-500 animate-pulse relative z-10" />
      </div>
      <p className="text-gray-500 font-black tracking-[0.3em] text-[10px] uppercase">Scanning Frequencies...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-32 pt-4 px-4 md:px-0">
      
      {/* --- Live Broadcast Header --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-900/40 via-black to-black border border-white/5 p-8 md:p-12"
      >
        {/* Animated Background Signal */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Activity size={300} strokeWidth={1} />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 font-black tracking-widest text-[10px] uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live Signal Established
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic text-white leading-none">
              NEXORA <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">RADIO.</span>
            </h1>
            
            <p className="text-gray-400 max-w-sm font-bold text-sm leading-relaxed">
              Real-time synchronization with global chart-toppers. Pure hits, no static.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="glass-card p-4 rounded-2xl flex items-center gap-4 border-white/10">
              <div className="bg-purple-500/20 p-2 rounded-xl text-purple-400">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500">Current Bandwidth</p>
                <p className="text-sm font-bold text-white">High Definition Audio</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Main Station Grid --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Signal className="text-purple-500" size={20} />
            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Global Airwaves</h2>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <Info size={12} /> Auto-Updates Hourly
          </div>
        </div>

        {error ? (
          <div className="glass-card p-12 text-center rounded-[3rem] border-red-500/20">
             <p className="text-red-400 font-bold mb-4">{error}</p>
             <button onClick={() => window.location.reload()} className="text-xs font-black uppercase tracking-widest bg-white text-black px-6 py-2 rounded-full">Recalibrate</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            <AnimatePresence>
              {songs.map((song, idx) => (
                <motion.div
                  key={song.youtubeId || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  {/* Subtle glow effect behind cards */}
                  <div className="absolute inset-0 bg-purple-600/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <SongCard
                    song={song}
                    index={idx}
                    allSongs={songs}
                  />
                  
                  {/* Radio Visualizer Badge */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                    <div className="flex items-end gap-[2px] h-3">
                      {[1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 12, 6, 12, 4] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-[3px] bg-purple-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default Radio;