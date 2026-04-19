// frontend/src/components/PlaylistCard.jsx

import { motion, AnimatePresence } from 'framer-motion'; // ✅ FIXED
import { Music, Play, Trash2, ListMusic, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const PlaylistCard = ({ playlist, index, onDelete }) => {
  const { playSong } = usePlayer();
  
  const gradients = [
    'from-indigo-600 via-purple-600 to-pink-500',
    'from-cyan-500 via-blue-600 to-indigo-600',
    'from-emerald-500 via-teal-600 to-cyan-600',
    'from-orange-500 via-red-600 to-rose-600',
    'from-fuchsia-600 via-purple-600 to-violet-600',
  ];
  
  const gradient = gradients[index % gradients.length];
  const hasSongs = playlist.songs?.length > 0;

  const handlePlayAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasSongs) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      onDelete?.(playlist._id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
      className="relative group"
    >
      <Link to={`/playlist/${playlist._id}`} className="block">
        <div className="glass-card overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          
          <div className="relative aspect-square overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:scale-110 transition-transform duration-700`} />
            
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
              >
                <Music size={40} className="text-white drop-shadow-lg" />
              </motion.div>
            </div>

            {/* ✅ FIXED AnimatePresence */}
            <AnimatePresence>
              {hasSongs && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
                >
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlayAll}
                    className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  >
                    <Play size={28} fill="black" className="ml-1" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <ListMusic size={12} className="text-purple-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                {playlist.songs?.length || 0} Tracks
              </span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-b from-white/[0.02] to-transparent">
            <h3 className="font-bold text-sm text-white truncate group-hover:text-purple-400 transition-colors">
              {playlist.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest italic">
                Collection
              </span>
              {playlist.isPublic && <Sparkles size={10} className="text-yellow-500/50" />}
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 p-2 rounded-xl bg-red-500/10 hover:bg-red-500 backdrop-blur-md text-red-500 hover:text-white border border-red-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-1 z-20 shadow-xl"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
};

export default PlaylistCard;