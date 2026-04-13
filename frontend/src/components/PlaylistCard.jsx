import { motion } from 'framer-motion';
import { Music, Play, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const PlaylistCard = ({ playlist, index, onDelete }) => {
  const { playSong } = usePlayer();
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
  ];
  const gradient = gradients[index % gradients.length];

  const handlePlayAll = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.songs?.length) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(playlist._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (index || 0) * 0.05 }}
      className="glass-card group cursor-pointer hover:scale-105 transition-transform relative"
    >
      <Link to={`/playlist/${playlist._id}`} className="block">
        <div className="relative">
          <div className={`w-full aspect-square bg-gradient-to-br ${gradient} rounded-t-2xl flex items-center justify-center shadow-lg`}>
            <Music size={48} className="text-white/80" />
          </div>
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/60 rounded-t-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <button onClick={handlePlayAll} className="player-btn-primary p-3">
              <Play size={24} className="ml-0.5" />
            </button>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
          <p className="text-xs text-gray-400">{playlist.songs?.length || 0} songs</p>
        </div>
      </Link>
      {/* Delete button - always visible on desktop, appears on hover on mobile */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition hover:bg-red-500 z-10"
        aria-label="Delete playlist"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
};

export default PlaylistCard;