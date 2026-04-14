// // import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
// // import YouTube from 'react-youtube';

// // const PlayerContext = createContext();
// // export const usePlayer = () => useContext(PlayerContext);

// // export const PlayerProvider = ({ children }) => {
// //   const [currentSong, setCurrentSong] = useState(null);
// //   const [queue, setQueue] = useState([]);
// //   const [isPlaying, setIsPlaying] = useState(false);
// //   const [progress, setProgress] = useState(0);
// //   const [duration, setDuration] = useState(0);
// //   const [volume, setVolume] = useState(70);
// //   const [isShuffle, setIsShuffle] = useState(false);
// //   const [isLoop, setIsLoop] = useState(false);

// //   const playerRef = useRef(null);
// //   const intervalRef = useRef(null);
// //   const isReadyRef = useRef(false);
// //   const lastVolumeRef = useRef(70);

// //   // =============================
// //   // LOAD SAVED STATE
// //   // =============================
// //   useEffect(() => {
// //     const saved = JSON.parse(localStorage.getItem('musicPlayerState'));
// //     if (saved) {
// //       setCurrentSong(saved.currentSong || null);
// //       setQueue(saved.queue || []);
// //       setVolume(saved.volume ?? 70);
// //       setIsShuffle(saved.isShuffle ?? false);
// //       setIsLoop(saved.isLoop ?? false);
// //     }
// //   }, []);

// //   // =============================
// //   // SAVE STATE
// //   // =============================
// //   useEffect(() => {
// //     localStorage.setItem('musicPlayerState', JSON.stringify({
// //       currentSong,
// //       queue,
// //       volume,
// //       isShuffle,
// //       isLoop
// //     }));
// //   }, [currentSong, queue, volume, isShuffle, isLoop]);

// //   // cleanup interval
// //   useEffect(() => () => clearInterval(intervalRef.current), []);

// //   // =============================
// //   // PLAYER READY
// //   // =============================
// //   const onReady = useCallback((event) => {
// //     playerRef.current = event.target;
// //     isReadyRef.current = true;

// //     playerRef.current.setVolume(volume);

// //     if (isPlaying) playerRef.current.playVideo();

// //     intervalRef.current = setInterval(() => {
// //       if (playerRef.current) {
// //         try {
// //           const cur = playerRef.current.getCurrentTime();
// //           const dur = playerRef.current.getDuration();

// //           if (!isNaN(cur) && !isNaN(dur)) {
// //             setProgress(cur);
// //             setDuration(dur);
// //           }
// //         } catch {}
// //       }
// //     }, 1000);
// //   }, [volume, isPlaying]);

// //   // =============================
// //   // CORE AUTO NEXT FIX
// //   // =============================
// //   const handleAutoNext = useCallback(() => {
// //     if (!queue.length) return;

// //     const currentIndex = queue.findIndex(
// //       s => s.youtubeId === currentSong?.youtubeId
// //     );

// //     let nextIndex = currentIndex + 1;

// //     if (currentIndex === -1) {
// //       nextIndex = 0;
// //     }

// //     if (nextIndex >= queue.length) {
// //       if (!isLoop) return;
// //       nextIndex = 0;
// //     }

// //     playSong(queue[nextIndex], queue);
// //   }, [queue, currentSong, isLoop]);

// //   // =============================
// //   // YOUTUBE STATE CHANGE
// //   // =============================
// //   const onStateChange = useCallback((event) => {
// //     if (event.data === 1) setIsPlaying(true);
// //     else if (event.data === 2) setIsPlaying(false);
// //     else if (event.data === 0) handleAutoNext(); // END SONG
// //   }, [handleAutoNext]);

// //   // =============================
// //   // PLAY SONG
// //   // =============================
// //   const playSong = useCallback((song, fullQueue = null) => {
// //     if (!song?.youtubeId) return;

// //     if (fullQueue?.length) setQueue(fullQueue);

// //     setCurrentSong(song);
// //     setIsPlaying(true);
// //     setProgress(0);

// //     if (playerRef.current) {
// //       playerRef.current.loadVideoById(song.youtubeId);
// //       playerRef.current.playVideo();
// //     }
// //   }, []);

// //   // =============================
// //   // PLAY / PAUSE
// //   // =============================
// //   const togglePlay = useCallback(() => {
// //     if (!playerRef.current) return;

// //     if (isPlaying) playerRef.current.pauseVideo();
// //     else playerRef.current.playVideo();

// //     setIsPlaying(!isPlaying);
// //   }, [isPlaying]);

// //   // =============================
// //   // VOLUME
// //   // =============================
// //   const changeVolume = useCallback((val) => {
// //     const volumeValue = Math.max(0, Math.min(100, val));

