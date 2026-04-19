import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Shuffle, Repeat,
  Heart, Maximize2, ListMusic
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QueueModal from './QueueModal';

const PlayerBar = () => {
  const {
    currentSong, isPlaying, progress, duration,
    volume, isShuffle, isLoop,
    togglePlay, nextSong, previousSong,
    seekTo, changeVolume, toggleMute,
    setIsShuffle, setIsLoop
  } = usePlayer();

  const { token, user, refreshUser } = useAuth();

  const [isLiked, setIsLiked] = useState(false);
  const [seek, setSeek] = useState(0);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const barRef = useRef(null);

  // LIKE SYNC
  useEffect(() => {
    if (!currentSong || !user?.likedSongs) return setIsLiked(false);
    const liked = user.likedSongs.some(
      s => s._id === currentSong._id || s.youtubeId === currentSong.youtubeId
    );
    setIsLiked(liked);
  }, [currentSong, user]);

  // PROGRESS SYNC
  useEffect(() => {
    setSeek(progress);
  }, [progress]);

  if (!currentSong) return null;

  const format = (t) => {
    if (!t) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = barRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    setSeek(time);
    seekTo(time);
  };

  const percent = duration ? (seek / duration) * 100 : 0;

  // LIKE SONG
  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/like-song`,
        { songId: currentSong._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsLiked(res.data.liked);

      const userRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      refreshUser(userRes.data.user);
    } catch (err) {
      console.error('Like error', err);
    }
  };

  return (
    <>
      {/* DESKTOP ONLY */}
      <div className="fixed bottom-0 left-0 right-0 z-50 hidden md:block">

        <div className="bg-[#121212]/95 backdrop-blur-md border-t border-gray-800">

          <div className="flex items-center justify-between px-4 md:px-6 py-2.5">

            {/* LEFT */}
            <div className="flex items-center gap-3 w-1/3 min-w-0">
              <img
                src={currentSong.thumbnail}
                className="w-12 h-12 rounded-md object-cover"
              />

              <div className="min-w-0 hidden sm:block">
                <Link to={`/player/${currentSong.youtubeId}`}>
                  <p className="text-sm text-white truncate hover:underline">
                    {currentSong.title}
                  </p>
                </Link>
                <p className="text-xs text-gray-400 truncate">
                  {currentSong.artist}
                </p>
              </div>

              <button onClick={handleLike}>
                <Heart
                  size={18}
                  className={`transition ${
                    isLiked
                      ? 'text-green-500 fill-green-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                />
              </button>
            </div>

            {/* CENTER */}
            <div className="flex flex-col items-center gap-1 w-1/3 max-w-xl">

              {/* CONTROLS */}
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={isShuffle ? 'text-green-500' : 'text-gray-400 hover:text-white'}
                >
                  <Shuffle size={16} />
                </button>

                <button onClick={previousSong}>
                  <SkipBack size={20} className="text-gray-400 hover:text-white transition" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>

                <button onClick={nextSong}>
                  <SkipForward size={20} className="text-gray-400 hover:text-white transition" />
                </button>

                <button
                  onClick={() => setIsLoop(!isLoop)}
                  className={isLoop ? 'text-green-500' : 'text-gray-400 hover:text-white'}
                >
                  <Repeat size={16} />
                </button>
              </div>

              {/* PROGRESS */}
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-gray-400 w-8 text-right">
                  {format(seek)}
                </span>

                <div
                  ref={barRef}
                  onClick={handleSeek}
                  className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group"
                >
                  <div
                    className="h-full bg-green-500 rounded-full relative transition-all"
                    style={{ width: `${percent}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>

                <span className="text-xs text-gray-400 w-8">
                  {format(duration)}
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center justify-end gap-4 w-1/3">

              <button
                onClick={() => setShowQueue(true)}
                className="text-gray-400 hover:text-white transition"
              >
                <ListMusic size={18} />
              </button>

              {/* VOLUME */}
              <div
                className="flex items-center gap-2"
                onMouseEnter={() => setShowVolumeTooltip(true)}
                onMouseLeave={() => setShowVolumeTooltip(false)}
              >
                <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                  {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, #374151 ${volume}%)`
                    }}
                  />

                  {showVolumeTooltip && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded">
                      {volume}%
                    </div>
                  )}
                </div>
              </div>

              <Link to={`/player/${currentSong.youtubeId}`}>
                <Maximize2 size={18} className="text-gray-400 hover:text-white transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QUEUE MODAL */}
      <QueueModal
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
      />
    </>
  );
};

export default PlayerBar;