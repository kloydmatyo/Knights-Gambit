'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface DiceRollerProps {
  onRoll: () => void;
  disabled?: boolean;
  lastRoll?: number;
}

// Spritesheet: 96x16px, 6 frames of 16x16 (faces 1-6 left to right)
const FRAME_SIZE = 16;
const DISPLAY_SIZE = 96;
const SCALE = DISPLAY_SIZE / FRAME_SIZE;

function DiceSprite({ face, spinning }: { face: number; spinning: boolean }) {
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

export default function DiceRoller({ onRoll, disabled, lastRoll }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState<number>(1);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (lastRoll) setDisplayFace(lastRoll);
  }, [lastRoll]);

  const handleRoll = () => {
    if (isRolling || disabled) return;
    setIsRolling(true);
    setShowOverlay(true);

    let ticks = 0;
    const maxTicks = 14;
    const interval = setInterval(() => {
      setDisplayFace(Math.floor(Math.random() * 6) + 1);
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        onRoll();
        setIsRolling(false);
        setTimeout(() => setShowOverlay(false), 500);
      }
    }, 130);
  };

  return (
    <>
      {/* ── Centered board overlay during roll ── */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="dice-overlay"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.7 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div
              className="flex flex-col items-center gap-3 rounded-2xl border-4 border-game-gold px-10 py-8 shadow-2xl"
              style={{ background: 'rgba(14,10,6,0.9)' }}
            >
              <DiceSprite face={displayFace} spinning={isRolling} />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {isRolling ? 'Rolling...' : `Rolled ${displayFace}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom button ── */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30">
        <Button
          size="lg"
          onClick={handleRoll}
          disabled={disabled || isRolling}
          className="text-base sm:text-2xl px-8 sm:px-16 py-4 sm:py-8 shadow-2xl text-white font-bold uppercase tracking-wider"
        >
          {isRolling ? '🗺️ Loading...' : '🗺️ CHOOSE PATH'}
        </Button>
      </div>
    </>
  );
}
