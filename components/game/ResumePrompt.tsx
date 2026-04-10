'use client';

import { motion } from 'framer-motion';
import { SaveData } from '@/lib/game-engine/SaveEngine';

interface ResumePromptProps {
  save: SaveData;
  onResume: () => void;
  onNewGame: () => void;
}

export default function ResumePrompt({ save, onResume, onNewGame }: ResumePromptProps) {
  return (
    <div className="min-h-screen w-full bg-game-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-game-primary border-2 border-yellow-500 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
      >
        <div className="text-3xl mb-3">⚠️</div>
        <h2 className="text-white font-black text-xl mb-1">Resume previous run?</h2>
        <p className="text-gray-400 text-sm mb-5">
          A saved run was found on this device.
        </p>

        <div className="bg-game-bg rounded-xl px-4 py-3 mb-6 text-left space-y-1">
          <div className="text-gray-400 text-xs uppercase tracking-wider">Saved Run</div>
          <div className="text-white font-bold">
            👤 {save.playerName}
          </div>
          <div className="text-game-gold text-sm">
            Floor {save.gameState.currentFloor} &nbsp;·&nbsp; {save.gameState.player.class}
          </div>
          <div className="text-gray-500 text-xs">
            {save.gameState.player.health}/{save.gameState.player.maxHealth} HP &nbsp;·&nbsp; {save.gameState.player.coins} coins
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onResume}
            className="flex-1 bg-game-gold text-black font-black py-3 rounded-xl text-sm shadow-lg"
          >
            ▶ Resume
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNewGame}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl text-sm"
          >
            ✕ New Game
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
