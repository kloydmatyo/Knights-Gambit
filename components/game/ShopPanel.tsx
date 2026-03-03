'use client';

import { Player, Item } from '@/lib/game-engine';
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
}

const itemEmojis: Record<string, string> = {
  healing_potion: '🧪',
  antidote: '💊',
  stat_upgrade: '⬆️',
  blessing_scroll: '📜',
  heartstone_amulet: '💎',
};

export default function ShopPanel({
  isOpen,
  onClose,
  player,
  items,
  onPurchase,
}: ShopPanelProps) {
  const canAfford = (price: number) => player.coins >= price;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏪 Shop">
      <div className="mb-4 p-3 bg-game-bg rounded">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Your Coins:</span>
          <span className="text-game-gold font-bold text-2xl">
            💰 {player.coins}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => {
          const affordable = canAfford(item.price);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                variant="bordered"
                className={cn(
                  'transition-all',
                  affordable
                    ? 'hover:border-game-gold cursor-pointer'
                    : 'opacity-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{itemEmojis[item.type] || '📦'}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-game-gold mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-game-gold font-bold text-xl">
                        💰 {item.price}
                      </span>
                      <Button
                        size="sm"
                        disabled={!affordable}
                        onClick={() => onPurchase(item)}
                      >
                        {affordable ? 'Buy' : 'Too Expensive'}
                      </Button>
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
