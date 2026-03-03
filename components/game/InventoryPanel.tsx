'use client';

import { Player, Item } from '@/lib/game-engine';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onUseItem: (itemId: string) => void;
}

const itemEmojis: Record<string, string> = {
  healing_potion: '🧪',
  antidote: '💊',
  stat_upgrade: '⬆️',
  blessing_scroll: '📜',
  heartstone_amulet: '💎',
};

export default function InventoryPanel({
  isOpen,
  onClose,
  player,
  onUseItem,
}: InventoryPanelProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📦 Inventory">
      {player.inventory.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-400 text-lg">Your inventory is empty</p>
          <p className="text-gray-500 text-sm mt-2">
            Visit shops to purchase items!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {player.inventory.map((item, index) => (
            <motion.div
              key={`${item.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="bordered" className="hover:border-game-gold transition-colors">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{itemEmojis[item.type] || '📦'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-game-gold mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {item.description}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => onUseItem(item.id)}
                      className="w-full"
                    >
                      Use Item
                    </Button>
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
            {player.inventory.length}
          </span>
        </div>
      </div>
    </Modal>
  );
}