// //     setVolume(volumeValue);

// //     if (volumeValue > 0) {
// //       lastVolumeRef.current = volumeValue;
// //     }

// //     if (playerRef.current) {
// //       playerRef.current.setVolume(volumeValue);
// //     }
// //   }, []);

// //   const toggleMute = useCallback(() => {
// //     if (volume === 0) {
// //       changeVolume(lastVolumeRef.current || 70);
// //     } else {
// //       changeVolume(0);
// //     }
// //   }, [volume, changeVolume]);

// //   // =============================
// //   // NEXT SONG (FIXED)
// //   // =============================
// //   const nextSong = useCallback(() => {
// //     if (!queue.length) return;

// //     const currentIndex = queue.findIndex(
// //       s => s.youtubeId === currentSong?.youtubeId
// //     );

// //     let nextIndex = currentIndex + 1;

// //     if (currentIndex === -1) nextIndex = 0;

// //     if (nextIndex >= queue.length) {
// //       if (!isLoop) return;
// //       nextIndex = 0;
// //     }

// //     playSong(queue[nextIndex], queue);
// //   }, [queue, currentSong, isLoop, playSong]);

// //   // =============================
// //   // PREVIOUS SONG
// //   // =============================
// //   const previousSong = useCallback(() => {
// //     if (!queue.length) return;

// //     const currentIndex = queue.findIndex(
// //       s => s.youtubeId === currentSong?.youtubeId
// //     );

// //     let prevIndex = currentIndex - 1;

// //     if (prevIndex < 0) return;

// //     playSong(queue[prevIndex], queue);
// //   }, [queue, currentSong, playSong]);

// //   const seekTo = useCallback((sec) => {
// //     if (playerRef.current) {
// //       playerRef.current.seekTo(sec);
// //     }
// //   }, []);

// //   return (
// //     <PlayerContext.Provider value={{
// //       currentSong,
// //       queue,
// //       isPlaying,
// //       progress,
// //       duration,
// //       volume,
// //       isShuffle,
// //       isLoop,
// //       playSong,
// //       togglePlay,
// //       nextSong,
// //       previousSong,
// //       seekTo,
// //       changeVolume,
// //       toggleMute,
// //       setIsShuffle,
// //       setIsLoop,
// //       onReady,
// //       onStateChange
// //     }}>
// //       {children}

// //       {currentSong && (
// //         <div style={{ display: 'none' }}>
// //           <YouTube
// //             videoId={currentSong.youtubeId}
// //             opts={{
// //               width: '0',
// //               height: '0',
// //               playerVars: {
// //                 autoplay: 1,
// //                 controls: 0
// //               }
// //             }}
// //             onReady={onReady}
// //             onStateChange={onStateChange}
// //           />
// //         </div>
// //       )}
// //     </PlayerContext.Provider>
// //   );
// // };


// import axios from 'axios';
// import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
// import YouTube from 'react-youtube';

// const PlayerContext = createContext();
// export const usePlayer = () => useContext(PlayerContext);

// export const PlayerProvider = ({ children }) => {
//   const [currentSong, setCurrentSong] = useState(null);
//   const [queue, setQueue] = useState([]);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [volume, setVolume] = useState(70);
//   const [isShuffle, setIsShuffle] = useState(false);
//   const [isLoop, setIsLoop] = useState(false);

//   const playerRef = useRef(null);
//   const intervalRef = useRef(null);
//   const lastVolumeRef = useRef(70);

//   const trackStartTimeRef = useRef(null);
//   const trackIntervalRef = useRef(null);

//   // =============================
//   // SAVE SONG TO DB
//   // =============================
//   const saveSongToDB = useCallback(async (song) => {
//     if (song._id) return song;

//     try {
//       const res = await axios.post(
//         `${import.meta.env.VITE_API_URL}/songs`,
//         {
//           youtubeId: song.youtubeId,
//           title: song.title,
//           artist: song.artist,
//           thumbnail: song.thumbnail,
//           duration: song.duration || ''
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//         }
//       );
//       return res.data;
//     } catch (err) {
//       console.error('Save song error:', err);
//       return song;
//     }
//   }, []);

//   // =============================
//   // TRACK API
//   // =============================
//   const sendTrack = useCallback(async (songId, duration) => {
//     console.log('sendTrack called with songId:', songId, 'duration:', duration);
//     if (!songId || duration < 1) return;

//     try {
//       await axios.post(
//         `${import.meta.env.VITE_API_URL}/analytics/track`,
//         { songId, durationListened: duration },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           }
//         }
//       );
//     } catch (err) {
//       console.error('Track error:', err);
//     }
//   }, []);

