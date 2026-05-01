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

  if (!isOpen) return null;

  const sortedInventory = [...player.inventory].sort((a, b) =>
    (ITEM_ORDER[a.effect.type] ?? 9) - (ITEM_ORDER[b.effect.type] ?? 9)
  );

  const totalSlots = Math.max(sortedInventory.length, GRID_COLS * MIN_ROWS);
  const slots = Array.from({ length: totalSlots }, (_, i) => sortedInventory[i] ?? null);

  const selectedItem = selectedId ? sortedInventory.find(i => i.id === selectedId) ?? null : null;

  function handleUse() {
    if (!selectedItem) return;
    onUseItem(selectedItem.id);
    // If item will be consumed (quantity 1), deselect
    if (selectedItem.quantity <= 1) setSelectedId(null);
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
              <h2 className="font-black text-lg" style={{ color: '#d4a030' }}>📦 Inventory</h2>
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
                  <span className="text-4xl opacity-30">📦</span>
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
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedId(isSelected ? null : item.id)}
                        className="relative aspect-square rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: isSelected ? 'rgba(90,62,40,0.8)' : 'rgba(30,18,6,0.8)',
                          border: isSelected ? '2px solid #d4a030' : '1px solid #3d2a14',
                          boxShadow: isSelected ? '0 0 12px rgba(212,160,48,0.3)' : undefined,
                        }}
                      >
                        <span className="text-2xl">{emoji}</span>
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
                      <span className="text-5xl">{itemEmojis[selectedItem.type] || '📦'}</span>
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
                  </motion.div>
                ) : (
                  <motion.div key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-2 p-4">
                    <span className="text-3xl opacity-20">👆</span>
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
