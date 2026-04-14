// frontend/src/pages/DailyStats.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, PlayCircle, BarChart3, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DailyStats = () => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      setError('Failed to load daily stats');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full glass hover:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">Daily Listening History</h1>
      </div>

      {dailyData.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">No listening history yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dailyData.map((day, idx) => (
            <motion.div
              key={day._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Calendar size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">{new Date(day._id).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p className="text-xs text-gray-400">{day._id}</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="font-semibold">{formatTime(day.totalTime)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Plays</p>
                  <p className="font-semibold">{day.totalPlays}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyStats;