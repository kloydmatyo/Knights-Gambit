import { Item, StatUpgradeCounts } from './types';
import { ITEM_TYPES } from './constants';

// Base prices for the first purchase of each stat upgrade
const BASE_PRICES: Record<keyof StatUpgradeCounts, number> = {
  attack:    50,
  defense:   50,
  health:    40,
  armorPen:  60,
  critChance: 70,
  critDamage: 70,
};

// Stat gain per purchase (fixed)
const STAT_GAINS: Record<keyof StatUpgradeCounts, number> = {
  attack:     5,
  defense:    3,
  health:     20,
  armorPen:   5,
  critChance: 0.05,
  critDamage: 0.1,
};

// Exponential scaling: price = base * (1.4 ^ purchases)
const SCALE_FACTOR = 1.1;

/**
 * Calculate the current price for a stat upgrade given how many times
 * it has already been purchased.
 */
export function calcUpgradePrice(stat: keyof StatUpgradeCounts, count: number): number {
  return Math.round(BASE_PRICES[stat] * Math.pow(SCALE_FACTOR, count));
}

/**
 * Build all six stat-upgrade shop items with dynamically scaled prices.
 */
export function getStatUpgradeItems(counts: StatUpgradeCounts): Item[] {
  return [
    {
      id: ITEM_TYPES.STAT_UPGRADE,
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Attack Upgrade',
      description: `Permanently +${STAT_GAINS.attack} ATK — applied instantly`,
      price: calcUpgradePrice('attack', counts.attack),
      effect: { type: 'permanent', stat: 'attack', value: STAT_GAINS.attack },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: ITEM_TYPES.STAT_UPGRADE,
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Defense Upgrade',
      description: `Permanently +${STAT_GAINS.defense} DEF — applied instantly`,
      price: calcUpgradePrice('defense', counts.defense),
      effect: { type: 'permanent', stat: 'defense', value: STAT_GAINS.defense },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: ITEM_TYPES.HEARTSTONE_AMULET,
      type: ITEM_TYPES.HEARTSTONE_AMULET,
      name: 'Health Upgrade',
      description: `Permanently +${STAT_GAINS.health} Max HP — applied instantly`,
      price: calcUpgradePrice('health', counts.health),
      effect: { type: 'permanent', stat: 'health', value: STAT_GAINS.health },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: 'armor_pen_upgrade',
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Armor Pen Upgrade',
      description: `Permanently +${STAT_GAINS.armorPen} Armor Pen — applied instantly`,
      price: calcUpgradePrice('armorPen', counts.armorPen),
      effect: { type: 'upgrade_bonus', stat: 'armorPen', value: STAT_GAINS.armorPen },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: 'crit_chance_upgrade',
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Crit Chance Upgrade',
      description: `Permanently +${Math.round(STAT_GAINS.critChance * 100)}% Crit Chance — applied instantly`,
      price: calcUpgradePrice('critChance', counts.critChance),
      effect: { type: 'upgrade_bonus', stat: 'critChance', value: STAT_GAINS.critChance },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: 'crit_damage_upgrade',
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Crit Damage Upgrade',
      description: `Permanently +${Math.round(STAT_GAINS.critDamage * 100)}% Crit Damage — applied instantly`,
      price: calcUpgradePrice('critDamage', counts.critDamage),
      effect: { type: 'upgrade_bonus', stat: 'critDamage', value: STAT_GAINS.critDamage },
      quantity: 1,
      autoConsume: true,
    },
  ];
}

/**
 * Increment the count for the stat that was just upgraded.
 * Returns a new counts object (immutable).
 */
export function incrementStatCount(
  counts: StatUpgradeCounts,
  stat: keyof StatUpgradeCounts
): StatUpgradeCounts {
  return { ...counts, [stat]: counts[stat] + 1 };
}

/**
 * Initial zeroed counts.
 */
export function createInitialStatCounts(): StatUpgradeCounts {
  return { attack: 0, defense: 0, health: 0, armorPen: 0, critChance: 0, critDamage: 0 };
}
