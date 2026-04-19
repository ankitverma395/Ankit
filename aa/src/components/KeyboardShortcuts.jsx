import { useEffect, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';

const KeyboardShortcuts = () => {
  const { 
    togglePlay, 
    nextSong, 
    previousSong, 
    toggleMute, 
    volume, 
    setVolume, // Assuming your context has a direct setter or use changeVolume
    isPlaying 
  } = usePlayer();

  // We use a callback to ensure we always have the latest state 
  // without needing to thrash the event listener
  const handleKey = useCallback((e) => {
    // 1. Don't trigger shortcuts if the user is typing a comment or searching
    const isTyping = e.target.tagName === 'INPUT' || 
                     e.target.tagName === 'TEXTAREA' || 
                     e.target.isContentEditable;
    
    if (isTyping) return;

    switch(e.code) {
      case 'Space':
        e.preventDefault(); // Stop page from jumping down
        togglePlay();
        break;

      case 'ArrowRight':
        e.preventDefault();
        nextSong();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        previousSong();
        break;

      case 'KeyM':
        toggleMute();
        break;

      case 'ArrowUp':
        e.preventDefault();
        // Use the current volume from the player context
        setVolume(prev => Math.min(prev + 5, 100)); 
        break;

      case 'ArrowDown':
        e.preventDefault();
        setVolume(prev => Math.max(prev - 5, 0));
        break;

      case 'KeyL': // Secret feature: Like song shortcut?
        // toggleLike(); 
        break;

      default:
        break;
    }
  }, [togglePlay, nextSong, previousSong, toggleMute, setVolume]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return null;
};

export default KeyboardShortcuts;