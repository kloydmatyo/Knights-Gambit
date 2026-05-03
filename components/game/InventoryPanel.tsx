'use client';

import { useState } from 'react';
import { Player } from '@/lib/game-engine';
import { motion, AnimatePresence } from 'framer-motion';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onUseItem: (itemId: string) => void;
  isInCombat?: boolean;
}

// Helper function to get item icon image path
function getItemIconPath(itemId: string, itemType: string): string | null {
  const iconMap: Record<string, string> = {
    // Consumables
    healing_potion: 'healing_pot.png',
    antidote: 'antidote.png',
    holy_water: 'holy_water.png',
    // Upgrades
    stat_upgrade: 'upgrade.png',
    attack: 'atk_upgrade.png',
    defense: 'def_upgrade.png',
    health: 'hp_upgrade.png',
    weapon_upgrade: 'weapon_upgrade.png',
    // Items
    blessing_scroll: 'blessing.png',
    heartstone_amulet: 'heartstone_amulet.png',
    blessing: 'blessing.png',
    // Relics
    relic_vampiric_fang: 'vampiric_fang.png',
    relic_iron_heart: 'iron_heart.png',
    relic_war_drum: 'war_drum.png',
    relic_stone_skin: 'stone_skin.png',
    relic_cursed_idol: 'cursed_idol.png',
    relic_philosophers_stone: "philosopher's_stone.png",
    relic_death_mask: 'death_mask.png',
    relic_golden_chalice: 'golden_chalice.png',
    relic_hourglass_shard: 'hourglass_shard.png',
    // Class icons (for potential use in class-specific items)
    knight: 'knight.png',
    mage: 'mage.png',
    archer: 'archer.png',
    assassin: 'assassin.png',
    cleric: 'cleric.png',
    barbarian: 'warrior.png',
    warrior: 'warrior.png',
  };
  
  const filename = iconMap[itemId] || iconMap[itemType];
  return filename ? `/item_icons/${filename}` : null;
}

const itemEmojis: Record<string, string> = {
  healing_potion: '🧪', antidote: '💊', stat_upgrade: '⬆️',
  blessing_scroll: '📜', heartstone_amulet: '💎', holy_water: '💧',
  blessing: '🙏', iron_shield: '🛡️', mirror_shield: '🪞',
};

const ITEM_ORDER: Record<string, number> = {
  heal: 0, cure: 1, shield: 2, buff: 3, permanent: 4, relic: 5,
};

// Fixed grid size — show empty slots to fill out the grid
const GRID_COLS = 5;
const MIN_ROWS = 3;

