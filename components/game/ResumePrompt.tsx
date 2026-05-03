'use client';

import { motion } from 'framer-motion';
import { SaveData, SaveEngine } from '@/lib/game-engine/SaveEngine';

interface ResumePromptProps {
  saves: SaveData[];
  onResume: (save: SaveData) => void;
  onNewGame: (slot: number) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ResumePrompt({ saves, onResume, onNewGame }: ResumePromptProps) {
  const filledSlots = saves.map(s => s.slot);
  const emptySlots = Array.from({ length: SaveEngine.MAX_SLOTS }, (_, i) => i)
    .filter(i => !filledSlots.includes(i));

  return (
    <div className="min-h-screen w-full bg-game-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-game-primary border-2 border-yellow-500 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-white font-black text-xl mb-1 text-center">Save Slots</h2>
        <p className="text-gray-400 text-sm mb-5 text-center">Choose a slot to continue or start fresh</p>

        <div className="flex flex-col gap-3">
          {/* Filled slots */}
          {saves.map(save => (
            <motion.button
              key={save.slot}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onResume(save)}
              className="w-full bg-game-bg border-2 border-game-gold rounded-xl px-4 py-3 text-left hover:border-yellow-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold text-sm">
                    Slot {save.slot + 1} — {save.playerName}
                  </div>
                  <div className="text-game-gold text-xs mt-0.5">
                    Floor {save.gameState.currentFloor} · {save.gameState.player.class}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {save.gameState.player.health}/{save.gameState.player.maxHealth} HP · {save.gameState.player.coins} coins
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">{timeAgo(save.savedAt)}</span>
                  <span className="text-xs bg-game-gold text-black font-bold px-2 py-0.5 rounded"> Resume</span>
                </div>
              </div>
            </motion.button>
          ))}

          {/* Empty slots */}
          {emptySlots.map(slot => (
            <motion.button
              key={slot}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNewGame(slot)}
              className="w-full bg-game-bg border-2 border-dashed border-gray-600 rounded-xl px-4 py-3 text-left hover:border-gray-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 font-bold text-sm">Slot {slot + 1} — Empty</div>
                  <div className="text-gray-600 text-xs mt-0.5">Start a new adventure</div>
                </div>
                <span className="text-xs bg-gray-700 text-gray-300 font-bold px-2 py-0.5 rounded">+ New</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
