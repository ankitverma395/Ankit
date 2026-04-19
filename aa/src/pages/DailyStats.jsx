import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, BarChart3, ArrowLeft, TrendingUp, Music2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DailyStats = () => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDailyStats();
  }, []);

  const fetchDailyStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/daily?days=30`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDailyData(res.data);
    } catch (err) {
      console.error('Failed to load daily stats');
    } finally {
      setLoading(false);
    }
  };

  // Memoized stats to prevent recalculation on re-renders
  const stats = useMemo(() => {
    if (dailyData.length === 0) return { maxTime: 0, totalHours: 0 };
    const max = Math.max(...dailyData.map(d => d.totalTime));
    const total = dailyData.reduce((acc, curr) => acc + curr.totalTime, 0);
    return { maxTime: max, totalHours: Math.floor(total / 3600) };
  }, [dailyData]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500/10 border-t-purple-500 rounded-full"
          />
          <BarChart3 className="absolute inset-0 m-auto text-purple-500" size={20} />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Syncing with your vibe</p>
          <p className="text-gray-500 text-sm">Analyzing 30 days of data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32 pt-10 px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)} 
            className="w-14 h-14 flex items-center justify-center rounded-[2rem] glass-card border-white/10 hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic">RHYTHM LOG</h1>
            <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-[10px]">Your Auditory Footprint</p>
          </div>
        </div>

        {dailyData.length > 0 && (
          <div className="flex gap-3">
            <div className="px-5 py-3 glass-card rounded-3xl border-green-500/20 flex items-center gap-3">
              <TrendingUp className="text-green-400" size={18} />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-gray-500">Peak Session</span>
                <span className="text-sm font-bold">{formatTime(stats.maxTime)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {dailyData.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-20 text-center border-dashed border-2 border-white/5 rounded-[3rem]"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={32} className="text-gray-700" />
          </div>
          <h2 className="text-2xl font-bold">The Silence is Loud</h2>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">Log some listening hours to populate your rhythmic heat map.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {dailyData.map((day, idx) => {
              const relativeWidth = (day.totalTime / stats.maxTime) * 100;
              const dateObj = new Date(day._id);
              
              return (
                <motion.div
                  key={day._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <div className="glass-card p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 hover:border-purple-500/30 transition-all duration-500 rounded-[2rem] hover:translate-x-2">
                    
                    {/* Dynamic Bar Background */}
                    <div 
                      className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-purple-600 to-pink-600 opacity-20 group-hover:opacity-100 transition-all duration-700"
                      style={{ width: `${relativeWidth}%` }}
                    />

                    {/* Left: Date Box */}
                    <div className="flex items-center gap-5 z-10">
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-[1.5rem] bg-black/40 border border-white/10 group-hover:border-purple-500/50 transition-all shadow-inner">
                        <span className="text-[9px] uppercase font-black text-purple-400">
                          {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black italic">
                          {dateObj.toLocaleDateString('en-US', { day: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-xl tracking-tight group-hover:text-purple-400 transition-colors">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1.5">
                          <Music2 size={10} className="text-pink-500" />
                          {day.totalPlays} TRACKS SYNCED
                        </p>
                      </div>
                    </div>

                    {/* Right: The Data */}
                    <div className="flex items-center gap-10 md:gap-16 z-10 pr-4">
                      <div className="text-right md:text-left">
                        <p className="text-[9px] uppercase font-black tracking-widest text-gray-600 mb-1">Duration</p>
                        <p className="text-3xl font-black tracking-tighter text-white">
                          {formatTime(day.totalTime)}
                        </p>
                      </div>
                      
                      {/* Trend Indicator */}
                      <div className={`hidden md:flex h-12 w-12 rounded-full items-center justify-center border ${
                        relativeWidth > 70 ? 'border-purple-500/20 bg-purple-500/5' : 'border-white/5'
                      }`}>
                         <BarChart3 size={18} className={relativeWidth > 70 ? 'text-purple-400' : 'text-gray-700'} />
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DailyStats;