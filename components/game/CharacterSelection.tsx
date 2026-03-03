'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterClass, CLASS_STATS } from '@/lib/game-engine';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface CharacterSelectionProps {
  onSelect: (characterClass: CharacterClass) => void;
}

const classEmojis: Record<CharacterClass, string> = {
  knight: '🛡️',
  archer: '🏹',
  mage: '🔮',
  barbarian: '⚔️',
  assassin: '🗡️',
  cleric: '✨',
};

const classColors: Record<CharacterClass, string> = {
  knight: 'border-cyan-500',
  archer: 'border-green-500',
  mage: 'border-blue-500',
  barbarian: 'border-red-500',
  assassin: 'border-purple-500',
  cleric: 'border-yellow-500',
};

export default function CharacterSelection({ onSelect }: CharacterSelectionProps) {
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);

  const classes = Object.entries(CLASS_STATS) as [CharacterClass, typeof CLASS_STATS[CharacterClass]][];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-game-bg">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-game-accent mb-2 text-shadow">
          ⚔️ CHARACTER SELECTION ⚔️
        </h1>
        <p className="text-game-mana text-lg">Choose your hero wisely, adventurer!</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl w-full mb-8">
        {classes.map(([classKey, classData], index) => (
          <motion.div
            key={classKey}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="bordered"
              className={cn(
                'cursor-pointer transition-all hover:scale-105 hover:shadow-2xl',
                selectedClass === classKey && `${classColors[classKey]} border-4 glow`,
                selectedClass !== classKey && 'border-game-secondary'
              )}
              onClick={() => setSelectedClass(classKey)}
            >
              <div className="text-center">
                <div className="text-6xl mb-3">{classEmojis[classKey]}</div>
                <h3 className="text-2xl font-bold text-game-gold mb-2">
                  {classData.name.toUpperCase()}
                </h3>
                <p className="text-gray-400 text-sm mb-4 min-h-[40px]">
                  {classData.description}
                </p>

                <div className="space-y-2 text-left bg-game-bg bg-opacity-50 rounded p-3">
                  <div className="stat-display">
                    <span className="text-game-health">❤️ Health:</span>
                    <span className="font-bold">{classData.baseHealth}</span>
                  </div>
                  <div className="stat-display">
                    <span className="text-game-attack">⚔️ Attack:</span>
                    <span className="font-bold">{classData.baseAttack}</span>
                  </div>
                  <div className="stat-display">
                    <span className="text-game-defense">🛡️ Defense:</span>
                    <span className="font-bold">{classData.baseDefense}</span>
                  </div>
                  <div className="stat-display">
                    <span className="text-game-gold">💰 Coins:</span>
                    <span className="font-bold">{classData.startingCoins}</span>
                  </div>
                  {classData.baseMana && (
                    <div className="stat-display">
                      <span className="text-game-mana">✨ Mana:</span>
                      <span className="font-bold">{classData.baseMana}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          size="lg"
          disabled={!selectedClass}
          onClick={() => selectedClass && onSelect(selectedClass)}
          className="text-xl px-12 py-4"
        >
          {selectedClass ? '🗡️ START ADVENTURE 🗡️' : 'SELECT A CLASS FIRST'}
        </Button>
      </motion.div>
    </div>
  );
}
