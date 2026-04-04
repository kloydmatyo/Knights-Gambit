'use client';

import { Player } from '@/lib/game-engine';
import { getDungeonNumber, getFloorInDungeon } from '@/lib/game-engine/constants';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HUDProps {
  player: Player;
  floor: number;
  turnCount: number;
  onInventoryClick: () => void;
}

export default function HUD({ player, floor, turnCount, onInventoryClick }: HUDProps) {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const manaPercent = player.mana && player.maxMana ? (player.mana / player.maxMana) * 100 : 0;
  const dungeonNum = getDungeonNumber(floor);
  const floorInDungeon = getFloorInDungeon(floor);

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-game-primary bg-opacity-98 border-b-2 border-game-secondary shadow-2xl backdrop-blur-sm">
      <div className="container mx-auto px-2 sm:px-4 py-1.5 sm:py-4">
        {/* Mobile Compact Layout */}
        <div className="md:hidden">
          {/* Top Row: HP/MP Bars */}
          <div className="flex flex-col gap-1.5 mb-1.5">
            {/* Health Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-game-health font-bold flex items-center gap-1">
                  ❤️ HP
                </span>
                <span className="text-white font-bold text-xs">
                  {player.health}/{player.maxHealth}
                </span>
              </div>
              <div className="h-3 bg-game-bg rounded-full overflow-hidden border border-gray-700">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    healthPercent > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Mana Bar (if applicable) */}
            {player.mana !== undefined && player.maxMana && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-game-mana font-bold flex items-center gap-1">
                    ✨ MP
                  </span>
                  <span className="text-white font-bold text-xs">
                    {player.mana}/{player.maxMana}
                  </span>
                </div>
                <div className="h-3 bg-game-bg rounded-full overflow-hidden border border-gray-700">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${manaPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row: Stats & Inventory */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <div className="stat-display bg-game-bg px-2 py-1 rounded border border-gray-700 flex items-center gap-1">
                <span className="text-base">⚔️</span>
                <span className="font-bold text-sm">{player.attack}</span>
              </div>
              <div className="stat-display bg-game-bg px-2 py-1 rounded border border-gray-700 flex items-center gap-1">
                <span className="text-base">🛡️</span>
                <span className="font-bold text-sm">{player.defense}</span>
              </div>
              <div className="stat-display bg-game-bg px-2 py-1 rounded border border-gray-700 flex items-center gap-1">
                <span className="text-base">💰</span>
                <span className="font-bold text-sm">{player.coins}</span>
              </div>
            </div>

            <button
              onClick={onInventoryClick}
              className="btn-secondary text-xs px-3 py-2 font-bold whitespace-nowrap"
            >
              📦 ({player.inventory.length})
            </button>
          </div>

          {/* Floor & Turn */}
          <div className="flex justify-center gap-4 mt-1.5 text-xs bg-game-bg px-3 py-1 rounded border border-gray-700">
            <span className="text-game-gold font-bold">D{dungeonNum} · F{floorInDungeon}</span>
            <span className="text-gray-400">Turn {turnCount}</span>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-wrap items-center justify-between gap-4">
          {/* Left: Player Stats */}
          <div className="flex flex-col gap-3 min-w-[220px]">
            {/* Health Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-game-health font-bold flex items-center gap-1">
                  ❤️ HP
                </span>
                <span className="text-white font-bold">
                  {player.health}/{player.maxHealth}
                </span>
              </div>
              <div className="h-4 bg-game-bg rounded-full overflow-hidden border border-gray-700">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    healthPercent > 50 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-500'
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${healthPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Mana Bar (if applicable) */}
            {player.mana !== undefined && player.maxMana && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-game-mana font-bold flex items-center gap-1">
                    ✨ MP
                  </span>
                  <span className="text-white font-bold">
                    {player.mana}/{player.maxMana}
                  </span>
                </div>
                <div className="h-4 bg-game-bg rounded-full overflow-hidden border border-gray-700">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${manaPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Center: Stats */}
          <div className="flex gap-6 md:gap-8 flex-wrap">
            <div className="stat-display bg-game-bg px-4 py-2 rounded-lg border border-gray-700">
              <span className="text-game-attack text-xl">⚔️</span>
              <span className="font-bold text-lg">{player.attack}</span>
            </div>
            <div className="stat-display bg-game-bg px-4 py-2 rounded-lg border border-gray-700">
              <span className="text-game-defense text-xl">🛡️</span>
              <span className="font-bold text-lg">{player.defense}</span>
            </div>
            <div className="stat-display bg-game-bg px-4 py-2 rounded-lg border border-gray-700">
              <span className="text-game-gold text-xl">💰</span>
              <span className="font-bold text-lg">{player.coins}</span>
            </div>
          </div>

          {/* Right: Game Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right bg-game-bg px-4 py-2 rounded-lg border border-gray-700">
              <div className="text-game-gold font-bold text-lg">Dungeon {dungeonNum} · Floor {floorInDungeon}</div>
              <div className="text-gray-400 text-sm">Turn {turnCount}</div>
            </div>

            <button
              onClick={onInventoryClick}
              className="btn-secondary text-base px-6 py-3 font-bold"
            >
              📦 Inventory ({player.inventory.length})
            </button>
          </div>
        </div>

        {/* Status Effects */}
        {player.statusEffects.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap justify-center">
            {player.statusEffects.map((effect, index) => (
              <motion.div
                key={`${effect.type}-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-game-secondary rounded-lg text-xs sm:text-sm font-bold border border-gray-600"
              >
                {effect.type === 'poison' && '🧪 Poisoned'}
                {effect.type === 'burn' && '🔥 Burning'}
                {effect.type === 'blessed' && '✨ Blessed'}
                {effect.type === 'shield' && '🛡️ Shielded'}
                {effect.type === 'regen' && '💚 Regenerating'}
                {effect.type === 'cursed' && '💀 Cursed'}
                <span className="ml-1 sm:ml-1.5 text-gray-400">({effect.duration})</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
