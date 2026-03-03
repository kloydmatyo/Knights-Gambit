'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface GameOverScreenProps {
  isVictory: boolean;
  floor: number;
  turns: number;
  coinsEarned: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export default function GameOverScreen({
  isVictory,
  floor,
  turns,
  coinsEarned,
  onRestart,
  onMainMenu,
}: GameOverScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <Card variant="elevated" className="max-w-2xl w-full p-8 text-center">
          {/* Title */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-8xl mb-4"
          >
            {isVictory ? '🏆' : '💀'}
          </motion.div>

          <h1
            className={`text-5xl font-bold mb-4 ${
              isVictory ? 'text-game-gold' : 'text-game-accent'
            }`}
          >
            {isVictory ? 'VICTORY!' : 'GAME OVER'}
          </h1>

          <p className="text-gray-400 text-xl mb-8">
            {isVictory
              ? 'You have conquered the dungeon!'
              : 'Your adventure has come to an end...'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-game-bg rounded p-4">
              <div className="text-3xl mb-2">🏰</div>
              <div className="text-gray-400 text-sm">Floor Reached</div>
              <div className="text-game-gold font-bold text-2xl">{floor}</div>
            </div>

            <div className="bg-game-bg rounded p-4">
              <div className="text-3xl mb-2">🎲</div>
              <div className="text-gray-400 text-sm">Total Turns</div>
              <div className="text-game-mana font-bold text-2xl">{turns}</div>
            </div>

            <div className="bg-game-bg rounded p-4">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-gray-400 text-sm">Coins Earned</div>
              <div className="text-game-gold font-bold text-2xl">{coinsEarned}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button size="lg" onClick={onRestart} className="flex-1">
              🔄 Play Again
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={onMainMenu}
              className="flex-1"
            >
              🏠 Main Menu
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
