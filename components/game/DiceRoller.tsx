'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface DiceRollerProps {
  onRoll: () => void;
  disabled?: boolean;
  lastRoll?: number;
}

export default function DiceRoller({ onRoll, disabled, lastRoll }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    setIsRolling(true);
    setTimeout(() => {
      onRoll();
      setIsRolling(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30">
      <div className="flex flex-col items-center gap-1.5 sm:gap-4">
        {/* Last roll display */}
        <AnimatePresence>
          {lastRoll && !isRolling && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-game-primary border-2 sm:border-3 border-game-gold rounded-lg sm:rounded-xl px-4 sm:px-8 py-2 sm:py-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 font-bold uppercase tracking-wider">
                  Last Roll
                </div>
                <div className="text-3xl sm:text-5xl font-bold text-game-gold drop-shadow-lg">
                  {lastRoll}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dice button */}
        <motion.div
          animate={isRolling ? { rotate: [0, 360, 720] } : { rotate: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleRoll}
            disabled={disabled || isRolling}
            className="text-base sm:text-2xl px-8 sm:px-16 py-4 sm:py-8 shadow-2xl text-white font-bold uppercase tracking-wider"
          >
            {isRolling ? '🎲 Rolling...' : '🎲 ROLL DICE'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