export default function InventoryPanel({ isOpen, onClose, player, onUseItem, isInCombat }: InventoryPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState(false);

  if (!isOpen) return null;

  const sortedInventory = [...player.inventory].sort((a, b) =>
    (ITEM_ORDER[a.effect.type] ?? 9) - (ITEM_ORDER[b.effect.type] ?? 9)
  );

  const totalSlots = Math.max(sortedInventory.length, GRID_COLS * MIN_ROWS);
  const slots = Array.from({ length: totalSlots }, (_, i) => sortedInventory[i] ?? null);

  const selectedItem = selectedId ? sortedInventory.find(i => i.id === selectedId) ?? null : null;

  // Returns a warning string if using this item would be wasteful, null otherwise
  function getWasteWarning(item: typeof selectedItem): string | null {
    if (!item) return null;
    if (item.effect.type === 'heal') {
      const missing = player.maxHealth - player.health;
      const healVal = item.effect.value ?? 0;
      if (missing === 0) return "You're already at full HP!";
      if (missing < healVal * 0.25) return `Only ${missing} HP missing — most of this potion will be wasted.`;
    }
    if (item.effect.type === 'shield') {
      const hasShield = player.statusEffects.some(e => e.type === 'shield');
      if (hasShield) return 'You already have an active shield — using this will replace it.';
    }
    return null;
  }

  const wasteWarning = getWasteWarning(selectedItem);

  function handleUse() {
    if (!selectedItem) return;
    // If there's a warning and we haven't confirmed yet, enter confirm mode
    if (wasteWarning && !pendingConfirm) {
      setPendingConfirm(true);
      return;
    }
    onUseItem(selectedItem.id);
    setPendingConfirm(false);
    if (selectedItem.quantity <= 1) setSelectedId(null);
  }

  function handleSelect(id: string) {
    setSelectedId(prev => prev === id ? null : id);
    setPendingConfirm(false);
  }

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
            maxWidth: 560,
            maxHeight: '80vh',
            background: 'rgba(14,10,6,0.97)',
            border: '2px solid #5a3e28',
            boxShadow: '0 0 0 1px rgba(255,180,80,0.06), 0 24px 64px rgba(0,0,0,0.9)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ borderBottom: '1px solid #3d2a14' }}>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/item_icons/inventory.png" 
                alt="Inventory"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.emoji-fallback')) {
                    const span = document.createElement('span');
                    span.className = 'emoji-fallback text-lg';
                    span.textContent = '📦';
                    parent.appendChild(span);
                  }
                }}
              />
              <h2 className="font-black text-lg" style={{ color: '#d4a030' }}>Inventory</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3d2a14', color: '#8a6a4a' }}>
                {sortedInventory.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>
            <button onClick={onClose} className="text-2xl leading-none transition-colors"
              style={{ color: '#6a4a2a' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#d4a030')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6a4a2a')}>×</button>
          </div>

          {/* Body: grid + detail panel */}
          <div className="flex flex-1 min-h-0">

            {/* ── Left: item grid ── */}
            <div className="flex-1 overflow-y-auto p-3">
              {sortedInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2">
                  <p className="text-sm" style={{ color: '#4a3020' }}>Your bag is empty</p>
                </div>
              ) : (
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
                  {slots.map((item, idx) => {
                    if (!item) {
                      // Empty slot
                      return (
                        <div key={`empty-${idx}`} className="aspect-square rounded-lg"
                          style={{ background: 'rgba(20,12,4,0.4)', border: '1px solid #2a1a0a' }} />
                      );
                    }
                    const isSelected = selectedId === item.id;
                    const emoji = itemEmojis[item.type] || '📦';
                    const iconPath = getItemIconPath(item.id, item.type);
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(item.id)}
                        className="relative aspect-square rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: isSelected ? 'rgba(90,62,40,0.8)' : 'rgba(30,18,6,0.8)',
                          border: isSelected ? '2px solid #d4a030' : '1px solid #3d2a14',
                          boxShadow: isSelected ? '0 0 12px rgba(212,160,48,0.3)' : undefined,
                        }}
                      >
                        {iconPath ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={iconPath} 
                            alt={item.name}
                            className="w-8 h-8 object-contain"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.emoji-fallback')) {
                                const span = document.createElement('span');
                                span.className = 'emoji-fallback text-2xl';
                                span.textContent = emoji;
                                parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-2xl">{emoji}</span>
                        )}
                        {/* Quantity badge */}
                        {item.quantity > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 text-[9px] font-black rounded px-1 leading-tight"
                            style={{ background: '#d4a030', color: '#0e0804' }}>
                            x{item.quantity}
                          </span>
                        )}
                        {/* Selected ring */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-lg"
                            style={{ border: '2px solid #d4a030', pointerEvents: 'none' }} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Right: detail panel ── */}
            <div className="shrink-0 flex flex-col"
              style={{ width: 180, borderLeft: '1px solid #3d2a14', background: 'rgba(10,6,2,0.6)' }}>
              <AnimatePresence mode="wait">
                {selectedItem ? (
                  <motion.div key={selectedItem.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex flex-col h-full p-4 gap-3">
                    {/* Big icon */}
                    <div className="flex items-center justify-center rounded-xl py-4"
                      style={{ background: 'rgba(30,18,6,0.8)', border: '1px solid #3d2a14' }}>
                      {getItemIconPath(selectedItem.id, selectedItem.type) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={getItemIconPath(selectedItem.id, selectedItem.type)!} 
                          alt={selectedItem.name}
                          className="w-20 h-20 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent && !parent.querySelector('.emoji-fallback')) {
                              const span = document.createElement('span');
                              span.className = 'emoji-fallback text-5xl';
                              span.textContent = itemEmojis[selectedItem.type] || '📦';
                              parent.appendChild(span);
                            }
                          }}
                        />
                      ) : (
                        <span className="text-5xl">{itemEmojis[selectedItem.type] || '📦'}</span>
                      )}
                    </div>

                    {/* Name + qty */}
                    <div>
                      <p className="font-black text-sm leading-tight" style={{ color: '#d4a030' }}>
                        {selectedItem.name}
                      </p>
                      {selectedItem.quantity > 1 && (
                        <p className="text-xs mt-0.5" style={{ color: '#8a6a4a' }}>x{selectedItem.quantity}</p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs leading-relaxed flex-1" style={{ color: '#8a7060' }}>
                      {selectedItem.description}
                    </p>

                    {/* Context hint */}
                    {selectedItem.effect.type === 'heal' && !isInCombat && (
                      <p className="text-[10px]" style={{ color: '#4a3020' }}>Usable anytime</p>
                    )}

                    {/* Use button */}
                    {selectedItem.autoConsume ? (
                      <p className="text-xs italic" style={{ color: '#4a8a4a' }}>✅ Applied on purchase</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Waste warning */}
                        {wasteWarning && (
                          <div className="rounded-lg px-2.5 py-2 text-[10px] leading-snug font-bold"
                            style={{ background: 'rgba(180,100,0,0.2)', border: '1px solid #8a5010', color: '#f0a040' }}>
                            ⚠️ {wasteWarning}
                          </div>
                        )}
                        {pendingConfirm ? (
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] text-center font-bold" style={{ color: '#f0a040' }}>Use anyway?</p>
                            <div className="flex gap-1.5">
                              <button onClick={handleUse}
                                className="flex-1 py-1.5 rounded-lg font-black text-xs transition-all active:scale-95"
                                style={{
                                  background: 'linear-gradient(180deg,#c8621a,#8a3e0a)',
                                  border: '1px solid #e8821a',
                                  borderBottom: '2px solid #4a1e04',
                                  color: 'white',
                                }}>
                                Yes
                              </button>
                              <button onClick={() => setPendingConfirm(false)}
                                className="flex-1 py-1.5 rounded-lg font-black text-xs transition-all active:scale-95"
                                style={{
                                  background: 'rgba(30,18,6,0.8)',
                                  border: '1px solid #3d2a14',
                                  color: '#8a6a4a',
                                }}>
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={handleUse}
                            className="w-full py-2 rounded-xl font-black text-sm transition-all active:scale-95"
                            style={{
                              background: 'linear-gradient(180deg,#c8621a,#8a3e0a)',
                              border: '1px solid #e8821a',
                              borderBottom: '3px solid #4a1e04',
                              color: 'white',
                              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                            }}>
                            {selectedItem.effect.type === 'heal' || selectedItem.effect.type === 'cure'
                              ? isInCombat ? '💊 Use Now' : '💊 Use'
                              : 'Use Item'}
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-2 p-4">
                    <p className="text-xs text-center" style={{ color: '#3a2a1a' }}>
                      Select an item to see details
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center justify-end px-5 py-3"
            style={{ borderTop: '1px solid #3d2a14', background: 'rgba(10,6,2,0.8)' }}>
            <button onClick={onClose}
              className="px-6 py-2 rounded-xl font-black text-sm transition-all active:scale-95"
              style={{
                background: 'linear-gradient(180deg,#c8621a,#8a3e0a)',
                border: '1px solid #e8821a',
                borderBottom: '3px solid #4a1e04',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}>
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
