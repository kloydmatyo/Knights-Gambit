'use client';

import { WeaponUpgrade, WeaponUpgradeState } from '@/lib/game-engine/types';
import { WeaponUpgradeEngine } from '@/lib/game-engine/WeaponUpgradeEngine';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlayerLike {
  class: string;
  coins: number;
}

interface WeaponUpgradePanelProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerLike;
  currentFloor: number;
  upgradeState: WeaponUpgradeState;
  onPurchase: (upgradeId: string) => { success: boolean; message: string };
}

const TIER_COLORS: Record<string, string> = {
  basic: 'border-gray-400 text-gray-300',
  advanced: 'border-blue-400 text-blue-300',
  elite: 'border-purple-400 text-purple-300',
  legendary: 'border-yellow-400 text-yellow-300',
};

const TIER_LABELS: Record<string, string> = {
  basic: 'Basic',
  advanced: 'Advanced',
  elite: 'Elite',
  legendary: '✨ Legendary',
};

function EffectBadges({ effect }: { effect: WeaponUpgrade['effect'] }) {
  const badges: string[] = [];
  if (effect.attackBonus) badges.push(`+${effect.attackBonus} ATK`);
  if (effect.defenseBonus) badges.push(`+${effect.defenseBonus} DEF`);
  if (effect.healthBonus) badges.push(`+${effect.healthBonus} HP`);
  if (effect.critChanceBonus) badges.push(`+${Math.round(effect.critChanceBonus * 100)}% Crit`);
  if (effect.critDamageBonus) badges.push(`+${Math.round(effect.critDamageBonus * 100)}% Crit DMG`);
  if (effect.specialAbility) badges.push(`🌟 Special`);

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {badges.map((b) => (
        <span key={b} className="text-xs bg-game-secondary px-2 py-0.5 rounded text-game-gold">
          {b}
        </span>
      ))}
    </div>
  );
}

export default function WeaponUpgradePanel({
  isOpen,
  onClose,
  player,
  currentFloor,
  upgradeState,
  onPurchase,
}: WeaponUpgradePanelProps) {
  const available = WeaponUpgradeEngine.getAvailableUpgrades(player.class, currentFloor, upgradeState);
  const purchased = WeaponUpgradeEngine.getPurchasedUpgrades(upgradeState);
  const allClassUpgrades = WeaponUpgradeEngine.getClassUpgrades(player.class);

  // Upgrades locked by floor (not yet available but visible as future goals)
  const locked = allClassUpgrades.filter(
    (u) =>
      !upgradeState.purchasedUpgradeIds.includes(u.id) &&
      !available.find((a) => a.id === u.id)
  );

  const canAfford = (cost: number) => player.coins >= cost;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`⚔️ Weapon Upgrades — ${player.class.charAt(0).toUpperCase() + player.class.slice(1)}`}>
      {/* Stats summary */}
      <div className="mb-4 p-3 bg-game-bg rounded grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Coins:</span>
          <span className="text-game-gold font-bold">💰 {player.coins}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Floor:</span>
          <span className="text-white font-bold">{currentFloor}</span>
        </div>
        {upgradeState.totalAttackBonus > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Upgrade ATK:</span>
            <span className="text-green-400">+{upgradeState.totalAttackBonus}</span>
          </div>
        )}
        {upgradeState.totalCritChanceBonus > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-400">Upgrade Crit:</span>
            <span className="text-yellow-400">+{Math.round(upgradeState.totalCritChanceBonus * 100)}%</span>
          </div>
        )}
      </div>

      {/* Purchased upgrades */}
      {purchased.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Owned</h3>
          <div className="flex flex-wrap gap-2">
            {purchased.map((u) => (
              <span key={u.id} className="text-xs bg-green-900/40 border border-green-600 text-green-300 px-2 py-1 rounded">
                {u.emoji} {u.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Available upgrades */}
      {available.length > 0 ? (
        <div className="mb-4">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Available</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {available.map((upgrade, i) => {
              const affordable = canAfford(upgrade.cost);
              return (
                <motion.div
                  key={upgrade.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'border rounded-lg p-3 transition-all',
                    TIER_COLORS[upgrade.tier],
                    affordable ? 'hover:bg-game-secondary/30 cursor-pointer' : 'opacity-50'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{upgrade.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white">{upgrade.name}</span>
                        <span className={cn('text-xs px-1.5 py-0.5 rounded border', TIER_COLORS[upgrade.tier])}>
                          {TIER_LABELS[upgrade.tier]}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{upgrade.description}</p>
                      <EffectBadges effect={upgrade.effect} />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-game-gold font-bold">💰 {upgrade.cost}</span>
                        <Button
                          size="sm"
                          disabled={!affordable}
                          onClick={() => onPurchase(upgrade.id)}
                        >
                          {affordable ? 'Upgrade' : 'Need Coins'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-4">
          {purchased.length === allClassUpgrades.length
            ? '✅ All upgrades purchased!'
            : 'No upgrades available yet — progress further to unlock more.'}
        </p>
      )}

      {/* Locked / future upgrades */}
      {locked.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-2">Locked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {locked.map((upgrade) => (
              <div
                key={upgrade.id}
                className="border border-gray-700 rounded-lg p-3 opacity-40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl grayscale">{upgrade.emoji}</span>
                  <div>
                    <span className="text-gray-400 text-sm font-medium">{upgrade.name}</span>
                    <p className="text-gray-600 text-xs">
                      🔒 Floor {upgrade.requiredFloor} required
                      {upgrade.prerequisiteId && ' · Requires prerequisite'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-game-secondary">
        <Button variant="secondary" onClick={onClose} className="w-full">
          Close
        </Button>
      </div>
    </Modal>
  );
}
