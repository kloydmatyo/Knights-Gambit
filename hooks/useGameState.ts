import { useState, useCallback } from 'react';
import { GameState, GameEngine, CharacterClass } from '@/lib/game-engine';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const initializeGame = useCallback((characterClass: CharacterClass) => {
    const newState = GameEngine.initializeGame(characterClass);
    setGameState(newState);
    return newState;
  }, []);

  const updateGameState = useCallback((updater: (state: GameState) => GameState) => {
    setGameState((current) => {
      if (!current) return null;
      return updater(current);
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(null);
  }, []);

  return {
    gameState,
    initializeGame,
    updateGameState,
    resetGame,
  };
}
