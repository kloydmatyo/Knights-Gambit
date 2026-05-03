'use client';

import { useState } from 'react';
import { Player, Item } from '@/lib/game-engine';
import { StatUpgradeCounts, WeaponUpgradeState, WeaponUpgrade } from '@/lib/game-engine/types';
import { calcUpgradePrice } from '@/lib/game-engine/StatUpgradeEngine';
import { WeaponUpgradeEngine } from '@/lib/game-engine/WeaponUpgradeEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';

// ── Exalted free-pick limits ──────────────────────────────────────────────
const EXALTED_LIMITS: Record<'consumables' | 'upgrades' | 'relics', number> = {
  consumables: 5,
  upgrades: 3,
  relics: 1,
};

interface ShopPanelProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  items: Item[];
  onPurchase: (item: Item) => void;
  title?: string;
  statUpgradeCounts?: StatUpgradeCounts;
  destinyState?: string | null;
  currentFloor?: number;
  upgradeState?: WeaponUpgradeState;
  onWeaponUpgrade?: (upgradeId: string) => { success: boolean; message: string };
  allRelics?: (Item & { locked?: boolean; lockedReason?: string })[];
}

const itemEmojis: Record<string, string> = {
  healing_potion: '🧪', antidote: '💊', stat_upgrade: '⬆️',
  blessing_scroll: '📜', heartstone_amulet: '💎', holy_water: '💧',
  blessing: '🙏', iron_shield: '🛡️', mirror_shield: '🪞',
};

const RELIC_EMOJIS: Record<string, string> = {
  relic_vampiric_fang: '🦷', relic_iron_heart: '🫀', relic_war_drum: '🥁',
  relic_stone_skin: '🪨', relic_cursed_idol: '🗿', relic_philosophers_stone: '💠',
  relic_death_mask: '💀', relic_golden_chalice: '🏆', relic_hourglass_shard: '⏳',
};

const RELIC_CATEGORIES: Record<string, string> = {
  relic_vampiric_fang: 'Combat', relic_iron_heart: 'Defense', relic_war_drum: 'Offense',
  relic_stone_skin: 'Defense', relic_cursed_idol: 'Risk/Reward',
  relic_philosophers_stone: 'Economy', relic_death_mask: 'Combat', relic_golden_chalice: 'Economy',
  relic_hourglass_shard: 'Utility',
};

type ShopTab = 'consumables' | 'upgrades' | 'relics' | 'weapons';

const TABS: { id: ShopTab; label: string; icon: string }[] = [
  { id: 'consumables', label: 'Consumables', icon: '🧪' },
  { id: 'upgrades',    label: 'Upgrades',    icon: '⬆️' },
  { id: 'relics',      label: 'Relics',       icon: '✨' },
  { id: 'weapons',     label: 'Weapons',      icon: '⚔️' },
];

function categorize(item: Item): ShopTab {
  if (item.effect.type === 'relic') return 'relics';
  if (item.effect.type === 'permanent' || item.effect.type === 'buff' || item.effect.type === 'upgrade_bonus') return 'upgrades';
  return 'consumables';
}

function getNextPrice(item: Item, counts?: StatUpgradeCounts): number | null {
  if (!counts || item.effect.type !== 'permanent' && item.effect.type !== 'upgrade_bonus') return null;
  if (!item.effect.stat) return null;
  const stat = item.effect.stat;
  if (!(stat in counts)) return null;
  const currentCount = counts[stat as keyof StatUpgradeCounts];
  if (currentCount === 0) return null;
  return calcUpgradePrice(stat as keyof StatUpgradeCounts, currentCount + 1);
}

