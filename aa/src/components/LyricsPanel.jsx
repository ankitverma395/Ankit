import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';

const LyricsPanel = () => {
  const { currentSong, progress, isPlaying } = usePlayer();
  const [lyrics, setLyrics] = useState([]);       // [{ time, text }]
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong?.title) {
      setLyrics([]);
      setCurrentLineIndex(-1);
      return;
    }

    const fetchLyrics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Search LRCLIB with title and artist
        const searchQuery = `${currentSong.title} ${currentSong.artist || ''}`.trim();
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.length) {
          throw new Error('No lyrics found');
        }

        // Get the first matching track ID
        const trackId = searchData[0].id;
        const trackUrl = `https://lrclib.net/api/get/${trackId}`;
        const trackRes = await fetch(trackUrl);
        const trackData = await trackRes.json();

        if (trackData.syncedLyrics) {
          const parsed = parseLrc(trackData.syncedLyrics);
          setLyrics(parsed);
        } else if (trackData.plainLyrics) {
          // If no synced lyrics, convert plain text to unsynced lines
          const lines = trackData.plainLyrics.split('\n').filter(l => l.trim());
          const unsynced = lines.map((text, idx) => ({ time: -1, text }));
          setLyrics(unsynced);
        } else {
          throw new Error('No lyrics content');
        }
      } catch (err) {
        console.error('Lyrics fetch error:', err);
        setError(err.message);
        setLyrics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [currentSong]);

  // Update current line based on playback progress
  useEffect(() => {
    if (!lyrics.length) return;

    // Find the last line with time <= progress
    let newIndex = -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (lyrics[i].time !== -1 && lyrics[i].time <= progress) {
        newIndex = i;
        break;
      }
    }
    setCurrentLineIndex(newIndex);
  }, [progress, lyrics]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentLineIndex]);

  // Parse LRC format: [mm:ss.cc] line text
  const parseLrc = (lrcText) => {
    const lines = lrcText.split('\n');
    const parsed = [];
    const timeRegex = /\[(\d{2}):(\d{2}\.\d{2})\](.*)/;

    for (const line of lines) {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseFloat(match[2]);
        const time = minutes * 60 + seconds;
        const text = match[3].trim();
        if (text) parsed.push({ time, text });
      }
    }
    // Sort by time just in case
    parsed.sort((a, b) => a.time - b.time);
    return parsed;
  };

  // Render
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-2xl w-full max-w-md h-[500px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-white font-bold text-lg truncate">
          {currentSong?.title || 'No song playing'}
        </h3>
        <p className="text-gray-400 text-sm">{currentSong?.artist || 'Unknown artist'}</p>
      </div>

      {/* Lyrics area */}
      <div
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700"
      >
        {loading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse text-gray-400">Loading lyrics...</div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 mt-8">
            <p>{error}</p>
            <p className="text-sm text-gray-500 mt-2">Try another song</p>
          </div>
        )}

        {!loading && !error && lyrics.length === 0 && currentSong && (
          <div className="text-center text-gray-500 mt-8">
            No lyrics available for this track
          </div>
        )}

        <AnimatePresence>
          {lyrics.map((line, idx) => (
            <motion.div
              key={idx}
              ref={idx === currentLineIndex ? activeLineRef : null}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.01 }}
              className={`transition-all duration-300 ${
                idx === currentLineIndex
                  ? 'text-green-500 font-semibold text-lg scale-105'
                  : 'text-gray-400 text-base'
              }`}
            >
              {line.text || '♪'}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Small indicator for synced status */}
      {lyrics.length > 0 && (
        <div className="p-2 text-center text-xs text-gray-600 border-t border-gray-800">
          {lyrics[0]?.time === -1 ? 'Plain lyrics (not synced)' : 'Time‑synced lyrics'}
        </div>
      )}
    </div>
  );
};

export default LyricsPanel;