//   // =============================
//   // PLAY SONG
//   // =============================
//   const playSong = useCallback(async (song, fullQueue = null) => {
//     if (!song?.youtubeId) return;

//     const savedSong = await saveSongToDB(song);

//     let savedQueue = null;
//     if (fullQueue?.length) {
//       savedQueue = await Promise.all(fullQueue.map(s => saveSongToDB(s)));
//       setQueue(savedQueue);
//     }

//     setCurrentSong(savedSong);
//     setIsPlaying(true);
//     setProgress(0);

//     playerRef.current?.loadVideoById(savedSong.youtubeId);
//   }, [saveSongToDB]);

//   // =============================
//   // NEXT SONG
//   // =============================
//   const nextSong = useCallback(() => {
//     if (!queue.length) return;

//     const index = queue.findIndex(
//       s => s.youtubeId === currentSong?.youtubeId
//     );

//     let next = index + 1;

//     if (index === -1) next = 0;
//     if (next >= queue.length) {
//       if (!isLoop) return;
//       next = 0;
//     }

//     playSong(queue[next], queue);
//   }, [queue, currentSong, isLoop, playSong]);

//   // =============================
//   // STATE CHANGE + TRACKING
//   // =============================
//   const onStateChange = useCallback((event) => {
//     if (event.data === 1) {
//       setIsPlaying(true);
//       trackStartTimeRef.current = Date.now();

//       clearInterval(trackIntervalRef.current);

//       trackIntervalRef.current = setInterval(() => {
//         if (trackStartTimeRef.current && currentSong?._id) {
//           const elapsed = Math.floor(
//             (Date.now() - trackStartTimeRef.current) / 1000
//           );

//           if (elapsed >= 30) {
//             sendTrack(currentSong._id, elapsed);
//             trackStartTimeRef.current = Date.now();
//           }
//         }
//       }, 30000);

//     } else if (event.data === 2) {
//       setIsPlaying(false);

//       if (trackStartTimeRef.current && currentSong?._id) {
//         const elapsed = Math.floor(
//           (Date.now() - trackStartTimeRef.current) / 1000
//         );
//         if (elapsed > 0) sendTrack(currentSong._id, elapsed);
//       }

//       trackStartTimeRef.current = null;
//       clearInterval(trackIntervalRef.current);

//     } else if (event.data === 0) {
//       if (trackStartTimeRef.current && currentSong?._id) {
//         const elapsed = Math.floor(
//           (Date.now() - trackStartTimeRef.current) / 1000
//         );
//         if (elapsed > 0) sendTrack(currentSong._id, elapsed);
//       }

//       trackStartTimeRef.current = null;
//       clearInterval(trackIntervalRef.current);

//       nextSong();
//     }
//   }, [currentSong, sendTrack, nextSong]);

//   // =============================
//   // READY
//   // =============================
//   const onReady = useCallback((event) => {
//     playerRef.current = event.target;

//     playerRef.current.setVolume(volume);

//     intervalRef.current = setInterval(() => {
//       try {
//         setProgress(playerRef.current.getCurrentTime());
//         setDuration(playerRef.current.getDuration());
//       } catch {}
//     }, 1000);
//   }, [volume]);

//   // =============================
//   // CLEANUP
//   // =============================
//   useEffect(() => {
//     return () => {
//       clearInterval(intervalRef.current);
//       clearInterval(trackIntervalRef.current);
//     };
//   }, []);

//   return (
//     <PlayerContext.Provider value={{
//       currentSong,
//       queue,
//       isPlaying,
//       progress,
//       duration,
//       volume,
//       isShuffle,
//       isLoop,
//       playSong,
//       nextSong,
//       onReady,
//       onStateChange
//     }}>
//       {children}

//       {currentSong && (
//         <div style={{ display: 'none' }}>
//           <YouTube
//             videoId={currentSong.youtubeId}
//             opts={{ width: '0', height: '0', playerVars: { autoplay: 1 } }}
//             onReady={onReady}
//             onStateChange={onStateChange}
//           />
//         </div>
//       )}
//     </PlayerContext.Provider>
//   );
// };


