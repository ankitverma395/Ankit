import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const QueueModal = ({ isOpen, onClose }) => {
  const { queue, currentSong, playSong, removeFromQueue } = usePlayer();

  if (!isOpen) return null;

  const currentIndex = queue.findIndex(s => s.youtubeId === currentSong?.youtubeId);
  const upcoming = queue.slice(currentIndex + 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-lg bg-[#121212] rounded-t-2xl border-t border-white/10 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Up Next</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {upcoming.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Queue is empty</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {upcoming.map((song, idx) => (
                  <div
                    key={song.youtubeId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 group"
                  >
                    <img src={song.thumbnail} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{song.title}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          playSong(song);
                          onClose();
                        }}
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => removeFromQueue(currentIndex + 1 + idx)}
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QueueModal;