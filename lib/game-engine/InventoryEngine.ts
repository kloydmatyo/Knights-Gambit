import { Player, Item, ItemType } from './types';
import { ITEM_TYPES, SHOP_PRICES } from './constants';
import { CharacterEngine } from './CharacterEngine';

export class InventoryEngine {
  /**
   * Get all available shop items
   */
  static getShopItems(): Item[] {
    return [
      {
        id: ITEM_TYPES.HEALING_POTION,
        type: ITEM_TYPES.HEALING_POTION,
        name: 'Healing Potion',
        description: 'Restores 30 HP',
        price: SHOP_PRICES.HEALING_POTION,
        effect: { type: 'heal', value: 30 },
        quantity: 1,
        autoConsume: false,
      },
      {
        id: ITEM_TYPES.ANTIDOTE,
        type: ITEM_TYPES.ANTIDOTE,
        name: 'Antidote',
        description: 'Cures poison and burn',
        price: SHOP_PRICES.ANTIDOTE,
        effect: { type: 'cure' },
        quantity: 1,
        autoConsume: false,
      },
      {
        id: ITEM_TYPES.HOLY_WATER,
        type: ITEM_TYPES.HOLY_WATER,
        name: 'Holy Water',
        description: 'Removes the Curse debuff',
        price: SHOP_PRICES.HOLY_WATER,
        effect: { type: 'cure_curse' },
        quantity: 1,
        autoConsume: false,
      },
      {
        id: ITEM_TYPES.BLESSING,
        type: ITEM_TYPES.BLESSING,
        name: 'Blessing',
        description: 'Removes Curse and restores stats — applied instantly',
        price: SHOP_PRICES.BLESSING,
        effect: { type: 'cure_curse' },
        quantity: 1,
        autoConsume: true,
      },
      {
        id: ITEM_TYPES.STAT_UPGRADE,
        type: ITEM_TYPES.STAT_UPGRADE,
        name: 'Stat Upgrade',
        description: 'Permanently increases ATK by 5 — applied instantly',
        price: SHOP_PRICES.STAT_UPGRADE,
        effect: { type: 'permanent', stat: 'attack', value: 5 },
        quantity: 1,
        autoConsume: true,
      },
      {
        id: ITEM_TYPES.BLESSING_SCROLL,
        type: ITEM_TYPES.BLESSING_SCROLL,
        name: 'Blessing Scroll',
        description: 'Grants blessed status for 5 turns — applied instantly',
        price: SHOP_PRICES.BLESSING_SCROLL,
        effect: { type: 'buff', duration: 5 },
        quantity: 1,
        autoConsume: true,
      },
      {
        id: ITEM_TYPES.HEARTSTONE_AMULET,
        type: ITEM_TYPES.HEARTSTONE_AMULET,
        name: 'Heartstone Amulet',
        description: 'Increases max HP by 20 — applied instantly',
        price: SHOP_PRICES.HEARTSTONE_AMULET,
        effect: { type: 'permanent', stat: 'health', value: 20 },
        quantity: 1,
        autoConsume: true,
      },
    ];
  }

  /**
   * Get special shop items (rare, powerful, expensive)
   */
  static getSpecialShopItems(): Item[] {
    return [
      {
        id: ITEM_TYPES.HEALING_POTION,
        type: ITEM_TYPES.HEALING_POTION,
        name: 'Mega Healing Potion',
        description: 'Fully restores all HP',
        price: 80,
        effect: { type: 'heal', value: 9999 },
        quantity: 1,
        autoConsume: false,
      },
      {
        id: ITEM_TYPES.STAT_UPGRADE,
        type: ITEM_TYPES.STAT_UPGRADE,
        name: 'Warrior\'s Tome',
        description: 'Permanently grants +10 ATK — applied instantly',
        price: 120,
        effect: { type: 'permanent', stat: 'attack', value: 10 },
        quantity: 1,
        autoConsume: true,
      },
      {
        id: ITEM_TYPES.STAT_UPGRADE,
        type: ITEM_TYPES.STAT_UPGRADE,
        name: 'Iron Skin Scroll',
        description: 'Permanently grants +8 DEF — applied instantly',
        price: 100,
        effect: { type: 'permanent', stat: 'defense', value: 8 },
        quantity: 1,
        autoConsume: true,
      },
      {
        id: ITEM_TYPES.HEARTSTONE_AMULET,
        type: ITEM_TYPES.HEARTSTONE_AMULET,
        name: 'Titan\'s Heart',
        description: 'Increases max HP by 50 — applied instantly',
        price: 150,
        effect: { type: 'permanent', stat: 'health', value: 50 },
        quantity: 1,
        autoConsume: true,
      },
      {
        id: ITEM_TYPES.HOLY_WATER,
        type: ITEM_TYPES.HOLY_WATER,
        name: 'Sacred Holy Water',
        description: 'Removes all debuffs (curse, poison, burn)',
        price: 90,
        effect: { type: 'cure_curse' },
        quantity: 1,
        autoConsume: false,
      },
      {
        id: ITEM_TYPES.BLESSING_SCROLL,
        type: ITEM_TYPES.BLESSING_SCROLL,
        name: 'Divine Blessing',
        description: 'Grants blessed status for 10 turns — applied instantly',
        price: 110,
        effect: { type: 'buff', duration: 10 },
        quantity: 1,
        autoConsume: true,
      },
    ];
  }
  static addItem(player: Player, item: Item): Player {
    // Stack key: same type + same name = same slot
    const stackKey = `${item.type}::${item.name}`;
    const existing = player.inventory.find((i) => `${i.type}::${i.name}` === stackKey);

    if (existing) {
      return {
        ...player,
        inventory: player.inventory.map((i) =>
          `${i.type}::${i.name}` === stackKey
            ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
            : i
        ),
      };
    }

    return {
      ...player,
      inventory: [...player.inventory, { ...item, id: stackKey, quantity: item.quantity ?? 1 }],
    };
  }

