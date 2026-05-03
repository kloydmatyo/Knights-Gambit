'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Player, Enemy } from '@/lib/game-engine';
import { motion, AnimatePresence } from 'framer-motion';
import { ENEMY_SPRITES } from '@/lib/game-engine/constants';
import SpriteAnimator from '@/components/game/SpriteAnimator';
import { cn } from '@/lib/utils';
import { extractAnimationStrip, FRAME_SIZE } from '@/components/game/LPCCharacterCreator/LPCRenderer';

// ── Skill button with tooltip ──────────────────────────────────────────────
function SkillButton({ skill, disabled, onClick }: {
  skill: import('@/lib/game-engine').Skill;
  disabled: boolean;
  onClick: () => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 300); // Show tooltip after 300ms press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    // Keep tooltip visible for a moment after release
    if (showTooltip) {
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  const handleClick = () => {
    if (showTooltip) {
      // If tooltip is showing, hide it and don't trigger action
      setShowTooltip(false);
    } else {
      // Otherwise trigger the action
      onClick();
    }
  };

  return (
    <div className="relative" 
      onMouseEnter={() => setShowTooltip(true)} 
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {showTooltip && <SkillTooltip skill={skill} />}
      <button
        onClick={handleClick}
        disabled={disabled}
        className="w-full py-2 px-3 rounded-lg font-bold text-xs bg-yellow-600/20 hover:bg-yellow-500/30 border border-yellow-400/30 disabled:opacity-40 text-white transition-all active:scale-95 truncate"
      >
        {skill.name}
        {skill.currentCooldown > 0 && <span className="ml-1 text-red-400">({skill.currentCooldown})</span>}
      </button>
    </div>
  );
}

export type EnemyAnimState = 'Idle' | 'Hurt' | 'Attack' | 'Death';

// Player attack animations per class
function getPlayerAttackAnimation(characterClass: string) {
  switch (characterClass) {
    case 'knight':
    case 'barbarian':
      // Melee: lunge forward
      return {
        x: [0, 80, 80, 0],
        y: [0, -10, -10, 0],
        scale: [1, 1.1, 1.1, 1],
      };
    case 'archer':
      // Ranged: slight recoil
      return {
        x: [0, -15, 0],
        scale: [1, 0.95, 1],
      };
    case 'mage':
      // Magic: float and glow
      return {
        y: [0, -20, -20, 0],
        scale: [1, 1.05, 1.05, 1],
        filter: ['brightness(1)', 'brightness(1.5) saturate(1.3)', 'brightness(1.5) saturate(1.3)', 'brightness(1)'],
      };
    case 'assassin':
      // Quick dash
      return {
        x: [0, 100, 100, 0],
        y: [0, -5, -5, 0],
        opacity: [1, 0.7, 0.7, 1],
      };
    case 'cleric':
      // Holy strike: rise and shine
      return {
        y: [0, -15, -15, 0],
        scale: [1, 1.08, 1.08, 1],
        filter: ['brightness(1)', 'brightness(1.8) saturate(0.8)', 'brightness(1.8) saturate(0.8)', 'brightness(1)'],
      };
    default:
      // Default: simple forward motion
      return {
        x: [0, 60, 60, 0],
      };
  }
}

type ActionMenu = 'main' | 'fight';
function SkillTooltip({ skill }: { skill: import('@/lib/game-engine').Skill }) {
  const effectLabel = () => {
    switch (skill.effect.type) {
      case 'damage': return `Deals ${skill.effect.value ? `${Math.round(skill.effect.value * 100)}%` : '100%'} ATK damage`;
      case 'heal':   return `Restores ${skill.effect.value ?? 0} HP`;
      case 'buff':   return `Buffs ${skill.effect.target ?? 'self'} for ${skill.effect.duration ?? 1} turns`;
      case 'debuff': return `Debuffs enemy for ${skill.effect.duration ?? 1} turns`;
      case 'special': return `Special: ${skill.effect.value ? `${Math.round(skill.effect.value * 100)}%` : '150%'} ATK`;
      default: return skill.effect.type;
    }
  };

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none w-48">
      <div className="bg-[#0a0e1a] border border-yellow-400/40 rounded-xl px-3 py-2.5 shadow-2xl text-left"
        style={{ background: 'rgba(14,10,6,0.97)', border: '1px solid #5a3e28' }}>
        <p className="text-yellow-300 font-black text-sm mb-1">{skill.name}</p>
        <p className="text-gray-300 text-xs leading-relaxed mb-2">{skill.description}</p>
        <div className="space-y-0.5 border-t border-white/10 pt-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Effect</span>
            <span className="text-white font-medium">{effectLabel()}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Type</span>
            <span className="text-white font-medium capitalize">{skill.effect.type}</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Cooldown</span>
            <span className="text-white font-medium">{skill.cooldown === 0 ? 'None' : `${skill.cooldown} turns`}</span>
          </div>
          {skill.currentCooldown > 0 && (
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Ready in</span>
              <span className="text-red-400 font-bold">{skill.currentCooldown} turn{skill.currentCooldown !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {/* Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
          style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid rgba(234,179,8,0.4)' }} />
      </div>
    </div>
  );
}

function EnemySprite({ enemy, animState }: { enemy: Enemy; animState: EnemyAnimState }) {
  const sprite = ENEMY_SPRITES[enemy.type];
  if (!sprite) return <div className="text-7xl drop-shadow-lg select-none">👹</div>;
  const frameCount = sprite.frames[animState] ?? sprite.frames['Idle'] ?? 3;
  const fps = animState === 'Idle' ? 4 : 8;
  const frameW = typeof sprite.frameW === 'object' ? (sprite.frameW[animState] ?? 58) : sprite.frameW;
  const frameH = typeof sprite.frameH === 'object' ? (sprite.frameH[animState] ?? 60) : (sprite.frameH ?? 60);
  return (
    <SpriteAnimator sheet={sprite.sheet(animState)} frameW={frameW} frameH={frameH}
      frameCount={frameCount} fps={fps} loop={animState !== 'Death'} scale={4}
      className="drop-shadow-[0_0_16px_rgba(255,80,80,0.7)]" />
  );
}

function HealthBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-bold mb-1">
        <span className="text-white/60 uppercase tracking-widest">HP</span>
        <span className="text-white font-mono">{current}<span className="text-white/40">/{max}</span></span>
      </div>
      <div className="h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
        <motion.div className={`h-full rounded-full ${color}`}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
    </div>
  );
}

interface CombatUIProps {
  player: Player;
  enemy: Enemy;
  onAttack: () => void;
  onUseSkill: (skillId: string) => void;
  onFlee?: () => void;
  onBribe?: () => void;
  onTruce?: () => void;
  onOpenInventory?: () => void;
  bribeCost?: number;
  combatLog: string[];
  isPlayerTurn: boolean;
  enemyAnimState?: EnemyAnimState;
  playerHurt?: boolean;
  playerAttacking?: boolean;
  playerSpriteUrl?: string;
  activeCombatDestiny?: string | null;
  combatAtkMultiplier?: number | null;
}

export default function CombatUI({
  player, enemy, onAttack, onUseSkill, onFlee, onBribe, onTruce,
  onOpenInventory, bribeCost, combatLog, isPlayerTurn,
  enemyAnimState = 'Idle', playerHurt = false, playerAttacking = false, playerSpriteUrl, activeCombatDestiny, combatAtkMultiplier,
}: CombatUIProps) {
  const [menu, setMenu] = useState<ActionMenu>('main');
  const isAnimating = enemyAnimState !== 'Idle';
  const actionsDisabled = !isPlayerTurn || isAnimating;
  const activeSkills = player.skills.filter(s => s.type === 'active');
  const promptText = combatLog.length > 0 ? combatLog[combatLog.length - 1] : `What will ${player.class} do?`;
  const logRef = useRef<HTMLDivElement>(null);
  // Track initial shield value for the bar percentage
  const initialShieldRef = useRef<number | null>(null);
  const enemyIdRef = useRef<string | null>(null);
  if (enemy.id !== enemyIdRef.current) {
    // New enemy — reset shield tracking
    enemyIdRef.current = enemy.id;
    initialShieldRef.current = null;
  }
  const shieldEffect = enemy.statusEffects.find(e => e.type === 'shield');
  if (shieldEffect?.value && initialShieldRef.current === null) {
    initialShieldRef.current = shieldEffect.value;
  }

  // Extract animations for combat
  const [slashStripUrl, setSlashStripUrl] = useState<string | null>(null);
  const [attackStripUrl, setAttackStripUrl] = useState<string | null>(null);
  const isMeleeClass = player.class === 'knight' || player.class === 'barbarian' || player.class === 'assassin';
  const fullSheetUrl = (player as any).fullSheetUrl;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [combatLog]);

  // Memoize animation config to prevent unnecessary re-renders
  const playerAnimation = useMemo(() => {
    if (playerHurt) {
      return { x: [-8, 8, -5, 5, 0], filter: ['brightness(1.5) saturate(2) hue-rotate(-20deg)', 'brightness(1) saturate(1)'] };
    }
    if (playerAttacking) {
      return getPlayerAttackAnimation(player.class);
    }
    return {};
  }, [playerHurt, playerAttacking, player.class]);

  useEffect(() => {
    if (fullSheetUrl) {
      // Extract class-specific attack animations
      if (isMeleeClass) {
        // Melee: slash animation (6 frames)
        extractAnimationStrip(fullSheetUrl, 'slash', 2, 6).then(setSlashStripUrl);
      } else if (player.class === 'archer') {
        // Archer: shoot animation (13 frames)
        extractAnimationStrip(fullSheetUrl, 'shoot', 2, 13).then(setAttackStripUrl);
      } else if (player.class === 'mage') {
        // Mage: spellcast animation (7 frames)
        extractAnimationStrip(fullSheetUrl, 'spellcast', 2, 7).then(setAttackStripUrl);
      } else if (player.class === 'cleric') {
        // Cleric: thrust animation (8 frames)
        extractAnimationStrip(fullSheetUrl, 'thrust', 2, 8).then(setAttackStripUrl);
      }
    }
  }, [isMeleeClass, player.class, fullSheetUrl]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-1 sm:p-2" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="relative w-full max-w-6xl rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_12px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[95vh]"
      >
        {/* ── STAGE ── */}
        <div className="relative w-full overflow-hidden" style={{ height: 'clamp(280px, 50vh, 520px)' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'url(/background/arena_bg2.png)', backgroundSize: 'cover', backgroundPosition: 'center 40%' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

          {/* Player HP — above player sprite */}
          <div className="absolute z-10 w-36 sm:w-52 bg-black/70 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-white/10"
            style={{ left: '29%', bottom: 'calc(18% + 100px)', transform: 'translateX(-50%)' }}>
            <div className="flex items-start justify-between mb-0.5 sm:mb-1">
              <p className="text-yellow-300 font-extrabold text-[9px] sm:text-xs tracking-widest leading-tight">{player.class.toUpperCase()}</p>
              {combatAtkMultiplier && combatAtkMultiplier !== 1 && (() => {
                const pct = Math.round((combatAtkMultiplier - 1) * 100);
                const isUp = pct > 0;
                return (
                  <span className="shrink-0 ml-1 text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded leading-none"
                    style={{ background: isUp ? 'rgba(120,80,0,0.6)' : 'rgba(120,0,0,0.6)', border: `1px solid ${isUp ? '#f59e0b' : '#f87171'}`, color: isUp ? '#fde68a' : '#fca5a5' }}>
                    ⚔️{isUp ? `+${pct}%` : `${pct}%`}
                  </span>
                );
              })()}
            </div>
            <HealthBar current={player.health} max={player.maxHealth} color="bg-emerald-500" />
            {/* Shield bar */}
            {(() => {
              const shield = player.statusEffects.find(e => e.type === 'shield');
              if (!shield?.value) return null;
              const maxShield = shield.value <= 30 ? 30 : 60;
              return (
                <div className="mt-1 sm:mt-1.5">
                  <div className="flex justify-between text-[8px] sm:text-[10px] font-bold mb-0.5">
                    <span className="text-cyan-300 uppercase tracking-widest">🛡 Shield</span>
                    <span className="text-cyan-200 font-mono">{shield.value}</span>
                  </div>
                  <div className="h-1.5 sm:h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                      animate={{ width: `${Math.min(100, (shield.value / maxShield) * 100)}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                  </div>
                </div>
              );
            })()}
            {player.class === 'mage' && player.maxMana !== undefined && (
              <div className="mt-0.5 sm:mt-1">
                <div className="flex justify-between text-[8px] sm:text-[10px] font-bold mb-0.5">
                  <span className="text-blue-300/60 uppercase tracking-widest">MP</span>
                  <span className="text-blue-200 font-mono">{player.mana ?? 0}/{player.maxMana}</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <motion.div className="h-full rounded-full bg-blue-500"
                    animate={{ width: `${Math.max(0, ((player.mana ?? 0) / player.maxMana) * 100)}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
              </div>
            )}
            {player.statusEffects.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {player.statusEffects.map((e, i) => (
                  <span key={i} className="text-[9px] bg-black/40 border border-white/15 rounded px-1 py-0.5 text-white/70">
                    {e.type === 'burn' ? '�' : e.type === 'poison' ? '🧪' : e.type === 'cursed' ? '�💀' : e.type === 'blessed' ? '✨' : '⚡'} {e.type} {e.duration}t
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Enemy HP — above enemy sprite */}
          <div className="absolute z-10 w-36 sm:w-52 bg-black/70 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-white/10"
            style={{ left: '72%', bottom: 'calc(30% + 90px)', transform: 'translateX(-50%)' }}>
            <div className="flex items-start justify-between mb-0.5 sm:mb-1">
              <p className="text-red-400 font-extrabold text-[9px] sm:text-xs tracking-widest leading-tight truncate">{enemy.name.toUpperCase()}</p>
              {enemy.baseAttack && enemy.attack !== enemy.baseAttack && (() => {
                const diff = enemy.attack - enemy.baseAttack;
                const pct = Math.round((diff / enemy.baseAttack) * 100);
                const isUp = diff > 0;
                return (
                  <span className="shrink-0 ml-1 text-[8px] sm:text-[9px] font-black px-1 py-0.5 rounded leading-none"
                    style={{ background: isUp ? 'rgba(180,30,30,0.6)' : 'rgba(30,120,30,0.6)', border: `1px solid ${isUp ? '#f87171' : '#4ade80'}`, color: isUp ? '#fca5a5' : '#86efac' }}>
                    ⚔️{isUp ? `+${pct}%` : `${pct}%`}
                  </span>
                );
              })()}
            </div>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-[8px] text-yellow-400/60 mb-0.5">atk:{enemy.attack} base:{enemy.baseAttack ?? '?'}</p>
            )}
            <HealthBar current={enemy.health} max={enemy.maxHealth} color="bg-red-500" />
            {/* Shield bar */}
            {shieldEffect?.value ? (
              <div className="mt-1 sm:mt-1.5">
                <div className="flex justify-between text-[8px] sm:text-[10px] font-bold mb-0.5">
                  <span className="text-cyan-300 uppercase tracking-widest">🛡 Shield</span>
                  <span className="text-cyan-200 font-mono">{shieldEffect.value}</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-500/30">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                    animate={{ width: `${Math.min(100, (shieldEffect.value / (initialShieldRef.current ?? shieldEffect.value)) * 100)}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                </div>
              </div>
            ) : null}
            {/* Other status effects (excluding shield) */}
            {enemy.statusEffects.filter(e => e.type !== 'shield').length > 0 && (
              <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1 sm:mt-1.5">
                {enemy.statusEffects.filter(e => e.type !== 'shield').map((e, i) => (
                  <span key={i} className="text-[7px] sm:text-[9px] rounded px-1 sm:px-1.5 py-0.5"
                    style={{ background: 'rgba(30,15,5,0.9)', border: '1px solid #4a3020', color: '#c8a070' }}>
                    {e.type === 'poison' ? '🧪' : e.type === 'burn' ? '🔥' : e.type === 'cursed' ? '💀' : '⚡'}
                    {' '}{e.type}{e.duration < 999 ? ` ${e.duration}t` : ''}{e.value ? ` (${e.value})` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Player sprite — bottom left */}
          <div className="absolute z-10 flex flex-col items-center" style={{ left: '29%', bottom: '24%', transform: 'translateX(-50%)' }}>
            <motion.div
              animate={playerAnimation}
              transition={{ duration: playerHurt ? 0.35 : 0.5 }}
              className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] select-none"
              style={{ opacity: playerAttacking ? 0 : 1 }}
            >
              {playerSpriteUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={playerSpriteUrl} alt="player" className="w-20 h-20 sm:w-32 md:w-40" style={{ imageRendering: 'pixelated', objectFit: 'contain' }} />
              ) : (
                <span className="text-5xl sm:text-7xl md:text-9xl">🛡️</span>
              )}
            </motion.div>
          </div>

          {/* Attack animation sprite - melee slash */}
          <AnimatePresence>
            {playerAttacking && isMeleeClass && slashStripUrl && (
              <motion.div
                key="slash-sprite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute pointer-events-none z-20"
                style={{ 
                  left: '29%', 
                  bottom: '24%',
                  transform: 'translateX(-50%)',
                }}
              >
                <SpriteAnimator
                  sheet={slashStripUrl}
                  frameW={FRAME_SIZE}
                  frameH={FRAME_SIZE}
                  frameCount={6}
                  fps={12}
                  loop={false}
                  scale={1.5}
                  className="drop-shadow-[0_0_16px_rgba(255,255,255,0.6)] sm:scale-[2] md:scale-[2.5]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attack animation sprite - ranged/magic */}
          <AnimatePresence>
            {playerAttacking && !isMeleeClass && attackStripUrl && (
              <motion.div
                key="attack-sprite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute pointer-events-none z-20"
                style={{ 
                  left: '29%', 
                  bottom: '24%',
                  transform: 'translateX(-50%)',
                }}
              >
                <SpriteAnimator
                  sheet={attackStripUrl}
                  frameW={FRAME_SIZE}
                  frameH={FRAME_SIZE}
                  frameCount={player.class === 'archer' ? 13 : player.class === 'mage' ? 7 : 8}
                  fps={12}
                  loop={false}
                  scale={1.5}
                  className="drop-shadow-[0_0_16px_rgba(255,255,255,0.6)] sm:scale-[2] md:scale-[2.5]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enemy sprite — top right */}
          <div className="absolute z-10 flex flex-col items-center scale-75 sm:scale-100" style={{ left: '72%', bottom: '9%', transform: 'translateX(-50%)' }}>
            <EnemySprite enemy={enemy} animState={enemyAnimState} />
          </div>
        </div>

        {/* ── BOTTOM PANEL: Pokémon-style ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ minHeight: 'auto', background: '#140e06', borderTop: '3px solid #5a3e28' }}>

          {/* Left: prompt box */}
          <div className="px-3 sm:px-5 py-2 sm:py-4 flex flex-col gap-1 sm:gap-2" style={{ minHeight: 'auto', borderRight: '0 sm:1px solid #3d2a14' }}>
            <div ref={logRef} className="flex-1 overflow-y-auto space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-28" style={{ scrollbarWidth: 'thin' }}>
              {combatLog.map((msg, i) => (
                <p key={i} className={cn('text-xs sm:text-sm leading-snug',
                  i === combatLog.length - 1 ? 'text-white font-bold' : 'text-white/50'
                )}>
                  {i !== combatLog.length - 1 && <span className="mr-1">›</span>}{msg}
                </p>
              ))}
            </div>
          </div>

          {/* Right: action grid */}
          <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center">
            <AnimatePresence mode="wait">
              {menu === 'main' && (
                <motion.div key="main" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
                  <button onClick={() => activeSkills.length > 0 ? setMenu('fight') : onAttack()}
                    disabled={actionsDisabled}
                    className="py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-sm sm:text-base disabled:opacity-40 text-white transition-all active:scale-95 relative"
                    style={{ background: 'linear-gradient(180deg,#8b2020,#5a1010)', border: '1px solid #c04040', borderBottom: '4px solid #3a0808' }}>
                    ⚔️ FIGHT
                    {activeSkills.length > 0 && (
                      <span className="absolute top-1 sm:top-1.5 right-1.5 sm:right-2 text-[9px] sm:text-[10px] rounded-full px-1 sm:px-1.5 py-0.5 font-bold opacity-80"
                        style={{ background: '#3a0808', color: '#e08080' }}>
                        {activeSkills.length} skills ▾
                      </span>
                    )}
                  </button>
                  <button onClick={onOpenInventory} disabled={!onOpenInventory}
                    className="py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-sm sm:text-base disabled:opacity-40 text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(180deg,#c8860a,#9a6008)', border: '1px solid #e8a030', borderBottom: '4px solid #5a3a00', color: '#fff8e8' }}>
                    🎒 BAG{player.inventory.length > 0 ? ` (${player.inventory.length})` : ''}
                  </button>
                  <button
                    onClick={() => { if (onBribe) onBribe(); else if (onTruce) onTruce(); }}
                    disabled={actionsDisabled || (!onBribe && !onTruce)}
                    className="py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-sm sm:text-base disabled:opacity-30 text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(180deg,#2a6a30,#1a4a20)', border: '1px solid #4a9a50', borderBottom: '4px solid #0a2a10' }}>
                    {onBribe ? `💰 BRIBE${bribeCost ? ` (${bribeCost}g)` : ''}` : onTruce ? '🤝 TRUCE' : '💬 TALK'}
                  </button>
                  <button onClick={onFlee} disabled={actionsDisabled || !onFlee}
                    className="py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black text-sm sm:text-base disabled:opacity-30 text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(180deg,#4a3a2a,#2a2018)', border: '1px solid #6a5a4a', borderBottom: '4px solid #1a1008' }}>
                    🏃 RUN
                  </button>
                </motion.div>
              )}

              {menu === 'fight' && (
                <motion.div key="fight" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="w-full flex flex-col gap-1.5 sm:gap-2">
                  {/* Mobile hint */}
                  <div className="sm:hidden text-[9px] text-gray-500 text-center pb-0.5">
                    💡 Long-press skills to see details
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <button onClick={() => { onAttack(); setMenu('main'); }} disabled={actionsDisabled}
                      className="py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg font-bold text-xs bg-red-600/80 hover:bg-red-500 disabled:opacity-40 text-white border border-red-400/40 transition-all active:scale-95">
                      ⚔️ Attack
                    </button>
                    {activeSkills.map(skill => (
                      <SkillButton
                        key={skill.id}
                        skill={skill}
                        disabled={actionsDisabled || skill.currentCooldown > 0}
                        onClick={() => { onUseSkill(skill.id); setMenu('main'); }}
                      />
                    ))}
                  </div>
                  <button onClick={() => setMenu('main')} className="text-xs text-gray-400 hover:text-white text-left pl-1 transition-colors">
                    ← Back
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
