'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-game-bg">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Title */}
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-game-accent mb-4 text-shadow"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          ⚔️ KNIGHT'S GAMBIT ⚔️
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl text-game-gold mb-2"
        >
          Roguelike Board Game RPG
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-400 mb-12"
        >
          Roll dice, collect treasure, and survive!
        </motion.p>

        {/* Menu Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-4 max-w-md mx-auto"
        >
          <Button
            size="lg"
            onClick={() => router.push('/game')}
            className="text-xl w-full"
          >
            🎮 Start New Game
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => alert('Coming soon!')}
            className="text-xl w-full"
          >
            📖 How to Play
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => alert('Coming soon!')}
            className="text-xl w-full"
          >
            ⚙️ Settings
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🎲</div>
            <h3 className="text-game-gold font-bold mb-1">Dice-Based</h3>
            <p className="text-gray-400 text-sm">
              Roll to move and face challenges
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">⚔️</div>
            <h3 className="text-game-gold font-bold mb-1">6 Classes</h3>
            <p className="text-gray-400 text-sm">
              Each with unique skills and playstyle
            </p>
          </div>

          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-game-gold font-bold mb-1">Roguelike</h3>
            <p className="text-gray-400 text-sm">
              Procedural floors, permadeath
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 text-center text-gray-500 text-sm"
      >
        <p>Built with Next.js, TypeScript & Phaser</p>
        <p className="mt-1">© 2024 Knight's Gambit</p>
      </motion.div>
    </div>
  );
}
