import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Clock, PlayCircle, TrendingUp, Music, 
  Award, Headphones, Loader, ArrowRight, Sparkles 
} from 'lucide-react';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalListeningTime: 0,
    totalPlays: 0,
    uniqueSongs: 0,
    mostPlayed: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const statCards = [
    { icon: Clock, label: 'Listening Time', value: formatTime(stats.totalListeningTime), color: 'from-purple-500 to-indigo-500', shadow: 'shadow-purple-500/20' },
    { icon: Headphones, label: 'Total Plays', value: stats.totalPlays.toLocaleString(), color: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
    { icon: Award, label: 'Unique Songs', value: stats.uniqueSongs.toLocaleString(), color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader className="w-10 h-10 animate-spin text-purple-500" />
        <p className="text-gray-400 animate-pulse">Calculating your stats...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Rhythm</span> In Numbers
          </h1>
          <p className="text-gray-400 mt-1">Deep dive into your musical journey</p>
        </motion.div>

        <Link to="/daily-stats" className="group flex items-center gap-2 px-5 py-2.5 glass-card hover:border-purple-500/50 transition-all text-sm font-medium">
          <Sparkles size={16} className="text-purple-400" />
          Detailed History
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card p-8 group hover:bg-white/[0.05] ${card.shadow}`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform shadow-lg`}>
              <card.icon size={28} className="text-white" />
            </div>
            <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">{card.label}</h3>
            <p className="text-4xl font-black mt-2 tracking-tight">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Most Played List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-purple-500" />
            <h2 className="text-xl font-bold">Heavy Rotation</h2>
          </div>
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Top 5 Records</span>
        </div>

        <div className="p-4">
          {stats.mostPlayed.length === 0 ? (
            <div className="text-center py-12">
              <Music size={48} className="mx-auto mb-4 text-gray-700" />
              <p className="text-gray-400">Your turntable is empty.</p>
              <Link to="/" className="text-purple-400 text-sm hover:underline mt-2 inline-block">Start listening</Link>
            </div>
          ) : (
            <div className="grid gap-2">
              {stats.mostPlayed.map((item, idx) => (
                <motion.div 
                  key={item._id || idx}
                  whileHover={{ x: 10 }}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-3xl font-black text-gray-200/20 group-hover:text-purple-500/40 transition-colors w-10">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <div className="h-12 w-12 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden shadow-md">
                        {/* Placeholder for song thumbnail if you have it in item.song[0].thumbnail */}
                        <img 
                          src={item.song[0]?.thumbnail || 'https://via.placeholder.com/150'} 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                    </div>
                    <div>
                      <p className="font-bold text-lg group-hover:text-purple-400 transition-colors">
                        {item.song[0]?.title || 'Unknown Track'}
                      </p>
                      <p className="text-sm text-gray-500 uppercase tracking-tighter italic">
                        {item.song[0]?.artist || 'Unknown Artist'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <PlayCircle size={14} className="animate-pulse" />
                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-widest">Total Spins</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;