'use client';

import Button from '@/components/ui/Button';

interface DiceRollerProps {
  onRoll: () => void;
  disabled?: boolean;
}

export default function DiceRoller({ onRoll, disabled }: DiceRollerProps) {
  return (
    <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30">
      <Button
        size="lg"
        onClick={onRoll}
        disabled={disabled}
        className="text-base sm:text-2xl px-8 sm:px-16 py-4 sm:py-8 shadow-2xl text-white font-bold uppercase tracking-wider"
      >
        🗺️ CHOOSE PATH
      </Button>
    </div>
  );
}
