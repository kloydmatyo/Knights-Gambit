'use client';

import { Player, Enemy } from '@/lib/game-engine';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ENEMY_SPRITES } from '@/lib/game-engine/constants';
import SpriteAnimator from '@/components/game/SpriteAnimator';

function EnemySprite({ enemy, isHurt }: { enemy: Enemy; isHurt: boolean }) {
  const sprite = ENEMY_SPRITES[enemy.type];
  if (!sprite) return <div className="text-6xl mb-3">👹</div>;

  const anim = isHurt ? 'Hurt' : 'Idle';
  const frameCount = isHurt ? (sprite.frames['Hurt'] ?? 2) : (sprite.frames['Idle'] ?? 3);
  const fps = isHurt ? 8 : 4;

  return (
    <SpriteAnimator
      sheet={sprite.sheet(anim)}
      frameW={128}
      frameCount={frameCount}
      fps={fps}
      scale={2}
      className="mx-auto mb-3"
    />
  );
}


interface CombatUIProps {
  player: Player;
  enemy: Enemy;
  onAttack: () => void;
  onUseSkill: (skillId: string) => void;
  onFlee?: () => void;
  combatLog: string[];
  isPlayerTurn: boolean;
  enemyHurt?: boolean;
}

export default function CombatUI({
  player,
  enemy,
  onAttack,
  onUseSkill,
  onFlee,
  combatLog,
  isPlayerTurn,
  enemyHurt = false,
}: CombatUIProps) {
  const enemyHealthPercent = (enemy.health / enemy.maxHealth) * 100;
  const playerHealthPercent = (player.health / player.maxHealth) * 100;

  const activeSkills = player.skills.filter(
    (skill) => skill.type === 'active' && skill.currentCooldown === 0
  );

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Card variant="elevated" className="p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-game-accent mb-2">
              ⚔️ COMBAT ⚔️
            </h2>
            <p className="text-gray-400">
              {isPlayerTurn ? 'Your Turn!' : 'Enemy Turn...'}
            </p>
          </div>

          {/* Combatants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Player */}
            <div className="text-center">
              <div className="text-6xl mb-3">🛡️</div>
              <h3 className="text-xl font-bold text-game-gold mb-2">
                {player.class.toUpperCase()}
              </h3>
              <div className="bg-game-bg rounded p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-game-health">HP</span>
                  <span className="text-white">
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-game-health rounded-full"
                    animate={{ width: `${playerHealthPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Enemy */}
            <div className="text-center">
              <EnemySprite enemy={enemy} isHurt={enemyHurt} />
              <h3 className="text-xl font-bold text-game-accent mb-2">
                {enemy.name.toUpperCase()}
              </h3>
              <div className="bg-game-bg rounded p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-game-health">HP</span>
                  <span className="text-white">
                    {enemy.health}/{enemy.maxHealth}
                  </span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-600 rounded-full"
                    animate={{ width: `${enemyHealthPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-game-bg rounded p-4 mb-6 h-32 overflow-y-auto">
            <AnimatePresence>
              {combatLog.slice(-5).map((message, index) => (
                <motion.div
                  key={`${message}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-game-mana text-sm mb-1"
                >
                  → {message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onAttack}
                disabled={!isPlayerTurn}
                size="lg"
                className="w-full"
              >
                ⚔️ Attack
              </Button>
              {onFlee && (
                <Button
                  onClick={onFlee}
                  disabled={!isPlayerTurn}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  🏃 Flee
                </Button>
              )}
            </div>

            {/* Skills */}
            {activeSkills.length > 0 && (
              <div>
                <h4 className="text-game-gold font-bold mb-2">⚡ Skills</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {activeSkills.map((skill) => (
                    <Button
                      key={skill.id}
                      onClick={() => onUseSkill(skill.id)}
                      disabled={!isPlayerTurn || skill.currentCooldown > 0}
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs"
                    >
                      {skill.name}
                      {skill.currentCooldown > 0 && ` (${skill.currentCooldown})`}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
