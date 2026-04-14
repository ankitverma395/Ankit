import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreHorizontal, Plus } from 'lucide-react';
import Comments from '../components/Comments';
import AddToPlaylistModal from '../components/AddToPlaylistModal';

const PlayerView = () => {
  const { songId } = useParams();
  const { currentSong, queue, playSong } = usePlayer();
  const [song, setSong] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const found = queue.find(s => s.youtubeId === songId) || currentSong;

    if (found && (!currentSong || found.youtubeId !== currentSong.youtubeId)) {
      playSong(found, queue);
    }

    setSong(found);
  }, [songId, queue, currentSong, playSong]);

  if (!song) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-black/95 via-purple-900/90 to-black/95 backdrop-blur-xl overflow-y-auto"
      style={{ top: '64px', bottom: '80px' }}
    >
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 min-h-full flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full glass hover:bg-white/10 transition"
          >
            <ArrowLeft size={24} />
          </button>

          <h2 className="text-sm font-medium text-gray-400 tracking-wider">
            NOW PLAYING
          </h2>

          <button className="p-2 rounded-full glass hover:bg-white/10 transition">
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Album Art */}
        <div className="flex justify-center mb-8 md:mb-12">
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            src={song.thumbnail}
            alt={song.title}
            className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300?text=No+Image';
            }}
          />
        </div>

        {/* Song Info */}
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold">{song.title}</h1>
          <p className="text-gray-400 text-base md:text-lg mt-1">
            {song.artist}
          </p>

          {/* ✅ Add to Playlist Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-full glass hover:bg-white/10 transition flex items-center gap-2 mx-auto"
          >
            <Plus size={18} /> Add to Playlist
          </button>

          {/* Comments */}
          <Comments songId={song.youtubeId} />
        </div>

      </div>

      {/* ✅ Modal */}
      {showAddModal && (
        <AddToPlaylistModal
          song={song}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </motion.div>
  );
};

export default PlayerView;