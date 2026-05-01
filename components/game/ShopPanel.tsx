'use client';

import { useState } from 'react';
import { Player, Item } from '@/lib/game-engine';
import { StatUpgradeCounts } from '@/lib/game-engine/types';
import { calcUpgradePrice } from '@/lib/game-engine/StatUpgradeEngine';
import { motion, AnimatePresence } from 'framer-motion';
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
  healing_potion: '🧪', antidote: '💊', stat_upgrade: '⬆️',
  blessing_scroll: '📜', heartstone_amulet: '💎', holy_water: '💧',
  blessing: '🙏', iron_shield: '🛡️', mirror_shield: '🪞',
};

const RELIC_EMOJIS: Record<string, string> = {
  relic_vampiric_fang: '🦷', relic_iron_heart: '🫀', relic_war_drum: '🥁',
  relic_stone_skin: '🪨', relic_cursed_idol: '🗿', relic_philosophers_stone: '💠',
  relic_death_mask: '💀', relic_golden_chalice: '🏆',
};

const RELIC_CATEGORIES: Record<string, string> = {
  relic_vampiric_fang: 'Combat', relic_iron_heart: 'Defense', relic_war_drum: 'Offense',
  relic_stone_skin: 'Defense', relic_cursed_idol: 'Risk/Reward',
  relic_philosophers_stone: 'Economy', relic_death_mask: 'Combat', relic_golden_chalice: 'Economy',
};

type ShopTab = 'consumables' | 'upgrades' | 'relics';

const TABS: { id: ShopTab; label: string; icon: string }[] = [
  { id: 'consumables', label: 'Consumables', icon: '🧪' },
  { id: 'upgrades',    label: 'Upgrades',    icon: '⬆️' },
  { id: 'relics',      label: 'Relics',       icon: '✨' },
];

function categorize(item: Item): ShopTab {
  if (item.effect.type === 'relic') return 'relics';
  if (item.effect.type === 'permanent' || item.effect.type === 'buff') return 'upgrades';
  return 'consumables';
}

function getNextPrice(item: Item, counts?: StatUpgradeCounts): number | null {
  if (!counts || item.effect.type !== 'permanent' || !item.effect.stat) return null;
  const stat = item.effect.stat;
  if (stat !== 'attack' && stat !== 'defense' && stat !== 'health') return null;
  const currentCount = counts[stat];
  if (currentCount === 0) return null;
  return calcUpgradePrice(stat, currentCount + 1);
}

