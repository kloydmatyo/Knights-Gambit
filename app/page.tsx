'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const HOW_TO_PLAY = [
  { icon: '🎲', title: 'Roll & Move', text: 'Roll the dice each turn to move your token around the board. Land on different tiles to trigger events.' },
  { icon: '⚔️', title: 'Combat', text: 'Fight enemies using basic attacks or class skills. Skills have cooldowns — use them wisely. You can flee with a 50% chance, but failure costs HP.' },
  { icon: '🔮', title: 'Classes', text: 'Knight (tanky), Archer (crit-focused), Mage (mana-powered spells + shield), Barbarian (raw damage), Assassin (poison + crits), Cleric (healing).' },
  { icon: '🏪', title: 'Shop & Upgrades', text: 'Spend coins at shop tiles to buy potions and stat upgrades. Visit the Weapon Upgrade panel to unlock powerful class-specific abilities.' },
  { icon: '🗺️', title: 'Floors', text: 'Complete a full lap to advance floors. Boss floors require defeating the boss. Each floor scales enemy difficulty.' },
  { icon: '💀', title: 'Permadeath', text: 'If your HP hits 0, it\'s over. Manage your resources carefully — potions, skills, and knowing when to flee can save your run.' },
];

export default function Home() {
  const router = useRouter();
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #2a1808 0%, #0e0804 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Title */}
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-game-accent mb-4 text-shadow"
          style={{ 
            fontFamily: 'ByteBounce, sans-serif',
            letterSpacing: '0.05em',
            lineHeight: '1.2'
          }}
          animate={{ scale: [1, 1.04, 1, 1.04, 1] }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          🎲 DICEBOUND 🎲
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
             Start New Game
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/sticker')}
            className="text-xl w-full"
          >
             Create Character Sticker
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => setShowHowToPlay(true)}
            className="text-xl w-full"
          >
             How to Play
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

      {/* How to Play Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowHowToPlay(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              style={{ background: 'rgba(14,10,6,0.97)', border: '1px solid #5a3e28' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-extrabold text-game-gold tracking-widest">📖 HOW TO PLAY</h2>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="text-gray-400 hover:text-white text-2xl leading-none transition-colors"
                  aria-label="Close"
                >×</button>
              </div>
              <div className="flex flex-col gap-4">
                {HOW_TO_PLAY.map((item) => (
                  <div key={item.title} className="flex gap-3 items-start">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-yellow-300 font-bold text-sm">{item.title}</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowHowToPlay(false)}
              className="mt-6 w-full py-2 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'rgba(212,160,48,0.15)', border: '1px solid #5a3e28', color: '#d4a030' }}
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
