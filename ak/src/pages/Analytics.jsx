// frontend/src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
// In Analytics.jsx, add import:
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Clock, PlayCircle, TrendingUp, Music, Award, Headphones, Loader } from 'lucide-react';

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
      console.error('Stats error:', err);
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
    { icon: Clock, label: 'Total Listening Time', value: formatTime(stats.totalListeningTime), color: 'from-purple-500 to-pink-500' },
    { icon: Headphones, label: 'Total Plays', value: stats.totalPlays, color: 'from-blue-500 to-cyan-500' },
    { icon: Award, label: 'Unique Songs', value: stats.uniqueSongs, color: 'from-green-500 to-emerald-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-red-400">{error}</p>
        <button onClick={fetchStats} className="mt-4 btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Music Analytics
      </motion.h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6"
          >
            
<div className="flex justify-end">
  <Link to="/daily-stats" className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
    View daily history <ArrowRight size={16} />
  </Link>
</div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
              <card.icon size={24} className="text-white" />
            </div>
            <p className="text-gray-400 text-sm">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Most Played Songs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={24} className="text-purple-400" />
          <h2 className="text-xl font-semibold">Most Played Songs</h2>
        </div>

        {stats.mostPlayed.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Music size={40} className="mx-auto mb-3 opacity-50" />
            <p>No listening history yet</p>
            <p className="text-sm">Play some music to see your stats!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.mostPlayed.map((item, idx) => (
              <div key={item._id || idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-purple-400 w-8">#{idx + 1}</span>
                  <div>
                    <p className="font-medium">{item.song[0]?.title || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{item.song[0]?.artist || 'Unknown Artist'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <PlayCircle size={16} />
                  <span>{item.count} {item.count === 1 ? 'play' : 'plays'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Analytics;