// ── Single item card ──────────────────────────────────────────────────────
function ItemCard({ item, player, onPurchase, statUpgradeCounts }: {
  item: Item; player: Player;
  onPurchase: (item: Item) => void;
  statUpgradeCounts?: StatUpgradeCounts;
}) {
  const affordable = player.coins >= item.price;
  const alreadyOwned = item.effect.type === 'relic' && (player.relics ?? []).includes(item.effect.relicId ?? item.id);
  const canBuy = affordable && !alreadyOwned;
  const nextPrice = getNextPrice(item, statUpgradeCounts);
  const upgradeLevel = statUpgradeCounts && item.effect.stat
    ? (statUpgradeCounts[item.effect.stat as keyof StatUpgradeCounts] ?? 0) : 0;
  const owned = player.inventory
    .filter(i => i.type === item.type && i.name === item.name)
    .reduce((sum, i) => sum + i.quantity, 0);
  const isRelic = item.effect.type === 'relic';
  const emoji = isRelic ? (RELIC_EMOJIS[item.id] ?? '✨') : (itemEmojis[item.type] || '📦');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col rounded-xl p-3 transition-all',
        canBuy ? 'cursor-pointer hover:brightness-110' : 'opacity-60'
      )}
      style={{
        background: canBuy
          ? (isRelic ? 'rgba(80,50,10,0.6)' : 'rgba(30,18,6,0.8)')
          : 'rgba(20,12,4,0.6)',
        border: canBuy
          ? (isRelic ? '1px solid #8a6010' : '1px solid #5a3e28')
          : '1px solid #2a1a0a',
        boxShadow: canBuy && isRelic ? '0 0 12px rgba(200,160,20,0.15)' : undefined,
      }}
    >
      {/* Icon + badges */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{emoji}</span>
        <div className="flex flex-wrap gap-1 justify-end">
          {item.autoConsume && item.effect.type !== 'relic' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(20,80,20,0.8)', border: '1px solid #2a6a2a', color: '#6adc6a' }}>
              ⚡ Instant
            </span>
          )}
          {isRelic && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(80,50,10,0.8)', border: '1px solid #8a6010', color: '#d4a030' }}>
              ✨ Relic
            </span>
          )}
          {isRelic && RELIC_CATEGORIES[item.id] && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(50,20,80,0.8)', border: '1px solid #6a3a9a', color: '#b080e0' }}>
              {RELIC_CATEGORIES[item.id]}
            </span>
          )}
          {upgradeLevel > 0 && item.effect.type === 'permanent' && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(10,30,80,0.8)', border: '1px solid #2a4a9a', color: '#6090e0' }}>
              Lv.{upgradeLevel}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <p className="font-bold text-sm mb-1 leading-tight" style={{ color: isRelic ? '#d4a030' : '#e8d0a0' }}>
        {item.name}
      </p>

      {/* Description */}
      <p className="text-xs leading-relaxed flex-1 mb-2" style={{ color: '#8a7060' }}>
        {item.description}
      </p>

      {/* Next upgrade */}
      {nextPrice !== null && (
        <div className="flex items-center gap-1 mb-2 px-2 py-1 rounded text-xs"
          style={{ background: 'rgba(10,20,50,0.6)', border: '1px solid #2a3a6a' }}>
          <span style={{ color: '#6090c0' }}>📈 Next:</span>
          <span className="font-bold" style={{ color: '#d4a030' }}>💰 {nextPrice}</span>
        </div>
      )}

      {/* Price + owned + buy */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex flex-col">
          <span className="font-black text-base" style={{ color: '#d4a030' }}>💰 {item.price}</span>
          {owned > 0 && (
            <span className="text-[10px]" style={{ color: '#6a5040' }}>
              Owned: <span className="text-white font-bold">{owned}</span>
            </span>
          )}
        </div>
        <button
          onClick={() => canBuy && onPurchase(item)}
          disabled={!canBuy}
          className="px-3 py-1.5 rounded-lg font-black text-xs transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={canBuy ? {
            background: 'linear-gradient(180deg,#c8621a,#8a3e0a)',
            border: '1px solid #e8821a',
            borderBottom: '3px solid #4a1e04',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          } : {
            background: 'rgba(30,18,6,0.6)',
            border: '1px solid #3d2a14',
            color: '#6a4a2a',
          }}
        >
          {alreadyOwned ? '✓ Owned' : affordable ? 'Buy' : 'Too Expensive'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ShopPanel ─────────────────────────────────────────────────────────
export default function ShopPanel({ isOpen, onClose, player, items, onPurchase, title = '🏪 Shop', statUpgradeCounts }: ShopPanelProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('consumables');

  if (!isOpen) return null;

  const canAfford = (price: number) => player.coins >= price;

  const sortedItems = [...items].sort((a, b) => {
    const aAfford = canAfford(a.price) ? 0 : 1;
    const bAfford = canAfford(b.price) ? 0 : 1;
    if (aAfford !== bAfford) return aAfford - bAfford;
    return a.price - b.price;
  });

  const tabItems = sortedItems.filter(i => categorize(i) === activeTab);
  const tabCounts = {
    consumables: sortedItems.filter(i => categorize(i) === 'consumables').length,
    upgrades:    sortedItems.filter(i => categorize(i) === 'upgrades').length,
    relics:      sortedItems.filter(i => categorize(i) === 'relics').length,
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/75" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="pointer-events-auto w-full flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            maxWidth: 640,
            maxHeight: '85vh',
            background: 'rgba(14,10,6,0.97)',
            border: '2px solid #5a3e28',
            boxShadow: '0 0 0 1px rgba(255,180,80,0.06), 0 24px 64px rgba(0,0,0,0.9)',
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ borderBottom: '1px solid #3d2a14' }}>
            <h2 className="font-black text-lg" style={{ color: '#d4a030' }}>{title}</h2>
            <button onClick={onClose} className="text-2xl leading-none transition-colors"
              style={{ color: '#6a4a2a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4a030')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6a4a2a')}>×</button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex shrink-0 px-4 pt-3 gap-1">
            {TABS.map(tab => {
              const count = tabCounts[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-t-xl font-bold text-sm transition-all"
                  style={isActive ? {
                    background: 'rgba(90,62,40,0.8)',
                    border: '1px solid #8a5c30',
                    borderBottom: '1px solid rgba(90,62,40,0.8)',
                    color: '#d4a030',
                    marginBottom: -1,
                    zIndex: 1,
                  } : {
                    background: 'rgba(20,12,4,0.6)',
                    border: '1px solid #3d2a14',
                    color: '#6a4a2a',
                  }}>
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] rounded-full px-1.5 font-black"
                      style={{ background: isActive ? '#d4a030' : '#3d2a14', color: isActive ? '#0e0804' : '#6a4a2a' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Item grid ── */}
          <div className="flex-1 overflow-y-auto p-4"
            style={{ borderTop: '1px solid #3d2a14' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {tabItems.length === 0 ? (
                  <p className="col-span-full text-center py-8 text-sm" style={{ color: '#4a3020' }}>
                    Nothing available in this category.
                  </p>
                ) : tabItems.map((item, i) => (
                  <ItemCard key={`${item.id}-${i}`} item={item} player={player}
                    onPurchase={onPurchase} statUpgradeCounts={statUpgradeCounts} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3"
            style={{ borderTop: '1px solid #3d2a14', background: 'rgba(10,6,2,0.8)' }}>
            <span className="font-black text-lg" style={{ color: '#d4a030' }}>💰 {player.coins}</span>
            <button onClick={onClose}
              className="px-6 py-2 rounded-xl font-black text-sm transition-all active:scale-95"
              style={{
                background: 'linear-gradient(180deg,#c8621a,#8a3e0a)',
                border: '1px solid #e8821a',
                borderBottom: '3px solid #4a1e04',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}>
              Leave Shop
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
