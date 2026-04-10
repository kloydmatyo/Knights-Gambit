import { Enemy, EnemyType, EnemyBehavior } from './types';
import { ENEMY_STATS, ENEMY_TYPES, BOSS_STATS, DUNGEON_BOSS_NAMES, getDungeonNumber, getFloorInDungeon } from './constants';
import { randomInt } from '@/lib/utils';

// Behavior pools per enemy type — weighted toward thematic fits
const BEHAVIOR_POOLS: Record<string, EnemyBehavior[]> = {
  goblin:   ['berserker', 'berserker', 'glass_cannon', 'normal'],
  orc:      ['defender', 'defender', 'berserker', 'normal'],
  skeleton: ['regenerator', 'regenerator', 'poisoner', 'normal'],
  troll:    ['defender', 'regenerator', 'defender', 'normal'],
  slime1:   ['poisoner', 'normal', 'normal'],
  slime2:   ['regenerator', 'poisoner', 'normal'],
  slime3:   ['glass_cannon', 'berserker', 'normal'],
};

function pickBehavior(type: string): EnemyBehavior {
  const pool = BEHAVIOR_POOLS[type] ?? ['normal'];
  return pool[randomInt(0, pool.length - 1)];
}

function behaviorName(behavior: EnemyBehavior): string {
  switch (behavior) {
    case 'berserker':   return 'Berserker';
    case 'regenerator': return 'Regenerator';
    case 'defender':    return 'Defender';
    case 'glass_cannon':return 'Savage';
    case 'poisoner':    return 'Venomous';
    default:            return '';
  }
}

export class EnemyEngine {
  /**
   * Generate a random enemy scaled to floor (accounts for dungeon number)
   */
  static generateEnemy(floor: number): Enemy {
    const enemyTypes = Object.keys(ENEMY_STATS) as EnemyType[];
    const randomType = enemyTypes[randomInt(0, enemyTypes.length - 1)];
    return this.createEnemy(randomType, floor);
  }

  /**
   * Generate an elite enemy — 60% stronger than a normal enemy, better coin reward
   */
  static generateEliteEnemy(floor: number): Enemy {
    const enemyTypes = Object.keys(ENEMY_STATS) as EnemyType[];
    const randomType = enemyTypes[randomInt(0, enemyTypes.length - 1)];
    const base = this.createEnemy(randomType, floor);
    return {
      ...base,
      id: `elite-${Date.now()}-${Math.random()}`,
      name: `Elite ${base.name}`,
      health: Math.floor(base.health * 1.6),
      maxHealth: Math.floor(base.maxHealth * 1.6),
      attack: Math.floor(base.attack * 1.4),
      defense: Math.floor(base.defense * 1.3),
      coinReward: Math.floor(base.coinReward * 2.5),
      // behavior inherited from base
    };
  }

  /**
   * Create an enemy of specific type, scaled by absolute floor
   */
  static createEnemy(type: EnemyType, floor: number): Enemy {
    const baseStats = ENEMY_STATS[type];
    const dungeonNum = getDungeonNumber(floor);
    const floorInDungeon = getFloorInDungeon(floor);
    const floorMultiplier = (1 + (floorInDungeon - 1) * 0.2) * (1 + (dungeonNum - 1) * 0.3);

    const behavior = pickBehavior(type);
    const label = behaviorName(behavior);
    const name = label ? `${label} ${baseStats.name}` : baseStats.name;

    let attack = Math.floor(baseStats.baseAttack * floorMultiplier);
    let defense = Math.floor(baseStats.baseDefense * floorMultiplier);
    if (behavior === 'glass_cannon') {
      attack = Math.floor(attack * 1.5);
      defense = Math.floor(defense * 0.5);
    }

    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      type,
      name,
      health: Math.floor(baseStats.baseHealth * floorMultiplier),
      maxHealth: Math.floor(baseStats.baseHealth * floorMultiplier),
      attack,
      defense,
      coinReward: Math.floor(baseStats.coinReward * floorMultiplier),
      statusEffects: [],
      behavior,
    };
  }

  /**
   * Create a boss enemy for the given absolute floor.
   * Uses named boss stats for floor-within-dungeon 5 and 10, scaled by dungeon number.
   */
  static createBoss(floor: number): Enemy {
    const dungeonNum = getDungeonNumber(floor);
    const floorInDungeon = getFloorInDungeon(floor);
    const dungeonScale = 1 + (dungeonNum - 1) * 0.4; // 40% stronger per dungeon

    const defined = BOSS_STATS[floorInDungeon];
    if (defined) {
      const isDungeonFinalBoss = floorInDungeon === 10;
      const name = isDungeonFinalBoss
        ? (DUNGEON_BOSS_NAMES[dungeonNum] ?? `Dungeon ${dungeonNum} Boss`)
        : defined.name;
      return {
        id: `boss-${floor}-${Date.now()}`,
        type: ENEMY_TYPES.TROLL,
        name,
        health: Math.floor(defined.health * dungeonScale),
        maxHealth: Math.floor(defined.health * dungeonScale),
        attack: Math.floor(defined.attack * dungeonScale),
        defense: Math.floor(defined.defense * dungeonScale),
        coinReward: Math.floor(defined.coinReward * dungeonScale),
        statusEffects: [],
        behavior: 'enrager',
        enraged: false,
      };
    }
    // Generic fallback
    const floorMultiplier = 1 + (floor - 1) * 0.3;
    return {
      id: `boss-${floor}-${Date.now()}`,
      type: ENEMY_TYPES.TROLL,
      name: `Floor ${floor} Boss`,
      health: Math.floor(250 * floorMultiplier),
      maxHealth: Math.floor(250 * floorMultiplier),
      attack: Math.floor(35 * floorMultiplier),
      defense: Math.floor(15 * floorMultiplier),
      coinReward: Math.floor(120 * floorMultiplier),
      statusEffects: [],
      behavior: 'enrager',
      enraged: false,
    };
  }

  /**
   * Apply damage to enemy
   */
  static damageEnemy(enemy: Enemy, damage: number): Enemy {
    const actualDamage = Math.max(0, damage - enemy.defense);
    const newHealth = Math.max(0, enemy.health - actualDamage);

    return {
      ...enemy,
      health: newHealth,
    };
  }

  /**
   * Check if enemy is alive
   */
  static isAlive(enemy: Enemy): boolean {
    return enemy.health > 0;
  }

  /**
   * Get enemy difficulty rating
   */
  static getDifficulty(enemy: Enemy): 'easy' | 'medium' | 'hard' | 'boss' {
    const totalStats = enemy.health + enemy.attack + enemy.defense;

    if (enemy.name.includes('Boss')) return 'boss';
    if (totalStats < 50) return 'easy';
    if (totalStats < 100) return 'medium';
    return 'hard';
  }
}
