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
  upgradeState?: {
    totalCritChanceBonus: number;
    totalCritDamageBonus: number;
  };
}

const STATUS_ICON: Record<string, string> = {
  poison: '🧪', burn: '🔥', cursed: '💀', blessed: '✨', regen: '💚', shield: '🛡️',
};

function HpRing({ percent, health, maxHealth }: { percent: number; health: number; maxHealth: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const color = percent > 50 ? '#4ade80' : percent > 25 ? '#fb923c' : '#ef4444';
  
  return (
    <div className="relative shrink-0 w-14 h-14 sm:w-[70px] sm:h-[70px]">
      {/* Outer stone ring */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, #1a1410 60%, #2a1f14 100%)', border: '2px solid #3d2e1e' }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56">
        {/* Track */}
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(80,50,20,0.5)" strokeWidth="4" />
        {/* Fill */}
        <motion.circle cx="28" cy="28" r={r} fill="none" stroke={color}
          strokeWidth="4" strokeLinecap="round" strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }} transition={{ duration: 0.4 }}
          transform="rotate(-90 28 28)"
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }} />
      </svg>
      {/* HP number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-white font-black text-[10px] sm:text-xs" style={{ fontFamily: 'monospace' }}>{health}</span>
        <span className="text-[7px] sm:text-[9px]" style={{ color: '#8a6a4a' }}>/{maxHealth}</span>
      </div>
    </div>
  );
}

export default function HUD({ player, floor, turnCount, onInventoryClick, playerSpriteUrl, upgradeState }: HUDProps) {
  const [statusExpanded, setStatusExpanded] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const healthPercent = (player.health / player.maxHealth) * 100;
  const manaPercent = player.mana && player.maxMana ? (player.mana / player.maxMana) * 100 : 0;
  const dungeonNum = getDungeonNumber(floor);
  const floorInDungeon = getFloorInDungeon(floor);
  const activeEffects = player.statusEffects.filter(e => e.type !== 'shield');
  const shieldEffect = player.statusEffects.find(e => e.type === 'shield');
  const totalItems = player.inventory.reduce((s, i) => s + i.quantity, 0);
  
  // Calculate crit stats
  const baseCritChance = 0.05; // 5% base
  const totalCritChance = Math.min(0.95, baseCritChance + (upgradeState?.totalCritChanceBonus ?? 0));
  const baseCritDamage = 1.5; // 150% base
  const totalCritDamage = baseCritDamage + (upgradeState?.totalCritDamageBonus ?? 0);

  // Dungeon palette
  const cardBg = 'rgba(14, 10, 6, 0.92)';
  const cardBorder = '#5a3e28';
  const cardBorderHighlight = '#8a5c30';

  return (
    <>
      {/* ── TOP-LEFT: Player card ── */}
      <div className="fixed top-1 sm:top-3 left-1 sm:left-3 z-30 safe-top safe-left w-[160px] sm:w-[220px]">
        <div className="rounded-md sm:rounded-xl p-1.5 sm:p-2.5 backdrop-blur-sm shadow-2xl flex flex-col gap-1 sm:gap-1.5"
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            boxShadow: `0 0 0 1px rgba(255,180,80,0.08), 0 8px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,180,80,0.06)`,
          }}>

          {/* Avatar + class + bars */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <HpRing percent={healthPercent} health={player.health} maxHealth={player.maxHealth} />

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              {/* Class name — engraved look */}
              <span className="font-black text-[9px] sm:text-[11px] uppercase tracking-[0.08em] sm:tracking-[0.12em] truncate"
                style={{ color: '#d4a855', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {player.class}
              </span>

              {/* Mana */}
              {player.mana !== undefined && player.maxMana && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: '#7ba7d4' }}>✨</span>
                    <span className="text-[8px] sm:text-[9px] font-mono" style={{ color: '#7ba7d4' }}>{player.mana}/{player.maxMana}</span>
                  </div>
                  <div className="h-1 sm:h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,20,10,0.8)', border: '1px solid rgba(80,60,30,0.5)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #3b6fa0, #5b9fd4)' }}
                      animate={{ width: `${manaPercent}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </>
              )}

              {/* Shield */}
              {shieldEffect?.value && (() => {
                const maxShield = shieldEffect.value <= 30 ? 30 : 60;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: '#7dd4d4' }}>🛡</span>
                      <span className="text-[8px] sm:text-[9px] font-mono" style={{ color: '#7dd4d4' }}>{shieldEffect.value}</span>
                    </div>
                    <div className="h-1 sm:h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,20,10,0.8)', border: '1px solid rgba(80,60,30,0.5)' }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #2a8a8a, #4dd4d4)' }}
                        animate={{ width: `${Math.min(100, (shieldEffect.value / maxShield) * 100)}%` }}
                        transition={{ duration: 0.3 }} />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Stat pills — stone badge style */}
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <div className="flex gap-1">
              <div className="flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold"
                style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#e8a050' }}>
                ⚔️ {player.attack}
              </div>
              <div className="flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold"
                style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#7ab4d4' }}>
                🛡️ {player.defense}
              </div>
            </div>
            {/* Expandable advanced stats */}
            {!statsExpanded ? (
              <button onClick={() => setStatsExpanded(true)}
                className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors text-left"
                style={{ background: 'rgba(30,15,5,0.7)', border: '1px solid #4a3020', color: '#8a6a4a' }}>
                ⚡ Stats ▾
              </button>
            ) : (
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <button onClick={() => setStatsExpanded(false)}
                  className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors text-left"
                  style={{ background: 'rgba(30,15,5,0.7)', border: '1px solid #4a3020', color: '#8a6a4a' }}>
                  ⚡ Stats ▴
                </button>
                <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
                  {player.armorPen > 0 && (
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold"
                      style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#d4a070' }}>
                      🗡️ {player.armorPen}
                    </div>
                  )}
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold"
                    style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#f0a040' }}>
                    ⚡ {Math.round(totalCritChance * 100)}%
                  </div>
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold"
                    style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#e06060' }}>
                    💥 {Math.round(totalCritDamage * 100)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory button — torch gold */}
          <button onClick={onInventoryClick}
            className="w-full flex items-center justify-center gap-1 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-black transition-all active:scale-95"
            style={{
              background: 'linear-gradient(180deg, #c8860a 0%, #9a6008 100%)',
              border: '1px solid #e8a030',
              color: '#fff8e8',
              boxShadow: '0 2px 8px rgba(200,130,10,0.3), inset 0 1px 0 rgba(255,220,100,0.2)',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}>
            📦 <span className="hidden sm:inline">Inventory</span><span className="sm:hidden">Inv</span>
            {totalItems > 0 && (
              <span className="rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center text-[8px] sm:text-[9px] font-black leading-none"
                style={{ background: '#1a0e04', color: '#e8a030', border: '1px solid #6a4010' }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Status effects */}
          {activeEffects.length > 0 && (
            <div className="mt-0.5">
              {!statusExpanded ? (
                <button onClick={() => setStatusExpanded(true)}
                  className="flex flex-wrap items-center gap-1 text-xs transition-colors"
                  style={{ color: '#8a6a4a' }}>
                  {activeEffects.slice(0, 3).map((e, i) => (
                    <span key={i} className="flex items-center gap-0.5 rounded px-1.5 py-0.5 font-bold"
                      style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#c8a070' }}>
                      {STATUS_ICON[e.type] ?? '⚡'}
                      <span className="text-[9px]" style={{ color: '#f0a040' }}>{e.duration}t</span>
                    </span>
                  ))}
                  {activeEffects.length > 3 && (
                    <span className="text-[10px] px-1" style={{ color: '#6a4a2a' }}>+{activeEffects.length - 3}</span>
                  )}
                  <span className="text-[10px]" style={{ color: '#6a4a2a' }}>▾</span>
                </button>
              ) : (
                <button onClick={() => setStatusExpanded(false)} className="w-full text-left">
                  <div className="flex flex-wrap gap-1">
                    {activeEffects.map((e, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs rounded px-1.5 py-0.5"
                        style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#c8a070' }}>
                        {STATUS_ICON[e.type] ?? '⚡'}
                        <span className="capitalize">{e.type}</span>
                        <span className="font-black text-[10px]" style={{ color: '#f0a040' }}>{e.duration}t</span>
                        {e.value !== undefined && (
                          <span className="text-[9px]" style={{ color: '#ef4444' }}>−{e.value}/t</span>
                        )}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] mt-0.5 block" style={{ color: '#6a4a2a' }}>▴ collapse</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── TOP-RIGHT: Game info card ── */}
      <div className="fixed top-1 sm:top-3 right-1 sm:right-3 z-30 safe-top safe-right">
        <div className="rounded-md sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2.5 backdrop-blur-sm shadow-2xl text-right"
          style={{
            background: cardBg,
            border: `1.5px solid ${cardBorder}`,
            boxShadow: `0 0 0 1px rgba(255,180,80,0.08), 0 8px 32px rgba(0,0,0,0.8)`,
            minWidth: '85px',
          }}>
          <div className="font-black text-[10px] sm:text-xs" style={{ color: '#d4a855', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
            D{dungeonNum} · F{floorInDungeon}
          </div>
          <div className="text-[8px] sm:text-[10px] mt-0.5" style={{ color: '#6a5040' }}>Turn {turnCount}</div>
          <div className="font-bold text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: '#e8c060' }}>
            💰 {player.coins}
          </div>
        </div>
      </div>
    </>
  );
}
