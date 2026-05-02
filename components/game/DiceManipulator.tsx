'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BranchChoice, DestinyResult } from '@/lib/game-engine/types';
import { BoardTile } from '@/lib/game-engine/types';

interface DiceManipulatorProps {
  branchChoice: BranchChoice;
  board: BoardTile[];
  /** Called when player picks a tile (before 2d6 roll) */
  onSelectTile: (tileId: number) => void;
  /** Called after 2d6 is shown and player confirms to proceed */
  onConfirmDestiny?: () => void;
  /** Called when hovering a tile option (null = unhovered) */
  onHoverTile?: (tileId: number | null) => void;
}

const TILE_LABELS: Record<string, string> = {
  start: 'Start', normal: 'Safe', enemy: 'Enemy', elite: 'Elite',
  shop: 'Shop', event: 'Event', boss: 'Boss', trap: 'Trap',
};

const TILE_EMOJI: Record<string, string> = {
  start: '🏁', normal: '⬜', enemy: '👹', elite: '💀',
  shop: '🏪', event: '❓', boss: '☠️', trap: '⚠️',
};

const TILE_BG: Record<string, string> = {
  start: 'bg-green-700 border-green-400',
  normal: 'bg-gray-600 border-gray-400',
  enemy: 'bg-red-700 border-red-400',
  elite: 'bg-purple-700 border-purple-400',
  shop: 'bg-yellow-600 border-yellow-300',
  event: 'bg-blue-700 border-blue-400',
  boss: 'bg-red-900 border-red-500',
  trap: 'bg-orange-700 border-orange-400',
};

const DESTINY_BG: Record<string, string> = {
  cursed:   'border-red-500 bg-red-950/80',
  unlucky:  'border-orange-500 bg-orange-950/80',
  balanced: 'border-gray-400 bg-gray-800/80',
  favored:  'border-green-400 bg-green-950/80',
  exalted:  'border-yellow-300 bg-yellow-950/80',
};

