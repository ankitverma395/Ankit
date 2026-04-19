import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, ListMusic } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import QueueModal from './QueueModal';

const MobilePlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    nextSong,
    progress,
    duration,
    seekTo
  } = usePlayer();

  const navigate = useNavigate();
  const [showQueue, setShowQueue] = useState(false);
  const barRef = useRef(null);

  if (!currentSong) return null;

  // % progress
  const percent = duration ? (progress / duration) * 100 : 0;

  // seek handler
  const handleSeek = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    seekTo(time);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-14 left-0 right-0 z-40 block md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
        >

          {/* 🔥 PROGRESS BAR (SPOTIFY STYLE) */}
          <div
            ref={barRef}
            onClick={handleSeek}
            className="w-full h-[3px] bg-white/20 cursor-pointer"
          >
            <motion.div
              className="h-full bg-green-500"
              style={{ width: `${percent}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* MAIN BAR */}
          <div className="flex items-center gap-3 px-3 py-2">

            {/* Thumbnail */}
            <div
              onClick={() => navigate(`/player/${currentSong.youtubeId}`)}
              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
            >
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Song info */}
            <div
              onClick={() => navigate(`/player/${currentSong.youtubeId}`)}
              className="flex-1 min-w-0 cursor-pointer"
            >
              <h4 className="text-sm font-bold text-white truncate">
                {currentSong.title}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {currentSong.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition"
              >
                {isPlaying ? (
                  <Pause size={20} className="text-white" />
                ) : (
                  <Play size={20} className="text-white ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextSong}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition"
              >
                <SkipForward size={16} className="text-white" />
              </button>

              {/* Queue */}
              <button
                onClick={() => setShowQueue(true)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition"
              >
                <ListMusic size={16} className="text-white" />
              </button>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Queue Modal */}
      <QueueModal
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
      />
    </>
  );
};

export default MobilePlayerBar;