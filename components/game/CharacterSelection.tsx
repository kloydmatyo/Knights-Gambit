'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterClass, CLASS_STATS } from '@/lib/game-engine';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface CharacterSelectionProps {
  onSelect: (characterClass: CharacterClass, playerName: string) => void;
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
  const [playerName, setPlayerName] = useState('');

  const canStart = selectedClass && playerName.trim().length > 0;

  const classes = Object.entries(CLASS_STATS) as [CharacterClass, typeof CLASS_STATS[CharacterClass]][];

  return (
    <div className="min-h-screen w-full bg-game-bg overflow-y-auto">
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-8 px-3 sm:px-6">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4 sm:mb-6 w-full"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-game-accent mb-2 text-shadow px-2">
              ⚔️ CHARACTER SELECTION ⚔️
            </h1>
            <p className="text-game-mana text-sm sm:text-base px-2">Choose your hero wisely, adventurer!</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full mb-4 sm:mb-6">
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
                <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">{classEmojis[classKey]}</div>
                <h3 className="text-lg sm:text-2xl font-bold text-game-gold mb-1 sm:mb-2">
                  {classData.name.toUpperCase()}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 min-h-[30px] sm:min-h-[40px]">
                  {classData.description}
                </p>

                <div className="space-y-1.5 sm:space-y-2 text-left bg-game-bg bg-opacity-50 rounded p-2 sm:p-3">
                  <div className="stat-display text-xs sm:text-base">
                    <span className="text-game-health">❤️ Health:</span>
                    <span className="font-bold">{classData.baseHealth}</span>
                  </div>
                  <div className="stat-display text-xs sm:text-base">
                    <span className="text-game-attack">⚔️ Attack:</span>
                    <span className="font-bold">{classData.baseAttack}</span>
                  </div>
                  <div className="stat-display text-xs sm:text-base">
                    <span className="text-game-defense">🛡️ Defense:</span>
                    <span className="font-bold">{classData.baseDefense}</span>
                  </div>
                  <div className="stat-display text-xs sm:text-base">
                    <span className="text-game-gold">💰 Coins:</span>
                    <span className="font-bold">{classData.startingCoins}</span>
                  </div>
                  {('baseMana' in classData) && classData.baseMana && (
                    <div className="stat-display text-xs sm:text-base">
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
            className="mb-4 sm:mb-6 flex flex-col items-center gap-3 w-full max-w-xs"
          >
            <input
              type="text"
              placeholder="Enter your name..."
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              maxLength={20}
              className="w-full bg-game-primary border-2 border-game-gold rounded-xl px-4 py-3 text-white text-center font-bold placeholder-gray-500 focus:outline-none focus:border-yellow-300 text-sm sm:text-base"
            />
            <Button
              size="lg"
              disabled={!canStart}
              onClick={() => selectedClass && canStart && onSelect(selectedClass, playerName.trim())}
              className="text-sm sm:text-base px-8 sm:px-12 py-2.5 sm:py-3 w-full"
            >
              {!selectedClass ? 'SELECT A CLASS FIRST' : !playerName.trim() ? 'ENTER YOUR NAME' : '🗡️ START ADVENTURE 🗡️'}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
