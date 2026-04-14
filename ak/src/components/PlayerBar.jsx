import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Shuffle, Repeat,
  Heart, Maximize2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isShuffle,
    isLoop,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    changeVolume,
    toggleMute,
    setIsShuffle,
    setIsLoop
  } = usePlayer();

  const { token, user, refreshUser } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekProgress, setSeekProgress] = useState(0);
  const progressBarRef = useRef(null);

  // Check if current song is liked when song or user changes
  useEffect(() => {
    if (!currentSong) return;
    if (user?.likedSongs) {
      // Try to match by _id or youtubeId
      const liked = user.likedSongs.some(song => 
        (song._id && song._id === currentSong._id) || 
        (song.youtubeId && song.youtubeId === currentSong.youtubeId)
      );
      setIsLiked(liked);
    } else {
      setIsLiked(false);
    }
  }, [user, currentSong]);

  const handleLike = async () => {
    if (liking || !currentSong) return;
    setLiking(true);
    try {
      let songId = currentSong._id;
      // If song doesn't have a database ID, save it first
      if (!songId) {
        const saveRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/songs`,
          {
            youtubeId: currentSong.youtubeId,
            title: currentSong.title,
            artist: currentSong.artist,
            thumbnail: currentSong.thumbnail,
            duration: currentSong.duration || ''
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        songId = saveRes.data._id;
        // Attach _id to currentSong for future use
        currentSong._id = songId;
      }
      // Toggle like
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/like-song`,
        { songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(res.data.liked);
      // Refresh user data to sync liked songs across components
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      refreshUser(userRes.data.user);
    } catch (err) {
      console.error('Like error:', err.response?.data || err.message);
    } finally {
      setLiking(false);
    }
  };

  useEffect(() => {
    if (!isSeeking) {
      setSeekProgress(progress);
    }
  }, [progress, isSeeking]);

  if (!currentSong) return null;

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${mins}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mouse seeking handlers
  const handleSeekStart = (e) => {
    setIsSeeking(true);
    handleSeekMove(e);
  };

  const handleSeekMove = (e) => {
    if (!isSeeking || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.min(Math.max(percent, 0), 1);
    setSeekProgress(percent * duration);
  };

  const handleSeekEnd = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.min(Math.max(percent, 0), 1);
    seekTo(percent * duration);
    setIsSeeking(false);
  };

  // Touch seeking handlers for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsSeeking(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e) => {
    if (!isSeeking || !progressBarRef.current) return;
    const touch = e.touches[0];
    const rect = progressBarRef.current.getBoundingClientRect();
    let percent = (touch.clientX - rect.left) / rect.width;
    percent = Math.min(Math.max(percent, 0), 1);
    setSeekProgress(percent * duration);
  };

  const handleTouchEnd = (e) => {
    if (!progressBarRef.current) return;
    const touch = e.changedTouches[0];
    const rect = progressBarRef.current.getBoundingClientRect();
    let percent = (touch.clientX - rect.left) / rect.width;
    percent = Math.min(Math.max(percent, 0), 1);
    seekTo(percent * duration);
    setIsSeeking(false);
  };

  const handleVolumeChange = (e) => {
    changeVolume(Number(e.target.value));
  };

  const progressPercent = duration ? (seekProgress / duration) * 100 : 0;

  // Reusable progress bar component
  const ProgressBar = () => (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[11px] text-gray-400 tabular-nums min-w-[40px] text-right">
        {formatTime(seekProgress)}
      </span>
      <div
        ref={progressBarRef}
        className="flex-1 h-1.5 bg-gray-600/60 rounded-full cursor-pointer relative group"
        onMouseDown={handleSeekStart}
        onMouseMove={handleSeekMove}
        onMouseUp={handleSeekEnd}
        onMouseLeave={() => isSeeking && handleSeekEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-75"
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          style={{ left: `calc(${progressPercent}% - 6px)` }}
        />
      </div>
      <span className="text-[11px] text-gray-400 tabular-nums min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* MOBILE LAYOUT */}
      <div className="block md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="px-3 py-2 space-y-2">
          {/* Row 1: Thumbnail + Info + Actions */}
          <div className="flex items-center gap-3">
            <img
              src={currentSong.thumbnail}
              className="w-12 h-12 rounded-lg object-cover shadow-md"
              alt={currentSong.title}
            />
            <div className="flex-1 min-w-0">
              <Link to={`/player/${currentSong.youtubeId}`} className="block">
                <h4 className="text-sm font-medium truncate text-white">{currentSong.title}</h4>
              </Link>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Like button - now with backend integration */}
              <button 
                onClick={handleLike} 
                disabled={liking}
                className="active:scale-95 transition-transform"
              >
                <Heart size={20} className={isLiked ? 'text-green-500 fill-green-500' : 'text-gray-300'} />
              </button>
              <button onClick={toggleMute} className="active:scale-95 transition-transform">
                {volume === 0 ? <VolumeX size={20} className="text-gray-300" /> : <Volume2 size={20} className="text-gray-300" />}
              </button>
              <Link to={`/player/${currentSong.youtubeId}`} className="active:scale-95 transition-transform">
                <Maximize2 size={18} className="text-gray-300" />
              </Link>
            </div>
          </div>

          {/* Row 2: Playback Controls */}
          <div className="flex items-center justify-center gap-6 py-1">
            <button onClick={() => setIsShuffle(!isShuffle)} className="active:scale-95 transition-transform">
              <Shuffle size={20} className={isShuffle ? 'text-green-500' : 'text-gray-300'} />
            </button>
            <button onClick={previousSong} className="active:scale-95 transition-transform">
              <SkipBack size={24} className="text-white" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white text-black p-3 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-0.5" />}
            </button>
            <button onClick={nextSong} className="active:scale-95 transition-transform">
              <SkipForward size={24} className="text-white" />
            </button>
            <button onClick={() => setIsLoop(!isLoop)} className="active:scale-95 transition-transform">
              <Repeat size={20} className={isLoop ? 'text-green-500' : 'text-gray-300'} />
            </button>
          </div>

          {/* Row 3: Progress Bar */}
          <ProgressBar />
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:block backdrop-blur-xl bg-black/80 border-t border-white/20">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* LEFT: Song Info */}
            <div className="flex items-center gap-3 w-1/4 min-w-0">
              <img
                src={currentSong.thumbnail}
                className="w-10 h-10 rounded object-cover shadow-md"
                alt={currentSong.title}
              />
              <div className="flex-1 min-w-0">
                <Link to={`/player/${currentSong.youtubeId}`} className="text-sm font-medium truncate block hover:underline">
                  {currentSong.title}
                </Link>
                <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
              </div>
              {/* Like button - now with backend integration */}
              <button 
                onClick={handleLike} 
                disabled={liking}
                className="hover:scale-105 transition"
              >
                <Heart size={18} className={isLiked ? 'text-green-500 fill-green-500' : 'text-gray-400'} />
              </button>
            </div>

            {/* CENTER: Controls + Progress */}
            <div className="flex flex-col items-center gap-2 w-2/4">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsShuffle(!isShuffle)} className="hover:text-green-500 transition">
                  <Shuffle size={18} className={isShuffle ? 'text-green-500' : 'text-gray-400'} />
                </button>
                <button onClick={previousSong} className="hover:text-white transition">
                  <SkipBack size={20} className="text-gray-200" />
                </button>
                <button
                  onClick={togglePlay}
                  className="bg-white text-black p-2 rounded-full hover:scale-105 transition shadow-md"
                >
                  {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-0.5" />}
                </button>
                <button onClick={nextSong} className="hover:text-white transition">
                  <SkipForward size={20} className="text-gray-200" />
                </button>
                <button onClick={() => setIsLoop(!isLoop)} className="hover:text-green-500 transition">
                  <Repeat size={18} className={isLoop ? 'text-green-500' : 'text-gray-400'} />
                </button>
              </div>
              <ProgressBar />
            </div>

            {/* RIGHT: Volume & Expand */}
            <div className="flex items-center justify-end gap-3 w-1/4">
              <button onClick={toggleMute} className="hover:text-white transition">
                {volume === 0 ? <VolumeX size={18} className="text-gray-400" /> : <Volume2 size={18} className="text-gray-400" />}
              </button>
              <div className="w-28">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer accent-green-500"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`
                  }}
                />
              </div>
              <Link to={`/player/${currentSong.youtubeId}`} className="hover:text-white transition">
                <Maximize2 size={16} className="text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerBar;