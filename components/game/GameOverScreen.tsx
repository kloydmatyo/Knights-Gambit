'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { getSupabase, LeaderboardEntry } from '@/lib/supabase';
import { getDungeonNumber, getFloorInDungeon } from '@/lib/game-engine/constants';

interface GameOverScreenProps {
  isVictory: boolean;
  floor: number;
  turns: number;
  coinsEarned: number;
  characterClass: string;
  playerName: string;
  enemiesKilled: number;
  onRestart: () => void;
  onMainMenu: () => void;
  onRevive?: () => void;
  canRevive?: boolean;
}

const CLASS_EMOJIS: Record<string, string> = {
  knight: '🛡️', archer: '🏹', mage: '🔮',
  barbarian: '⚔️', assassin: '🗡️', cleric: '✨',
};

// Map class names to icon file paths
const CLASS_ICONS: Record<string, string> = {
  knight: '/class_icon/knight.png',
  archer: '/class_icon/archer.png',
  mage: '/class_icon/mage.png',
  barbarian: '/class_icon/warrior.png',
  assassin: '/class_icon/assassin.png',
  cleric: '/class_icon/cleric.png',
};

function floorLabel(absoluteFloor: number): string {
  const d = getDungeonNumber(absoluteFloor);
  const f = getFloorInDungeon(absoluteFloor);
  return `D${d}·F${f}`;
}

export default function GameOverScreen({
  isVictory,
  floor,
  turns,
  coinsEarned,
  characterClass,
  playerName,
  enemiesKilled,
  onRestart,
  onMainMenu,
  onRevive,
  canRevive = false,
}: GameOverScreenProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [thisRunId, setThisRunId] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    submitAndFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAndFetch = async () => {
    setLoading(true);
    try {
      const db = getSupabase();

      // Submit this run and capture the inserted row id
      const { data: insertedRows } = await db.from('leaderboard').insert({
        nickname: playerName || 'Anonymous',
        floor_reached: floor,
        character_class: characterClass,
        enemies_killed: enemiesKilled,
        turns,
      }).select('id');
      setThisRunId(insertedRows?.[0]?.id ?? null);

      // Fetch top 10 by floor, then enemies_killed as tiebreaker
      const { data, error } = await db
        .from('leaderboard')
        .select('*')
        .order('floor_reached', { ascending: false })
        .order('enemies_killed', { ascending: false })
        .limit(10);

      if (error) throw error;

      const entries: LeaderboardEntry[] = data ?? [];
      setLeaderboard(entries);
      setSubmitted(true);

      // Find this player's rank among ALL entries (not just top 10)
      const { count } = await db
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .or(`floor_reached.gt.${floor},and(floor_reached.eq.${floor},enemies_killed.gt.${enemiesKilled})`);

      setPlayerRank((count ?? 0) + 1);
    } catch {
      setSubmitError('Could not reach leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at center, #1a0e04 0%, #080402 100%)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring' }}
            className="mb-3 flex justify-center"
          >
            {isVictory ? (
              <span className="text-7xl">🏆</span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src="/item_icons/game_over.png" 
                alt="Game Over"
                className="w-20 h-20 object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.emoji-fallback')) {
                    const span = document.createElement('span');
                    span.className = 'emoji-fallback text-7xl';
                    span.textContent = '💀';
                    parent.appendChild(span);
                  }
                }}
              />
            )}
          </motion.div>
          <h1 className={`text-4xl font-bold mb-1 ${isVictory ? 'text-yellow-400' : 'text-red-400'}`}>
            {isVictory ? 'VICTORY!' : 'GAME OVER'}
          </h1>
          <div className="flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={CLASS_ICONS[characterClass] || CLASS_ICONS.knight} 
              alt={characterClass}
              className="w-8 h-8 object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.emoji-fallback')) {
                  const span = document.createElement('span');
                  span.className = 'emoji-fallback text-2xl';
                  span.textContent = CLASS_EMOJIS[characterClass] || '⚔️';
                  parent.appendChild(span);
                }
              }}
            />
            <p className="text-gray-400">
              {playerName && <span className="text-white font-semibold">{playerName} </span>}
              {characterClass}
            </p>
          </div>
        </div>

        {/* Run summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: '🏰', label: 'Floor Reached', value: floorLabel(floor), useImage: false },
            { icon: '/item_icons/game_over.png', label: 'Enemies Killed', value: enemiesKilled, useImage: true },
            { icon: '🎲', label: 'Total Turns', value: turns, useImage: false },
            { icon: '/item_icons/coins.png', label: 'Coins', value: coinsEarned, useImage: true },
          ].map(({ icon, label, value, useImage }) => (
            <div key={label} className="rounded-lg p-3 text-center"
              style={{ background: 'rgba(10,6,2,0.9)', border: '1px solid #3d2a14' }}>
              <div className="text-2xl mb-1 flex items-center justify-center h-8">
                {useImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={icon} 
                    alt={label}
                    className="w-8 h-8 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.emoji-fallback')) {
                        const span = document.createElement('span');
                        span.className = 'emoji-fallback text-2xl';
                        span.textContent = label === 'Coins' ? '💰' : '💀';
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span>{icon}</span>
                )}
              </div>
              <div className="text-xs mb-1" style={{ color: '#6a4a2a' }}>{label}</div>
              <div className="font-bold text-xl" style={{ color: '#d4a030' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Rank badge */}
        <AnimatePresence>
          {!loading && playerRank !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center mb-6 py-3 rounded-lg border ${
                playerRank === 1
                  ? 'bg-yellow-900/30 border-yellow-500 text-yellow-300'
                  : playerRank <= 3
                  ? 'bg-orange-900/30 border-orange-500 text-orange-300'
                  : 'bg-gray-900 border-gray-600 text-gray-300'
              }`}
            >
              <span className="text-2xl mr-2">
                {playerRank === 1 ? '🥇' : playerRank === 2 ? '🥈' : playerRank === 3 ? '🥉' : '🎖️'}
              </span>
              <span className="font-bold text-lg">
                {playerRank === 1 ? 'New #1!' : `Rank #${playerRank}`}
              </span>
              {playerRank === 1 && <span className="ml-2 text-sm">You&apos;re at the top of the board!</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leaderboard */}
        <div className="rounded-lg mb-6 overflow-hidden" style={{ border: '1px solid #3d2a14', background: 'rgba(10,6,2,0.9)' }}>
          <div className="px-4 py-2 flex items-center gap-2" style={{ borderBottom: '1px solid #3d2a14' }}>
            <span className="font-bold" style={{ color: '#d4a030' }}>🏆 Leaderboard</span>
            {loading && <span className="text-gray-500 text-sm ml-auto">Loading...</span>}
            {submitError && <span className="text-red-400 text-sm ml-auto">{submitError}</span>}
          </div>

          {leaderboard.length === 0 && !loading ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">No scores yet — you&apos;re the first!</div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#2a1a0a' }}>
              {leaderboard.map((entry, i) => {
                const isThisRun = entry.id === thisRunId;
                return (
                  <motion.div
                    key={entry.id ?? i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                      isThisRun ? 'bg-yellow-900/20 border-l-2 border-yellow-400' : ''
                    }`}
                  >
                    <span className="w-6 text-center font-bold text-gray-500">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <span className={`flex-1 font-semibold truncate ${isThisRun ? 'text-yellow-300' : 'text-white'}`}>
                      {entry.nickname}
                      {isThisRun && <span className="ml-1 text-xs text-yellow-500">(you)</span>}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={CLASS_ICONS[entry.character_class] || CLASS_ICONS.knight} 
                        alt={entry.character_class}
                        className="w-4 h-4 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.emoji-fallback')) {
                            const span = document.createElement('span');
                            span.className = 'emoji-fallback text-xs';
                            span.textContent = CLASS_EMOJIS[entry.character_class] || '⚔️';
                            parent.appendChild(span);
                          }
                        }}
                      />
                    </div>
                    <span className="text-yellow-400 font-bold w-20 text-right">{floorLabel(entry.floor_reached)}</span>
                    <span className="text-gray-500 w-16 text-right">{entry.enemies_killed ?? 0} kills</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {canRevive && onRevive && (
            <Button 
              size="lg" 
              onClick={onRevive} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-lg shadow-lg"
            >
              💫 REVIVE (Continue from where you died)
            </Button>
          )}
          <div className="flex gap-3">
            <Button size="lg" onClick={restarting ? undefined : () => { setRestarting(true); setTimeout(() => onRestart(), 1500); }} className="flex-1 relative overflow-hidden">
              {restarting ? (
                <>
                  <motion.div
                    className="absolute inset-0 bg-green-600 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5 }}
                  />
                  <span className="relative z-10">Starting...</span>
                </>
              ) : '🎮 Play Again'}
            </Button>
            <Button size="lg" variant="secondary" onClick={onMainMenu} className="flex-1">
              🏠 Main Menu
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