import axios from 'axios';
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isLoop, setIsLoop] = useState(false);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const lastVolumeRef = useRef(70);

  // 🔥 Tracking refs
  const trackStartTimeRef = useRef(null);
  const trackIntervalRef = useRef(null);

  // =============================
  // SAVE SONG TO DB
  // =============================
  const saveSongToDB = useCallback(async (song) => {
    if (song._id) return song;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/songs`,
        {
          youtubeId: song.youtubeId,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return res.data;
    } catch (err) {
      console.error('Save song error:', err);
      return song;
    }
  }, []);

  // =============================
  // TRACK API
  // =============================
  const sendTrack = useCallback(async (songId, duration) => {
    if (!songId || duration < 1) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/analytics/track`,
        { songId, durationListened: duration },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    } catch (err) {
      console.error('Track error:', err);
    }
  }, []);

  // =============================
  // PLAY SONG
  // =============================
  const playSong = useCallback(async (song, fullQueue = null) => {
    if (!song?.youtubeId) return;

    const savedSong = await saveSongToDB(song);

    if (fullQueue?.length) {
      const savedQueue = await Promise.all(fullQueue.map(s => saveSongToDB(s)));
      setQueue(savedQueue);
    }

    setCurrentSong(savedSong);
    setIsPlaying(true);
    setProgress(0);

    playerRef.current?.loadVideoById(savedSong.youtubeId);
  }, [saveSongToDB]);

  // =============================
  // CONTROLS
  // =============================
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }

    setIsPlaying(prev => !prev);
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    if (!queue.length) return;

    const index = queue.findIndex(s => s.youtubeId === currentSong?.youtubeId);
    let next = index + 1;

    if (index === -1) next = 0;
    if (next >= queue.length) {
      if (!isLoop) return;
      next = 0;
    }

    playSong(queue[next], queue);
  }, [queue, currentSong, isLoop, playSong]);

  const previousSong = useCallback(() => {
    if (!queue.length) return;

    const index = queue.findIndex(s => s.youtubeId === currentSong?.youtubeId);
    if (index <= 0) return;

    playSong(queue[index - 1], queue);
  }, [queue, currentSong, playSong]);

  const changeVolume = useCallback((val) => {
    const v = Math.max(0, Math.min(100, val));
    setVolume(v);

    if (v > 0) lastVolumeRef.current = v;

    playerRef.current?.setVolume(v);
  }, []);

  const toggleMute = useCallback(() => {
    if (volume === 0) {
      changeVolume(lastVolumeRef.current || 70);
    } else {
      changeVolume(0);
    }
  }, [volume, changeVolume]);

  const seekTo = useCallback((sec) => {
    playerRef.current?.seekTo(sec);
  }, []);

  // =============================
  // STATE CHANGE + TRACKING
  // =============================
  const onStateChange = useCallback((event) => {
    if (event.data === 1) {
      setIsPlaying(true);
      trackStartTimeRef.current = Date.now();

      clearInterval(trackIntervalRef.current);

      trackIntervalRef.current = setInterval(() => {
        if (trackStartTimeRef.current && currentSong?._id) {
          const elapsed = Math.floor((Date.now() - trackStartTimeRef.current) / 1000);

          if (elapsed >= 30) {
            sendTrack(currentSong._id, elapsed);
            trackStartTimeRef.current = Date.now();
          }
        }
      }, 30000);

    } else if (event.data === 2) {
      setIsPlaying(false);

      if (trackStartTimeRef.current && currentSong?._id) {
        const elapsed = Math.floor((Date.now() - trackStartTimeRef.current) / 1000);
        if (elapsed > 0) sendTrack(currentSong._id, elapsed);
      }

      trackStartTimeRef.current = null;
      clearInterval(trackIntervalRef.current);

    } else if (event.data === 0) {
      if (trackStartTimeRef.current && currentSong?._id) {
        const elapsed = Math.floor((Date.now() - trackStartTimeRef.current) / 1000);
        if (elapsed > 0) sendTrack(currentSong._id, elapsed);
      }

      trackStartTimeRef.current = null;
      clearInterval(trackIntervalRef.current);

      nextSong();
    }
  }, [currentSong, sendTrack, nextSong]);

  // =============================
  // READY
  // =============================
  const onReady = useCallback((event) => {
    playerRef.current = event.target;

    playerRef.current.setVolume(volume);

    intervalRef.current = setInterval(() => {
      try {
        setProgress(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      } catch {}
    }, 1000);
  }, [volume]);

  // =============================
  // CLEANUP
  // =============================
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(trackIntervalRef.current);
    };
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong,
      queue,
      isPlaying,
      progress,
      duration,
      volume,
      isLoop,
      playSong,
      togglePlay,
      nextSong,
      previousSong,
      seekTo,
      changeVolume,
      toggleMute,
      setIsLoop,
      onReady,
      onStateChange
    }}>
      {children}

      {currentSong && (
        <div style={{ display: 'none' }}>
          <YouTube
            videoId={currentSong.youtubeId}
            opts={{
              width: '0',
              height: '0',
              playerVars: { autoplay: 1 }
            }}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        </div>
      )}
    </PlayerContext.Provider>
  );
};