'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CharacterClass, CLASS_STATS } from '@/lib/game-engine';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const LPCCharacterCreator = dynamic(
  () => import('./LPCCharacterCreator'),
  { ssr: false, loading: () => <div className="text-game-mana text-sm animate-pulse text-center py-8">Loading character creator...</div> }
);

interface CharacterSelectionProps {
  onSelect: (characterClass: CharacterClass, playerName: string, spriteDataUrl?: string, fullSheetUrl?: string) => void;
}

const classEmojis: Record<CharacterClass, string> = {
  knight: '🛡️',
  archer: '🏹',
  mage: '🔮',
  barbarian: '⚔️',
  assassin: '🗡️',
  cleric: '✨',
};

const classAccent: Record<CharacterClass, { border: string; glow: string; bar: string }> = {
  knight:    { border: 'border-cyan-500',   glow: 'shadow-cyan-500/40',   bar: 'bg-cyan-500' },
  archer:    { border: 'border-green-500',  glow: 'shadow-green-500/40',  bar: 'bg-green-500' },
  mage:      { border: 'border-blue-500',   glow: 'shadow-blue-500/40',   bar: 'bg-blue-500' },
  barbarian: { border: 'border-red-500',    glow: 'shadow-red-500/40',    bar: 'bg-red-500' },
  assassin:  { border: 'border-purple-500', glow: 'shadow-purple-500/40', bar: 'bg-purple-500' },
  cleric:    { border: 'border-yellow-500', glow: 'shadow-yellow-500/40', bar: 'bg-yellow-500' },
};

type Step = 'appearance' | 'class';

const CLASS_LIST = Object.entries(CLASS_STATS) as [CharacterClass, typeof CLASS_STATS[CharacterClass]][];

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-300 text-sm w-20 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/10">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="text-white font-bold text-sm w-8 text-right">{value}</span>
    </div>
  );
}

export default function CharacterSelection({ onSelect }: CharacterSelectionProps) {
  const [step, setStep] = useState<Step>('class');
  const [spriteDataUrl, setSpriteDataUrl] = useState<string | undefined>();
  const [fullSheetUrl, setFullSheetUrl] = useState<string | undefined>();
  const [classIndex, setClassIndex] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [direction, setDirection] = useState(0);

  const [currentClass, currentData] = CLASS_LIST[classIndex];
  const accent = classAccent[currentClass];
  const canStart = playerName.trim().length > 0;

  function navigate(dir: 1 | -1) {
    setDirection(dir);
    setClassIndex(i => (i + dir + CLASS_LIST.length) % CLASS_LIST.length);
  }

  function handleAppearanceConfirm(dataUrl: string, fullSheet?: string) {
    setSpriteDataUrl(dataUrl);
    setFullSheetUrl(fullSheet);
    // Appearance is done — trigger start
    onSelect(currentClass, playerName.trim(), dataUrl, fullSheet);
  }

  function handleStart() {
    if (!canStart) return;
    // Move to appearance step with class already chosen
    setStep('appearance');
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80 }),
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto flex flex-col items-center justify-center py-8 px-3 sm:px-6"
      style={{ background: 'radial-gradient(ellipse at center, #2a1808 0%, #0e0804 100%)' }}>
      <div className="w-full max-w-4xl flex flex-col items-center gap-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-game-accent mb-3">⚔️ CHARACTER CREATION ⚔️</h1>
          <div className="flex items-center justify-center gap-3">
            <StepBadge num={1} label="Class" active={step === 'class'} done={step === 'appearance'} />
            <div className="w-8 h-px bg-game-secondary" />
            <StepBadge num={2} label="Appearance" active={step === 'appearance'} done={false} />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'class' && (
            <motion.div key="class" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full flex flex-col items-center gap-5">

              {/* ── Carousel card ── */}
              <div className="relative w-full flex items-center gap-3">
                <button onClick={() => navigate(-1)}
                  className="shrink-0 w-12 h-12 rounded-full bg-black/60 border border-white/20 hover:border-white/50 text-white text-xl font-bold flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                  ‹
                </button>

                <div className={cn('flex-1 relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm shadow-2xl', accent.border, accent.glow, 'shadow-xl')}
                  style={{ minHeight: 260, background: 'rgba(14,10,6,0.92)' }}>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div key={currentClass} custom={direction} variants={variants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="flex gap-6 p-6">
                      <div className="flex flex-col items-center justify-center shrink-0 w-28">
                        <div className="text-7xl mb-2 drop-shadow-lg">{classEmojis[currentClass]}</div>
                        <span className={cn('text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', accent.border, 'text-white/80')}>
                          {currentData.name}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <div>
                          <h2 className="text-2xl font-black text-white tracking-wide">{currentData.name.toUpperCase()}</h2>
                          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{currentData.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 mt-1">
                          <StatBar label="Health" value={currentData.baseHealth} max={150} color={accent.bar} />
                          <StatBar label="Attack" value={currentData.baseAttack} max={25} color={accent.bar} />
                          <StatBar label="Defense" value={currentData.baseDefense} max={10} color={accent.bar} />
                          {'baseMana' in currentData && currentData.baseMana
                            ? <StatBar label="Mana" value={currentData.baseMana} max={100} color="bg-blue-400" />
                            : null}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button onClick={() => navigate(1)}
                  className="shrink-0 w-12 h-12 rounded-full bg-black/60 border border-white/20 hover:border-white/50 text-white text-xl font-bold flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                  ›
                </button>
              </div>

              {/* Thumbnail row */}
              <div className="flex gap-2 justify-center">
                {CLASS_LIST.map(([cls], i) => (
                  <button key={cls} onClick={() => { setDirection(i > classIndex ? 1 : -1); setClassIndex(i); }}
                    className={cn('w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl transition-all hover:scale-110',
                      i === classIndex ? cn('border-white shadow-lg scale-110', classAccent[cls].glow) : 'border-white/20 bg-black/40 opacity-60 hover:opacity-100')}>
                    {classEmojis[cls]}
                  </button>
                ))}
              </div>

              {/* Name + next */}
              <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <input type="text" placeholder="Enter your name..." value={playerName}
                  onChange={e => setPlayerName(e.target.value)} maxLength={20}
                  className="w-full bg-game-primary border-2 border-game-gold rounded-xl px-4 py-3 text-white text-center font-bold placeholder-gray-500 focus:outline-none focus:border-yellow-300 text-sm sm:text-base"
                />
                <Button size="lg" disabled={!canStart} onClick={handleStart}
                  className="text-sm sm:text-base px-8 sm:px-12 py-2.5 sm:py-3 w-full">
                  {!playerName.trim() ? 'ENTER YOUR NAME' : `✨ CUSTOMIZE ${currentData.name.toUpperCase()} →`}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'appearance' && (
            <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex flex-col gap-3">
              <button onClick={() => setStep('class')} className="text-xs text-gray-400 hover:text-white underline self-start">
                ← Back to class selection
              </button>
              <LPCCharacterCreator onConfirm={handleAppearanceConfirm} characterClass={currentClass} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepBadge({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
        done ? 'bg-green-600 text-white' : active ? 'bg-game-gold text-black' : 'bg-game-secondary text-gray-400')}>
        {done ? '✓' : num}
      </div>
      <span className={cn('text-xs', active ? 'text-white font-medium' : 'text-gray-500')}>{label}</span>
    </div>
  );
}
