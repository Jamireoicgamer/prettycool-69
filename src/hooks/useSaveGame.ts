
import { useEffect } from 'react';

export const useSaveGame = (gameState: any) => {
  // Auto-save every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      try {
        localStorage.setItem('fallout-scrapline-save', JSON.stringify({
          ...gameState,
          lastSaved: Date.now()
        }));
        console.log('Game auto-saved');
      } catch (error) {
        console.error('Failed to save game:', error);
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [gameState]);

  const saveGame = () => {
    try {
      localStorage.setItem('fallout-scrapline-save', JSON.stringify({
        ...gameState,
        lastSaved: Date.now()
      }));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  };

  const loadGame = () => {
    try {
      const saved = localStorage.getItem('fallout-scrapline-save');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
    return null;
  };

  return { saveGame, loadGame };
};
