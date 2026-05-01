'use client';

import { Player } from '@/lib/game-engine';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onUseItem: (itemId: string) => void;
  isInCombat?: boolean;
}

const itemEmojis: Record<string, string> = {
  healing_potion: '🧪',
  antidote: '💊',
  stat_upgrade: '⬆️',
  blessing_scroll: '📜',
  heartstone_amulet: '💎',
  iron_shield: '🛡️',
  mirror_shield: '🪞',
};

const ITEM_ORDER: Record<string, number> = {
  heal: 0, cure: 1, shield: 2, buff: 3, permanent: 4, relic: 5,
};

export default function InventoryPanel({ isOpen, onClose, player, onUseItem, isInCombat }: InventoryPanelProps) {
  const sortedInventory = [...player.inventory].sort((a, b) =>
    (ITEM_ORDER[a.effect.type] ?? 9) - (ITEM_ORDER[b.effect.type] ?? 9)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📦 Inventory">
      {player.inventory.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 text-lg">Your inventory is empty</p>
          <p className="text-gray-500 text-sm mt-2">Visit shops to purchase items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sortedInventory.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card variant="bordered" className="hover:border-game-gold transition-colors">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="text-4xl">{itemEmojis[item.type] || '📦'}</div>
                    {item.quantity > 1 && (
                      <span className="absolute -bottom-1 -right-1 bg-game-gold text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-game-gold">{item.name}</h3>
                      {item.quantity > 1 && <span className="text-xs text-gray-400">×{item.quantity}</span>}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                    {item.autoConsume ? (
                      <span className="text-xs text-green-400 italic">✅ Applied on purchase</span>
                    ) : (
                      <div>
                        <Button size="sm" onClick={() => onUseItem(item.id)} className="w-full">
                          {item.effect.type === 'heal' || item.effect.type === 'cure'
                            ? isInCombat ? '💊 Use Now' : '💊 Use'
                            : 'Use Item'}
                        </Button>
                        {item.effect.type === 'heal' && !isInCombat && (
                          <p className="text-[10px] text-gray-500 mt-1 text-center">Usable anytime</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-game-secondary">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Items:</span>
          <span className="text-game-gold font-bold text-xl">
            {player.inventory.reduce((sum, i) => sum + i.quantity, 0)}
          </span>
        </div>
      </div>
    </Modal>
  );
}