// ── Single item card ──────────────────────────────────────────────────────
function ItemCard({ item, player, onPurchase, statUpgradeCounts }: {
  item: Item & { _originalPrice?: number }; player: Player;
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
          <div className="flex items-center gap-2">
            <span className="font-black text-base" style={{ color: item.price === 0 ? '#60c060' : '#d4a030' }}>
              {item.price === 0 ? 'FREE' : `💰 ${item.price}`}
            </span>
            {(item as any)._originalPrice !== undefined && (item as any)._originalPrice !== item.price && (
              <span className="text-xs line-through" style={{ color: '#6a4a2a' }}>
                💰 {(item as any)._originalPrice}
              </span>
            )}
          </div>
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
export default function ShopPanel({ isOpen, onClose, player, items, onPurchase, title = '🏪 Shop', statUpgradeCounts, destinyState, currentFloor = 1, upgradeState, onWeaponUpgrade, allRelics }: ShopPanelProps) {
  const [activeTab, setActiveTab] = useState<ShopTab>('consumables');
  // Exalted state is persisted in the store so closing/reopening the shop doesn't reset free picks
  const exaltedCategory = useStore(s => s.game.exaltedCategory);
  const exaltedPurchaseCount = useStore(s => s.game.exaltedPurchaseCount);
  const setExaltedCategory = useStore(s => s.setExaltedCategory);
  const incrementExaltedPurchaseCount = useStore(s => s.incrementExaltedPurchaseCount);

  const isExalted = destinyState === 'exalted';

  if (!isOpen) return null;

  const exaltedLimit = exaltedCategory ? EXALTED_LIMITS[exaltedCategory] : 0;
  const exaltedSlotsLeft = exaltedLimit - exaltedPurchaseCount;
  const exaltedDone = isExalted && exaltedCategory !== null && exaltedSlotsLeft <= 0;

  // Weapon upgrades available at this floor
  const availableWeaponUpgrades = upgradeState
    ? WeaponUpgradeEngine.getAvailableUpgrades(player.class, currentFloor, upgradeState)
    : [];
  const lockedWeaponUpgrades = upgradeState
    ? WeaponUpgradeEngine.getClassUpgrades(player.class).filter(u =>
        !upgradeState.purchasedUpgradeIds.includes(u.id) &&
        !availableWeaponUpgrades.find(a => a.id === u.id)
      )
    : [];
  const purchasedWeaponUpgrades = upgradeState
    ? WeaponUpgradeEngine.getPurchasedUpgrades(upgradeState)
    : [];

  // Apply destiny price modifier — exalted: free only for chosen category
  const priceMultiplier = destinyState === 'cursed' ? 3 : destinyState === 'favored' ? 0.75 : destinyState === 'unlucky' ? 1.25 : 1;
  const applyPriceMod = (item: Item, tab: ShopTab) => {
    const mult = isExalted
      ? (exaltedCategory === tab && !exaltedDone ? 0 : 1)
      : priceMultiplier;
    return { ...item, price: Math.round(item.price * mult), _originalPrice: item.price };
  };
  const modifiedItems = items.map(item =>
    applyPriceMod(item, categorize(item))
  ) as (Item & { _originalPrice?: number })[];
  // Apply the same modifier to allRelics so free picks work in the relics tab
  const modifiedRelics = allRelics?.map(r =>
    ({ ...applyPriceMod(r, 'relics'), locked: r.locked, lockedReason: r.lockedReason })
  );

  const canAfford = (price: number) => player.coins >= price;

  // Keep items in stable order - no sorting to prevent accidental purchases
  const tabItems = modifiedItems.filter(i => categorize(i) === activeTab);
  const tabCounts = {
    consumables: modifiedItems.filter(i => categorize(i) === 'consumables').length,
    upgrades:    modifiedItems.filter(i => categorize(i) === 'upgrades').length,
    relics:      modifiedRelics ? modifiedRelics.filter(r => !r.locked).length : modifiedItems.filter(i => categorize(i) === 'relics').length,
    weapons:     availableWeaponUpgrades.length,
  };

  // Wrapped purchase handlers that track exalted free picks
  const handlePurchaseWithTracking = (item: Item) => {
    const tab = categorize(item);
    const isFree = isExalted && exaltedCategory === tab && !exaltedDone;
    onPurchase(item);
    if (isFree) incrementExaltedPurchaseCount();
  };

  const handleWeaponUpgradeWithTracking = (upgradeId: string) => {
    const result = onWeaponUpgrade?.(upgradeId);
    if (result?.success && isExalted && exaltedCategory === 'upgrades' && !exaltedDone) {
      incrementExaltedPurchaseCount();
    }
    return result ?? { success: false, message: '' };
  };

  // Whether a given tab's items are currently free (exalted + chosen + slots left)
  const isTabFree = (tab: ShopTab) =>
    isExalted && exaltedCategory === tab && !exaltedDone;  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/75 no-select" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pointer-events-none safe-top safe-bottom">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="pointer-events-auto w-full flex flex-col rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl"
          style={{
            maxWidth: 'min(90vw, 640px)',
            height: 'clamp(400px, 75vh, 800px)',
            minHeight: 'min(480px, 80vh)',
            background: 'rgba(14,10,6,0.97)',
            border: '2px solid #5a3e28',
            boxShadow: '0 0 0 1px rgba(255,180,80,0.06), 0 24px 64px rgba(0,0,0,0.9)',
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3 shrink-0"
            style={{ borderBottom: '1px solid #3d2a14' }}>
            <h2 className="font-black text-base sm:text-lg" style={{ color: '#d4a030' }}>{title}</h2>
            <button onClick={onClose} className="text-xl sm:text-2xl leading-none transition-colors btn-touch"
              style={{ color: '#6a4a2a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4a030')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6a4a2a')}>×</button>
          </div>

          {/* Destiny banner */}
          {destinyState && destinyState !== 'balanced' && (
            <div className="shrink-0" style={{ borderBottom: '1px solid #3d2a14' }}>
              {isExalted ? (
                exaltedCategory === null ? (
                  <div className="px-5 py-4" style={{ background: 'rgba(180,140,0,0.12)' }}>
                    <p className="text-center font-black text-sm mb-3" style={{ color: '#f0c040' }}>
                      ✨ Exalted! Choose one category to receive FREE:
                    </p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {([
                        { key: 'consumables' as const, label: '5 Consumables', icon: '🧪' },
                        { key: 'upgrades'    as const, label: '3 Upgrades',    icon: '⬆️' },
                        { key: 'relics'      as const, label: '1 Relic',       icon: '✨' },
                      ]).map(opt => (
                        <motion.button key={opt.key}
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => { setExaltedCategory(opt.key); setActiveTab(opt.key); }}
                          className="px-4 py-2 rounded-xl font-black text-sm"
                          style={{
                            background: 'linear-gradient(180deg,#c8a010,#8a6a00)',
                            border: '1px solid #e8c030',
                            borderBottom: '3px solid #4a3a00',
                            color: '#fff8d0',
                          }}>
                          {opt.icon} {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-2 flex items-center justify-between text-xs font-bold"
                    style={{ background: 'rgba(180,140,0,0.15)', color: exaltedDone ? '#8a7040' : '#f0c040' }}>
                    <span>
                      ✨ {exaltedCategory === 'consumables' ? '🧪 Consumables' : exaltedCategory === 'upgrades' ? '⬆️ Upgrades' : '✨ Relics'} FREE
                    </span>
                    <div className="flex items-center gap-2">
                      {!exaltedDone && exaltedPurchaseCount === 0 && (
                        <button
                          onClick={() => setExaltedCategory(null)}
                          className="text-[10px] px-2 py-0.5 rounded font-bold transition-colors"
                          style={{ background: 'rgba(100,80,0,0.5)', border: '1px solid #8a6a00', color: '#d4a030' }}
                        >
                          ↩ Change
                        </button>
                      )}
                      <span style={{ color: exaltedDone ? '#ef4444' : '#f0c040' }}>
                        {exaltedDone ? '🔒 Limit reached' : `${exaltedSlotsLeft} free pick${exaltedSlotsLeft !== 1 ? 's' : ''} left`}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="px-5 py-2 text-xs font-bold text-center"
                  style={{
                    background: destinyState === 'cursed' ? 'rgba(180,0,0,0.2)' : destinyState === 'unlucky' ? 'rgba(180,100,0,0.2)' : 'rgba(0,140,0,0.2)',
                    color: destinyState === 'cursed' ? '#f06060' : destinyState === 'unlucky' ? '#f0a040' : '#60c060',
                  }}>
                  {destinyState === 'cursed' ? '💀 Cursed — Prices are tripled!' : destinyState === 'favored' ? '📈 Favored — 25% discount!' : '📉 Unlucky — Prices inflated!'}
                </div>
              )}
            </div>
          )}

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
          <div className="flex-1 overflow-y-auto p-4" style={{ minHeight: 320, borderTop: '1px solid #3d2a14' }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                {tabItems.length === 0 && activeTab !== 'weapons' && activeTab !== 'relics' ? (
                  <p className="col-span-full text-center py-8 text-sm" style={{ color: '#4a3020' }}>
                    Nothing available in this category.
                  </p>
                ) : activeTab === 'relics' && modifiedRelics ? (
                  // ── All relics: available + locked ──
                  <div className="col-span-full flex flex-col gap-3">
                    {modifiedRelics.filter(r => !r.locked).length === 0 && (
                      <p className="text-center py-4 text-sm" style={{ color: '#4a3020' }}>No relics available yet.</p>
                    )}
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                      {modifiedRelics.filter(r => !r.locked).map((relic, i) => (
                        <ItemCard key={relic.id} item={relic} player={player}
                          onPurchase={handlePurchaseWithTracking} statUpgradeCounts={statUpgradeCounts} />
                      ))}
                    </div>
                    {modifiedRelics.filter(r => r.locked).length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-2" style={{ color: '#4a3020' }}>Locked</p>
                        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                          {modifiedRelics.filter(r => r.locked).map(relic => (
                            <div key={relic.id} className="flex items-center gap-2 p-2 rounded-lg opacity-40"
                              style={{ background: 'rgba(20,12,4,0.6)', border: '1px solid #2a1a0a' }}>
                              <span className="text-xl grayscale">{RELIC_EMOJIS[relic.id] ?? '✨'}</span>
                              <div>
                                <p className="text-xs font-bold" style={{ color: '#6a4a2a' }}>{relic.name}</p>
                                <p className="text-[9px]" style={{ color: '#4a3020' }}>
                                  🔒 {relic.lockedReason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'weapons' ? (
                  <div className="col-span-full flex flex-col gap-3">
                    {/* Purchased */}
                    {purchasedWeaponUpgrades.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4a8a4a' }}>Owned</p>
                        <div className="flex flex-wrap gap-2">
                          {purchasedWeaponUpgrades.map(u => {
                            const tierColor = u.tier === 'legendary' ? '#d4a030' : u.tier === 'elite' ? '#b080e0' : u.tier === 'advanced' ? '#6090e0' : '#8a8a8a';
                            const statLines = [
                              u.effect.attackBonus   && `+${u.effect.attackBonus} ATK`,
                              u.effect.defenseBonus  && `+${u.effect.defenseBonus} DEF`,
                              u.effect.healthBonus   && `+${u.effect.healthBonus} HP`,
                              (u.effect as any).manaBonus && `+${(u.effect as any).manaBonus} MP`,
                              (u.effect as any).armorPenBonus && `+${(u.effect as any).armorPenBonus} Armor Pen`,
                              u.effect.critChanceBonus && `+${Math.round(u.effect.critChanceBonus * 100)}% Crit`,
                              u.effect.critDamageBonus && `+${Math.round(u.effect.critDamageBonus * 100)}% Crit Dmg`,
                              u.effect.specialAbility  && `🌟 ${u.effect.specialAbility.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
                            ].filter(Boolean) as string[];
                            return (
                              <div key={u.id} className="relative group">
                                <span
                                  className="text-xs px-2 py-1 rounded font-bold cursor-default"
                                  style={{ background: 'rgba(20,60,20,0.6)', border: '1px solid #2a6a2a', color: '#6adc6a' }}
                                >
                                  {u.emoji} {u.name}
                                </span>
                                {/* Tooltip — appears below, clamped to right edge */}
                                <div
                                  className="absolute top-full left-0 mt-1.5 z-50 hidden group-hover:block pointer-events-none"
                                  style={{ minWidth: 180, maxWidth: 220 }}
                                >
                                  <div className="rounded-xl p-2.5 shadow-2xl"
                                    style={{ background: 'rgba(14,10,6,0.97)', border: `1px solid ${tierColor}`, boxShadow: `0 0 16px rgba(0,0,0,0.9)` }}>
                                    <p className="font-black text-xs mb-1" style={{ color: tierColor }}>{u.emoji} {u.name}</p>
                                    <p className="text-[10px] mb-2 leading-relaxed" style={{ color: '#8a7060' }}>{u.description}</p>
                                    {statLines.length > 0 && (
                                      <div className="flex flex-col gap-0.5 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                        {statLines.map((line, i) => (
                                          <span key={i} className="text-[10px] font-bold" style={{ color: '#6adc6a' }}>{line}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Available */}
                    {availableWeaponUpgrades.length === 0 && purchasedWeaponUpgrades.length === 0 && (
                      <p className="text-center py-8 text-sm" style={{ color: '#4a3020' }}>
                        No weapon upgrades available yet — progress further to unlock.
                      </p>
                    )}
                    {availableWeaponUpgrades.length === 0 && purchasedWeaponUpgrades.length > 0 && lockedWeaponUpgrades.length === 0 && (
                      <p className="text-center py-4 text-sm" style={{ color: '#4a8a4a' }}>✅ All upgrades purchased!</p>
                    )}
                    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                      {availableWeaponUpgrades.map((upgrade, i) => {
                        const weaponFree = isExalted && exaltedCategory === 'upgrades' && !exaltedDone;
                        const effectiveCost = weaponFree ? 0 : upgrade.cost;
                        const affordable = player.coins >= effectiveCost;
                        const tierColor = upgrade.tier === 'legendary' ? '#d4a030' : upgrade.tier === 'elite' ? '#b080e0' : upgrade.tier === 'advanced' ? '#6090e0' : '#8a8a8a';
                        const tierBorder = upgrade.tier === 'legendary' ? '#8a6010' : upgrade.tier === 'elite' ? '#6a3a9a' : upgrade.tier === 'advanced' ? '#2a4a9a' : '#3d2a14';
                        return (
                          <motion.div key={upgrade.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn('flex flex-col rounded-xl p-3', affordable ? 'hover:brightness-110' : 'opacity-60')}
                            style={{ background: 'rgba(30,18,6,0.8)', border: `1px solid ${tierBorder}` }}>
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-3xl">{upgrade.emoji}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold capitalize"
                                style={{ background: 'rgba(10,6,2,0.8)', border: `1px solid ${tierBorder}`, color: tierColor }}>
                                {upgrade.tier}
                              </span>
                            </div>
                            <p className="font-bold text-sm mb-1" style={{ color: tierColor }}>{upgrade.name}</p>
                            <p className="text-xs leading-relaxed flex-1 mb-2" style={{ color: '#8a7060' }}>{upgrade.description}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {upgrade.effect.attackBonus && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3d2a14', color: '#e8a050' }}>+{upgrade.effect.attackBonus} ATK</span>}
                              {upgrade.effect.defenseBonus && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3d2a14', color: '#7ab4d4' }}>+{upgrade.effect.defenseBonus} DEF</span>}
                              {upgrade.effect.healthBonus && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3d2a14', color: '#6adc6a' }}>+{upgrade.effect.healthBonus} HP</span>}
                              {(upgrade.effect as any).manaBonus && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3b6fa0', color: '#7ab4d4' }}>+{(upgrade.effect as any).manaBonus} MP</span>}
                              {(upgrade.effect as any).armorPenBonus && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3d2a14', color: '#d4a070' }}>+{(upgrade.effect as any).armorPenBonus} Pen</span>}
                              {upgrade.effect.critChanceBonus && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3d2a14', color: '#d4a030' }}>+{Math.round(upgrade.effect.critChanceBonus * 100)}% Crit</span>}
                              {upgrade.effect.specialAbility && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #8a6010', color: '#d4a030' }}>🌟 Special</span>}
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <span className="font-black text-base" style={{ color: effectiveCost === 0 ? '#60c060' : '#d4a030' }}>
                                {effectiveCost === 0 ? 'FREE' : `💰 ${upgrade.cost}`}
                              </span>
                              <button onClick={() => handleWeaponUpgradeWithTracking(upgrade.id)} disabled={!affordable || !onWeaponUpgrade || (isExalted && exaltedCategory === 'upgrades' && exaltedDone)}
                                className="px-3 py-1.5 rounded-lg font-black text-xs transition-all active:scale-95 disabled:opacity-40"
                                style={affordable ? {
                                  background: 'linear-gradient(180deg,#c8621a,#8a3e0a)',
                                  border: '1px solid #e8821a', borderBottom: '3px solid #4a1e04',
                                  color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                } : { background: 'rgba(30,18,6,0.6)', border: '1px solid #3d2a14', color: '#6a4a2a' }}>
                                {affordable ? 'Upgrade' : 'Need Coins'}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Locked */}
                    {lockedWeaponUpgrades.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#4a3020' }}>Locked</p>
                        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                          {lockedWeaponUpgrades.map(u => (
                            <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg opacity-40"
                              style={{ background: 'rgba(20,12,4,0.6)', border: '1px solid #2a1a0a' }}>
                              <span className="text-xl grayscale">{u.emoji}</span>
                              <div>
                                <p className="text-xs font-bold" style={{ color: '#6a4a2a' }}>{u.name}</p>
                                <p className="text-[9px]" style={{ color: '#4a3020' }}>
                                  🔒 Floor {u.requiredFloor}{u.prerequisiteId ? ' · Needs prerequisite' : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : tabItems.map((item, i) => (
                  <ItemCard key={`${item.id}-${i}`} item={item} player={player}
                    onPurchase={handlePurchaseWithTracking} statUpgradeCounts={statUpgradeCounts} />
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
