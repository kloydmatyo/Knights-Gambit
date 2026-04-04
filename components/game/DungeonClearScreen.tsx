'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { Player } from '@/lib/game-engine/types';

interface DungeonClearScreenProps {
  dungeonNumber: number;
  player: Player;
  turns: number;
  onContinue: () => void;
}

export default function DungeonClearScreen({
  dungeonNumber,
  player,
  turns,
  onContinue,
}: DungeonClearScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="bg-game-primary border-2 border-game-gold rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-7xl mb-4"
        >
          🏰
        </motion.div>

        <h1 className="text-4xl font-bold text-game-gold mb-2">
          Dungeon {dungeonNumber} Cleared!
        </h1>
        <p className="text-gray-400 mb-6">The boss has fallen. Press on, adventurer.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-game-bg rounded-lg p-3">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-white font-bold">{player.health}/{player.maxHealth}</div>
            <div className="text-gray-400 text-xs">HP</div>
          </div>
          <div className="bg-game-bg rounded-lg p-3">
            <div className="text-2xl mb-1">🎲</div>
            <div className="text-white font-bold">{turns}</div>
            <div className="text-gray-400 text-xs">Turns</div>
          </div>
          <div className="bg-game-bg rounded-lg p-3">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-white font-bold">{player.coins}</div>
            <div className="text-gray-400 text-xs">Coins</div>
          </div>
        </div>

        {/* Reward notice */}
        <div className="bg-green-900 border border-green-500 rounded-lg p-3 mb-6 text-sm text-green-300">
          ✨ Reward: HP and Mana restored before the next dungeon!
        </div>

        <Button variant="primary" onClick={onContinue} className="w-full text-lg py-3">
          Continue →
        </Button>
      </motion.div>
    </div>
  );
}