  /**
   * Remove item from inventory (decrements stack; removes slot when qty reaches 0)
   */
  static removeItem(player: Player, itemId: string): Player {
    return {
      ...player,
      inventory: player.inventory
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0),
    };
  }

  /**
   * Use a manual item from inventory (decrements stack on success)
   */
  static useItem(player: Player, itemId: string): { player: Player; message: string } {
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item) return { player, message: 'Item not found!' };

    const { player: afterEffect, message } = this.applyEffect(player, item);
    const afterRemove = this.removeItem(afterEffect, itemId);

    return { player: afterRemove, message: `Used ${message}` };
  }

  /**
   * Purchase item from shop.
   * Auto-consume items are applied immediately and never stored in inventory.
   * Manual items are added to the inventory stack for later use.
   */
  static purchaseItem(
    player: Player,
    item: Item
  ): { player: Player; success: boolean; message: string } {
    if (player.coins < item.price) {
      return { player, success: false, message: 'Not enough coins!' };
    }

    let updatedPlayer = CharacterEngine.removeCoins(player, item.price);

    if (item.autoConsume) {
      // Apply effect immediately — no inventory entry created
      const { player: consumed, message } = this.applyEffect(updatedPlayer, item);
      return { player: consumed, success: true, message };
    }

    // Manual item — stack in inventory
    const finalPlayer = this.addItem(updatedPlayer, { ...item, quantity: 1 });
    return {
      player: finalPlayer,
      success: true,
      message: `Purchased ${item.name} for ${item.price} coins!`,
    };
  }

  /**
   * Apply an item's effect to a player without touching inventory.
   * Used internally for auto-consume and by useItem.
   */
  static applyEffect(player: Player, item: Item): { player: Player; message: string } {
    let updatedPlayer = player;
    let message = '';

    switch (item.effect.type) {
      case 'heal':
        updatedPlayer = CharacterEngine.healPlayer(player, item.effect.value || 0);
        message = `${item.name} restored ${item.effect.value} HP!`;
        break;
      case 'cure':
        updatedPlayer = {
          ...player,
          statusEffects: player.statusEffects.filter(
            (e) => e.type !== 'poison' && e.type !== 'burn'
          ),
        };
        message = `${item.name} cured all negative effects!`;
        break;
      case 'cure_curse':
        updatedPlayer = {
          ...player,
          statusEffects: player.statusEffects.filter((e) => e.type !== 'cursed'),
        };
        message = `${item.name} lifted the curse!`;
        break;
      case 'buff':
        updatedPlayer = {
          ...player,
          statusEffects: [
            ...player.statusEffects,
            { type: 'blessed' as const, duration: item.effect.duration || 5 },
          ],
        };
        message = `${item.name} — you feel blessed!`;
        break;
      case 'permanent':
        if (item.effect.stat) {
          updatedPlayer = CharacterEngine.upgradeStat(
            player,
            item.effect.stat,
            item.effect.value || 0
          );
          message = `${item.name} permanently increased ${item.effect.stat}!`;
        }
        break;
    }

    return { player: updatedPlayer, message };
  }

  /**
   * Get item count (total quantity across all stacks of this type)
   */
  static getItemCount(player: Player, itemType: ItemType): number {
    return player.inventory
      .filter((item) => item.type === itemType)
      .reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Check if player has item
   */
  static hasItem(player: Player, itemType: ItemType): boolean {
    return this.getItemCount(player, itemType) > 0;
  }
}
