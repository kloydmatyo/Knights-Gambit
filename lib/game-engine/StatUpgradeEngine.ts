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

// Base stat gain for the first purchase
const BASE_STAT_GAINS: Record<keyof StatUpgradeCounts, number> = {
  attack:     5,
  defense:    3,
  health:     20,
  armorPen:   5,
  critChance: 0.05,
  critDamage: 0.1,
};

// Stat gain scaling: each purchase increases the gain slightly
const STAT_GAIN_SCALE = 1.1; // 15% increase per purchase

/**
 * Calculate the stat gain for a given purchase count.
 * First purchase gives base amount, subsequent purchases give more.
 * Only scales for attack, defense, and health (not capped stats).
 */
export function calcStatGain(stat: keyof StatUpgradeCounts, count: number): number {
  const baseGain = BASE_STAT_GAINS[stat];
  
  // Don't scale capped stats (armor pen, crit chance, crit damage)
  if (stat === 'armorPen' || stat === 'critChance' || stat === 'critDamage') {
    return baseGain;
  }
  
  // Scale uncapped stats (attack, defense, health)
  const scaledGain = baseGain * Math.pow(STAT_GAIN_SCALE, count);
  return Math.round(scaledGain);
}

// Exponential scaling: price = base * (1.2 ^ purchases)
const SCALE_FACTOR = 1.2;

/**
 * Calculate the current price for a stat upgrade given how many times
 * it has already been purchased.
 */
export function calcUpgradePrice(stat: keyof StatUpgradeCounts, count: number): number {
  return Math.round(BASE_PRICES[stat] * Math.pow(SCALE_FACTOR, count));
}

/**
 * Build all six stat-upgrade shop items with dynamically scaled prices and gains.
 */
export function getStatUpgradeItems(counts: StatUpgradeCounts): Item[] {
  return [
    {
      id: ITEM_TYPES.STAT_UPGRADE,
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Attack Upgrade',
      description: `Permanently +${calcStatGain('attack', counts.attack)} ATK — applied instantly`,
      price: calcUpgradePrice('attack', counts.attack),
      effect: { type: 'permanent', stat: 'attack', value: calcStatGain('attack', counts.attack) },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: ITEM_TYPES.STAT_UPGRADE,
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Defense Upgrade',
      description: `Permanently +${calcStatGain('defense', counts.defense)} DEF — applied instantly`,
      price: calcUpgradePrice('defense', counts.defense),
      effect: { type: 'permanent', stat: 'defense', value: calcStatGain('defense', counts.defense) },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: ITEM_TYPES.HEARTSTONE_AMULET,
      type: ITEM_TYPES.HEARTSTONE_AMULET,
      name: 'Health Upgrade',
      description: `Permanently +${calcStatGain('health', counts.health)} Max HP — applied instantly`,
      price: calcUpgradePrice('health', counts.health),
      effect: { type: 'permanent', stat: 'health', value: calcStatGain('health', counts.health) },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: 'armor_pen_upgrade',
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Armor Pen Upgrade',
      description: `Permanently +${calcStatGain('armorPen', counts.armorPen)} Armor Pen — applied instantly`,
      price: calcUpgradePrice('armorPen', counts.armorPen),
      effect: { type: 'upgrade_bonus', stat: 'armorPen', value: calcStatGain('armorPen', counts.armorPen) },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: 'crit_chance_upgrade',
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Crit Chance Upgrade',
      description: `Permanently +${Math.round(calcStatGain('critChance', counts.critChance) * 100)}% Crit Chance — applied instantly`,
      price: calcUpgradePrice('critChance', counts.critChance),
      effect: { type: 'upgrade_bonus', stat: 'critChance', value: calcStatGain('critChance', counts.critChance) },
      quantity: 1,
      autoConsume: true,
    },
    {
      id: 'crit_damage_upgrade',
      type: ITEM_TYPES.STAT_UPGRADE,
      name: 'Crit Damage Upgrade',
      description: `Permanently +${Math.round(calcStatGain('critDamage', counts.critDamage) * 100)}% Crit Damage — applied instantly`,
      price: calcUpgradePrice('critDamage', counts.critDamage),
      effect: { type: 'upgrade_bonus', stat: 'critDamage', value: calcStatGain('critDamage', counts.critDamage) },
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
