'use client';

import { useState } from 'react';
import { Player } from '@/lib/game-engine';
import { getDungeonNumber, getFloorInDungeon } from '@/lib/game-engine/constants';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HUDProps {
  player: Player;
  floor: number;
  turnCount: number;
  onInventoryClick: () => void;
  playerSpriteUrl?: string;
}

const STATUS_ICON: Record<string, string> = {
  poison: '🧪', burn: '🔥', cursed: '💀', blessed: '✨', regen: '💚', shield: '🛡️',
};

function HpRing({ percent, health, maxHealth }: { percent: number; health: number; maxHealth: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const color = percent > 50 ? '#22c55e' : percent > 25 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-[72px] h-[72px] shrink-0">
      <svg width="72" height="72" className="absolute inset-0">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <motion.circle cx="36" cy="36" r={r} fill="none" stroke={color}
          strokeWidth="5" strokeLinecap="round" strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }} transition={{ duration: 0.4 }}
          transform="rotate(-90 36 36)" />
      </svg>
      {/* HP number inside ring */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-white font-black text-[11px]">{health}</span>
        <span className="text-white/40 text-[9px]">/{maxHealth}</span>
      </div>
    </div>
  );
}

export default function HUD({ player, floor, turnCount, onInventoryClick, playerSpriteUrl }: HUDProps) {
  const [statusExpanded, setStatusExpanded] = useState(false);
  const healthPercent = (player.health / player.maxHealth) * 100;
  const manaPercent = player.mana && player.maxMana ? (player.mana / player.maxMana) * 100 : 0;
  const dungeonNum = getDungeonNumber(floor);
  const floorInDungeon = getFloorInDungeon(floor);
  const activeEffects = player.statusEffects.filter(e => e.type !== 'shield');
  const shieldEffect = player.statusEffects.find(e => e.type === 'shield');
  const totalItems = player.inventory.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {/* ── TOP-LEFT: Player card ── */}
      <div className="fixed top-3 left-3 z-30 flex flex-col gap-1.5" style={{ minWidth: 190 }}>
        <div className="bg-black/70 border border-cyan-500/40 rounded-xl p-2.5 backdrop-blur-sm shadow-xl">

          {/* Avatar row */}
          <div className="flex items-center gap-2.5">
            <HpRing percent={healthPercent} health={player.health} maxHealth={player.maxHealth} />

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              {/* Class name */}
              <span className="text-white font-black text-xs uppercase tracking-wider truncate">
                {player.class}
              </span>

              {/* Mana */}
              {player.mana !== undefined && player.maxMana && (
                <>
                  <span className="text-blue-400 text-xs font-bold">
                    ✨ {player.mana}/{player.maxMana}
                  </span>
                  <div className="h-1.5 bg-black/50 rounded-full overflow-hidden w-full">
                    <motion.div className="h-full bg-blue-500 rounded-full"
                      animate={{ width: `${manaPercent}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </>
              )}

              {/* Shield bar */}
              {shieldEffect?.value && (() => {
                const maxShield = shieldEffect.value <= 30 ? 30 : 60;
                return (
                  <>
                    <span className="text-cyan-300 text-xs font-bold">🛡 {shieldEffect.value}</span>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden w-full">
                      <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                        animate={{ width: `${Math.min(100, (shieldEffect.value / maxShield) * 100)}%` }}
                        transition={{ duration: 0.3 }} />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Stat pills */}
          <div className="flex gap-1.5 mt-2 items-center">
            <span className="bg-black/50 border border-white/10 rounded-lg px-2 py-0.5 text-xs font-bold text-orange-300">⚔️ {player.attack}</span>
            <span className="bg-black/50 border border-white/10 rounded-lg px-2 py-0.5 text-xs font-bold text-blue-300">🛡️ {player.defense}</span>
          </div>

          {/* Inventory button — own row */}
          <button
            onClick={onInventoryClick}
            className="mt-1.5 w-full bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-2 py-1 text-xs font-bold text-yellow-300 hover:bg-yellow-500/30 hover:border-yellow-400 transition-colors flex items-center justify-center gap-1.5"
          >
            📦 Inventory
            {totalItems > 0 && (
              <span className="bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black leading-none">
                {totalItems}
              </span>
            )}
          </button>

          {/* Status effects — collapsed behind count badge, expand on click */}
          {activeEffects.length > 0 && (
            <div className="mt-1.5">
              {!statusExpanded ? (
                <button
                  onClick={() => setStatusExpanded(true)}
                  className="flex items-center gap-1 text-xs text-white/60 hover:text-white/90 transition-colors"
                >
                  {activeEffects.slice(0, 3).map((e, i) => (
                    <span key={i}>{STATUS_ICON[e.type] ?? '⚡'}</span>
                  ))}
                  {activeEffects.length > 3 && <span className="text-[10px]">+{activeEffects.length - 3}</span>}
                  <span className="text-[10px] text-white/40 ml-0.5">▾</span>
                </button>
              ) : (
                <button onClick={() => setStatusExpanded(false)} className="w-full text-left">
                  <div className="flex flex-wrap gap-1">
                    {activeEffects.map((e, i) => (
                      <span key={i} className="text-xs bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-white/70">
                        {STATUS_ICON[e.type] ?? '⚡'} {e.type} {e.duration}t
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/40 mt-0.5 block">▴ collapse</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── TOP-RIGHT: Game info card ── */}
      <div className="fixed top-3 right-3 z-30">
        <div className="bg-black/70 border border-cyan-500/40 rounded-xl px-4 py-3 backdrop-blur-sm shadow-xl text-right min-w-[130px]">
          <div className="text-game-gold font-black text-sm">D{dungeonNum} · F{floorInDungeon}</div>
          <div className="text-gray-400 text-xs mt-0.5">Turn {turnCount}</div>
          <div className="text-yellow-300 font-bold text-sm mt-1.5">💰 {player.coins}</div>
        </div>
      </div>
    </>
  );
}
