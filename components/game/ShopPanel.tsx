'use client';

import { Player, Item } from '@/lib/game-engine';
import { StatUpgradeCounts } from '@/lib/game-engine/types';
import { calcUpgradePrice } from '@/lib/game-engine/StatUpgradeEngine';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShopPanelProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  items: Item[];
  onPurchase: (item: Item) => void;
  title?: string;
  statUpgradeCounts?: StatUpgradeCounts;
}

const itemEmojis: Record<string, string> = {
  healing_potion: '🧪',
  antidote: '💊',
  stat_upgrade: '⬆️',
  blessing_scroll: '📜',
  heartstone_amulet: '💎',
  holy_water: '💧',
  blessing: '🙏',
};

// Relic emoji lookup by item id
const RELIC_EMOJIS: Record<string, string> = {
  relic_vampiric_fang:       '🦷',
  relic_iron_heart:          '🫀',
  relic_war_drum:            '🥁',
  relic_stone_skin:          '🪨',
  relic_cursed_idol:         '🗿',
  relic_philosophers_stone:  '💠',
  relic_death_mask:          '💀',
  relic_golden_chalice:      '🏆',
};

/** Returns the next-purchase price for a stat upgrade item, if applicable. */
function getNextPrice(item: Item, counts?: StatUpgradeCounts): number | null {
  if (!counts || item.effect.type !== 'permanent' || !item.effect.stat) return null;
  const stat = item.effect.stat;
  // Only show scaling info for the three scalable stats
  if (stat !== 'attack' && stat !== 'defense' && stat !== 'health') return null;
  const currentCount = counts[stat];
  if (currentCount === 0) return null; // first purchase — no "next" yet
  return calcUpgradePrice(stat, currentCount + 1);
}

const RELIC_CATEGORIES: Record<string, string> = {
  relic_vampiric_fang:      'Combat',
  relic_iron_heart:         'Defense',
  relic_war_drum:           'Offense',
  relic_stone_skin:         'Defense',
  relic_cursed_idol:        'Risk/Reward',
  relic_philosophers_stone: 'Economy',
  relic_death_mask:         'Combat',
  relic_golden_chalice:     'Economy',
};

export default function ShopPanel({
  isOpen,
  onClose,
  player,
  items,
  onPurchase,
  title = '🏪 Shop',
  statUpgradeCounts,
}: ShopPanelProps) {
  const canAfford = (price: number) => player.coins >= price;

  const sortedItems = [...items].sort((a, b) => {
    const aAfford = canAfford(a.price) ? 0 : 1;
    const bAfford = canAfford(b.price) ? 0 : 1;
    if (aAfford !== bAfford) return aAfford - bAfford;
    return a.price - b.price;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="mb-4 p-3 rounded-lg flex justify-between items-center"
        style={{ background: 'rgba(10,6,2,0.8)', border: '1px solid #3d2a14' }}>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: '#8a6a4a' }}>Your Coins:</span>
          <span className="font-bold text-2xl" style={{ color: '#d4a030' }}>💰 {player.coins}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(10,6,2,0.9)', border: '1px solid #3d2a14' }}>
          <span className="text-lg">📦</span>
          <span className="font-bold text-sm text-white">
            {player.inventory.reduce((sum, i) => sum + i.quantity, 0)}
          </span>
          <span className="text-xs" style={{ color: '#6a4a2a' }}>items</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedItems.map((item, index) => {
          const affordable = canAfford(item.price);
          const nextPrice = getNextPrice(item, statUpgradeCounts);
          // How many times this stat has been bought (for the "Lv." badge)
          const upgradeLevel = statUpgradeCounts && item.effect.stat
            ? (statUpgradeCounts[item.effect.stat as keyof StatUpgradeCounts] ?? 0)
            : 0;

          return (
            <motion.div
              key={`${item.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant="bordered"
                className={cn(
                  'transition-all overflow-hidden flex flex-col',
                  item.effect.type === 'relic'
                    ? affordable
                      ? 'border-yellow-500 hover:border-yellow-300 bg-yellow-950/20 cursor-pointer'
                      : 'border-yellow-800 opacity-60'
                    : affordable
                      ? 'hover:border-game-gold cursor-pointer'
                      : 'opacity-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">
                    {item.effect.type === 'relic'
                      ? (RELIC_EMOJIS[item.id] ?? '✨')
                      : (itemEmojis[item.type] || '📦')}
                  </div>
                  <div className="flex-1">
                    {/* Name row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={cn(
                        'text-lg font-bold',
                        item.effect.type === 'relic' ? 'text-yellow-400' : 'text-game-gold'
                      )}>{item.name}</h3>
                      {item.effect.type === 'relic' && (
                        <span className="text-xs bg-yellow-900/60 border border-yellow-500 text-yellow-300 px-1.5 py-0.5 rounded">
                          ✨ Relic
                        </span>
                      )}
                      {item.effect.type === 'relic' && RELIC_CATEGORIES[item.id] && (
                        <span className="text-xs bg-purple-900/50 border border-purple-500 text-purple-300 px-1.5 py-0.5 rounded">
                          {RELIC_CATEGORIES[item.id]}
                        </span>
                      )}
                      {item.autoConsume && item.effect.type !== 'relic' && (
                        <span className="text-xs bg-green-900/50 border border-green-600 text-green-400 px-1.5 py-0.5 rounded">
                          ⚡ Instant
                        </span>
                      )}
                      {upgradeLevel > 0 && item.effect.type === 'permanent' && (
                        <span className="text-xs bg-blue-900/50 border border-blue-500 text-blue-300 px-1.5 py-0.5 rounded">
                          Lv.{upgradeLevel}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-3">{item.description}</p>

                    {/* Price row */}
                    <div className="flex flex-col gap-1.5 mt-auto">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-xl" style={{ color: '#d4a030' }}>💰 {item.price}</span>
                        {(() => {
                          const owned = player.inventory
                            .filter(i => i.type === item.type && i.name === item.name)
                            .reduce((sum, i) => sum + i.quantity, 0);
                          return owned > 0 ? (
                            <span className="text-xs font-medium" style={{ color: '#8a6a4a' }}>
                              Owned: <span className="text-white font-bold">{owned}</span>
                            </span>
                          ) : null;
                        })()}
                        <Button size="sm" disabled={!affordable} onClick={() => onPurchase(item)} className="shrink-0">
                          {affordable ? 'Buy' : 'Too Expensive'}
                        </Button>
                      </div>
                      {nextPrice !== null && (
                        <div className="flex items-center gap-1.5 bg-blue-900/30 border border-blue-500/30 rounded px-2 py-1">
                          <span className="text-blue-300 text-xs font-bold">📈 Next upgrade:</span>
                          <span className="text-yellow-300 text-xs font-bold">💰 {nextPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-game-secondary">
        <Button variant="secondary" onClick={onClose} className="w-full">
          Leave Shop
        </Button>
      </div>
    </Modal>
  );
}