export default function DiceManipulator({ branchChoice, board, onSelectTile, onConfirmDestiny, onHoverTile }: DiceManipulatorProps) {
  const { tileOptions, chosenTileId, destinyResult } = branchChoice;
  const [rolling, setRolling] = useState(false);
  const [rollOverlay, setRollOverlay] = useState(false);
  const [overlayFace1, setOverlayFace1] = useState(1);
  const [overlayFace2, setOverlayFace2] = useState(1);

  // Phase 1: show branch options (no destiny yet)
  // Phase 2: destiny result shown (chosenTileId + destinyResult set)
  const showingDestiny = !!chosenTileId && !!destinyResult;

  const handleTileClick = (id: number) => {
    if (rolling || showingDestiny) return;
    setRolling(true);
    setRollOverlay(true);

    // Animate both dice faces rapidly
    let ticks = 0;
    const maxTicks = 12;
    const interval = setInterval(() => {
      setOverlayFace1(Math.floor(Math.random() * 6) + 1);
      setOverlayFace2(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        setRolling(false);
        setTimeout(() => {
          setRollOverlay(false);
          onSelectTile(id);
        }, 400);
      }
    }, 130);
  };

  return (
    <>
      {/* ── Centered 2d6 roll overlay ── */}
      <AnimatePresence>
        {rollOverlay && (
          <motion.div
            key="2d6-overlay"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div
              className="flex items-center gap-4 rounded-2xl border-4 border-game-gold px-8 py-6 shadow-2xl"
              style={{ background: 'rgba(14,10,6,0.92)' }}
            >
              <RollingDice face={overlayFace1} spinning={rolling} />
              <span className="text-white text-3xl font-black">+</span>
              <RollingDice face={overlayFace2} spinning={rolling} />
              {rolling && (
                <span className="absolute bottom-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Rolling...
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pb-6 pt-4 px-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent"
      >
      <AnimatePresence mode="wait">
        {!showingDestiny ? (
          /* ── Phase 1: Choose your path ── */
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 w-full">
            <div className="text-sm font-semibold tracking-wide uppercase mb-1" style={{ color: '#8a6a4a' }}>
              Choose your path
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {tileOptions.map((id) => {
                const tile = board.find(t => t.id === id);
                if (!tile) return null;
                const bg = TILE_BG[tile.type] ?? 'bg-gray-600 border-gray-400';
                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTileClick(id)}
                    onMouseEnter={() => onHoverTile?.(id)}
                    onMouseLeave={() => onHoverTile?.(null)}
                    disabled={rolling}
                    className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border-2 ${bg} text-white font-bold shadow-lg cursor-pointer min-w-[90px] disabled:opacity-60`}
                  >
                    <span className="text-3xl">{TILE_EMOJI[tile.type] ?? '⬜'}</span>
                    <span className="text-sm">{TILE_LABELS[tile.type] ?? tile.type}</span>
                  </motion.button>
                );
              })}
            </div>
            <p className="text-gray-500 text-xs">Pick a tile — then roll 2d6 for your fate</p>
          </motion.div>
        ) : (
          /* ── Phase 2: Show 2d6 destiny result ── */
          <DestinyReveal destinyResult={destinyResult!} chosenTileId={chosenTileId!} board={board} onConfirm={onConfirmDestiny} />
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
}

// Spritesheet: 96x16px, 6 frames of 16x16 (faces 1-6 left to right)
const FRAME_SIZE = 16;
const DISPLAY_SIZE = 80; // rendered size in px
const SCALE = DISPLAY_SIZE / FRAME_SIZE;

function DiceSprite({ face, spinning }: { face: number; spinning: boolean }) {
  // frame index 0-5 for faces 1-6
  const frameX = (face - 1) * FRAME_SIZE;
  return (
    <motion.div
      animate={spinning
        ? { rotate: [0, -18, 18, -14, 14, -8, 8, 0], scale: [1, 1.15, 0.9, 1.1, 0.95, 1] }
        : { rotate: 0, scale: 1 }}
      transition={{ duration: 0.8, repeat: spinning ? Infinity : 0, ease: 'easeInOut' }}
      style={{
        width: DISPLAY_SIZE,
        height: DISPLAY_SIZE,
        backgroundImage: 'url(/dice/dice1.png)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${96 * SCALE}px ${FRAME_SIZE * SCALE}px`,
        backgroundPosition: `-${frameX * SCALE}px 0px`,
        imageRendering: 'pixelated',
      }}
    />
  );
}

function RollingDice({ face, spinning }: { face: number; spinning: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <DiceSprite face={face} spinning={spinning} />
    </div>
  );
}

function DestinyReveal({ destinyResult, chosenTileId, board, onConfirm }: {
  destinyResult: DestinyResult;
  chosenTileId: number;
  board: BoardTile[];
  onConfirm?: () => void;
}) {
  const tile = board.find(t => t.id === chosenTileId);
  const bgClass = DESTINY_BG[destinyResult.state] ?? 'border-gray-400 bg-gray-800/80';

  return (
    <motion.div
      key="destiny"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col items-center gap-3 w-full max-w-sm mx-auto rounded-2xl border-2 px-6 py-4 shadow-2xl ${bgClass}`}
    >
      {/* Dice roll display */}
      <div className="flex items-center gap-3">
        <DiceFace value={destinyResult.die1} />
        <span className="text-white text-2xl font-bold">+</span>
        <DiceFace value={destinyResult.die2} />
        <span className="text-white text-2xl font-bold">=</span>
        <span className="text-3xl font-black text-white">{destinyResult.total}</span>
      </div>

      {/* Destiny state */}
      <div className="flex items-center gap-2">
        <span className="text-4xl">{destinyResult.emoji}</span>
        <div className="text-left">
          <div className="text-white font-black text-xl">{destinyResult.label}</div>
          <div className="text-gray-300 text-xs max-w-[200px]">{destinyResult.description}</div>
        </div>
      </div>

      {/* Chosen tile reminder */}
      {tile && (
        <div className="text-gray-400 text-xs">
          Heading to: <span className="text-white font-semibold">{TILE_LABELS[tile.type] ?? tile.type} {TILE_EMOJI[tile.type]}</span>
        </div>
      )}

      {onConfirm && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          className="mt-1 px-6 py-2 bg-game-gold text-black font-black rounded-xl shadow-lg text-sm"
        >
          Proceed →
        </motion.button>
      )}
    </motion.div>
  );
}

function DiceFace({ value }: { value: number }) {
  const [rolling, setRolling] = useState(true);
  const [display, setDisplay] = useState(Math.floor(Math.random() * 6) + 1);

  useEffect(() => {
    let ticks = 0;
    const maxTicks = 8;
    const interval = setInterval(() => {
      setDisplay(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        setDisplay(value);
        setRolling(false);
      }
    }, 130);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="select-none"
    >
      <DiceSprite face={display} spinning={rolling} />
    </motion.div>
  );
}
