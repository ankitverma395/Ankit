import axios from 'axios';
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react';
import YouTube from 'react-youtube';

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(
    () => Number(localStorage.getItem('nexora-volume')) || 70
  );
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastVolumeRef = useRef(volume);
  const trackStartRef = useRef(null);

  // Mobile fix
  const wasPlayingBeforeHidden = useRef(false);
  const savedProgressBeforeHidden = useRef(0);
  const resumeAttempts = useRef(null);

  // ------------------ Volume Persistence ------------------
  useEffect(() => {
    localStorage.setItem('nexora-volume', volume);
  }, [volume]);

  // ------------------ Save Song ------------------
  const saveSongToDB = async (song) => {
    if (song._id) return song;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/songs`,
        song,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      return res.data;
    } catch {
      return song;
    }
  };

  // ------------------ Analytics ------------------
  const sendAnalytics = async (songId, time) => {
    if (!songId || time < 5) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/analytics/track`,
        { songId, durationListened: time },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
    } catch {}
  };

  // ------------------ PLAY SONG ------------------
  const playSong = useCallback(async (song, fullQueue = null) => {
    if (!song?.youtubeId) return;

    if (currentSong?.youtubeId === song.youtubeId) {
      togglePlay();
      return;
    }

    const saved = await saveSongToDB(song);

    if (fullQueue) setQueue(fullQueue);

    setCurrentSong(saved);
    setIsPlaying(true);
    setProgress(0);

    setTimeout(() => {
      playerRef.current?.loadVideoById(saved.youtubeId);
    }, 200);
  }, [currentSong]);

  // ------------------ PLAY / PAUSE ------------------
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;

    const state = playerRef.current.getPlayerState();

    if (state === 1) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, []);

  // ------------------ NEXT ------------------
  const nextSong = useCallback(() => {
    if (!queue.length) return;

    const index = queue.findIndex(
      (s) => s.youtubeId === currentSong?.youtubeId
    );

    let nextIndex;

    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (queue[nextIndex].youtubeId === currentSong?.youtubeId);
    } else {
      nextIndex = index + 1;

      if (nextIndex >= queue.length) {
        if (isLoop) nextIndex = 0;
        else return;
      }
    }

    playSong(queue[nextIndex]);
  }, [queue, currentSong, isShuffle, isLoop, playSong]);

  // ------------------ PREVIOUS ------------------
  const previousSong = useCallback(() => {
    if (!queue.length) return;

    const index = queue.findIndex(
      (s) => s.youtubeId === currentSong?.youtubeId
    );

    if (index > 0) {
      playSong(queue[index - 1]);
    } else {
      seekTo(0);
    }
  }, [queue, currentSong]);

  // ------------------ VOLUME ------------------
  const changeVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(100, val));
    setVolume(v);

    if (v > 0) lastVolumeRef.current = v;

    playerRef.current?.setVolume(v);
  }, []);

  const toggleMute = useCallback(() => {
    changeVolume(volume === 0 ? lastVolumeRef.current : 0);
  }, [volume, changeVolume]);

  // ------------------ SEEK ------------------
  const seekTo = useCallback((sec) => {
    playerRef.current?.seekTo(sec, true);
    setProgress(sec);
  }, []);

  // ------------------ QUEUE CONTROLS ------------------
  const addToQueue = useCallback((song) => {
    setQueue(prev => {
      if (prev.some(s => s.youtubeId === song.youtubeId)) return prev;
      return [...prev, song];
    });
  }, []);

  const playNext = useCallback((song) => {
    if (!currentSong) {
      playSong(song);
      return;
    }

    const currentIndex = queue.findIndex(
      s => s.youtubeId === currentSong.youtubeId
    );

    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, song);

    setQueue(newQueue);
  }, [queue, currentSong, playSong]);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ------------------ YOUTUBE READY ------------------
  const onReady = (e) => {
    playerRef.current = e.target;
    playerRef.current.setVolume(volume);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (playerRef.current && isPlaying) {
        setProgress(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      }
    }, 1000);
  };

  // ------------------ STATE CHANGE ------------------
  const onStateChange = (e) => {
    if (e.data === 1) {
      setIsPlaying(true);
      trackStartRef.current = Date.now();
    }

    if (e.data === 2) {
      setIsPlaying(false);

      if (trackStartRef.current) {
        const time = Math.floor(
          (Date.now() - trackStartRef.current) / 1000
        );
        sendAnalytics(currentSong?._id, time);
        trackStartRef.current = null;
      }
    }

    if (e.data === 0) {
      nextSong();
    }
  };

  // ------------------ MOBILE RESUME FIX ------------------
  const startResumeAttempts = useCallback(() => {
    if (resumeAttempts.current) clearInterval(resumeAttempts.current);

    let attempts = 0;

    resumeAttempts.current = setInterval(() => {
      attempts++;
      const state = playerRef.current?.getPlayerState();

      if (state === 1) {
        clearInterval(resumeAttempts.current);
        resumeAttempts.current = null;
        return;
      }

      if (state === 2 || state === -1 || state === 5) {
        playerRef.current?.seekTo(savedProgressBeforeHidden.current, true);
        playerRef.current?.playVideo();
      }

      if (attempts >= 20) {
        clearInterval(resumeAttempts.current);
        resumeAttempts.current = null;
      }
    }, 500);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (wasPlayingBeforeHidden.current && playerRef.current) {
          startResumeAttempts();
          wasPlayingBeforeHidden.current = false;
        }
      } else {
        wasPlayingBeforeHidden.current = isPlaying;
        savedProgressBeforeHidden.current =
          playerRef.current?.getCurrentTime() || progress;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, progress, startResumeAttempts]);

  // ------------------ CLEANUP ------------------
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // ------------------ CONTEXT VALUE ------------------
  const value = {
    currentSong,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    isLoop,
    isShuffle,
    setIsLoop,
    setIsShuffle,
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    seekTo,
    changeVolume,
    toggleMute,

    // Queue features
    addToQueue,
    playNext,
    removeFromQueue
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}

      {currentSong && (
        <div className="hidden">
          <YouTube
            videoId={currentSong.youtubeId}
            opts={{
              playerVars: {
                autoplay: 1,
                controls: 0,
                rel: 0,
                modestbranding: 1,
                playsinline: 1
              }
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={nextSong}
          />
        </div>
      )}
    </PlayerContext.Provider>
  );
};