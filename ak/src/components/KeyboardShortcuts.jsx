import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

const KeyboardShortcuts = () => {
  const { togglePlay, nextSong, previousSong, toggleMute, volume, changeVolume } = usePlayer();

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch(e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': nextSong(); break;
        case 'ArrowLeft': previousSong(); break;
        case 'KeyM': toggleMute(); break;
        case 'ArrowUp': changeVolume(Math.min(volume + 10, 100)); break;
        case 'ArrowDown': changeVolume(Math.max(volume - 10, 0)); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [togglePlay, nextSong, previousSong, toggleMute, volume, changeVolume]);

  return null;
};
export default KeyboardShortcuts;