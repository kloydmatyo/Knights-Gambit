import { Enemy, EnemyType } from './types';
import { ENEMY_STATS, ENEMY_TYPES, BOSS_STATS, DUNGEON_BOSS_NAMES, getDungeonNumber, getFloorInDungeon } from './constants';
import { randomInt } from '@/lib/utils';

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
   * Create an enemy of specific type, scaled by absolute floor
   */
  static createEnemy(type: EnemyType, floor: number): Enemy {
    const baseStats = ENEMY_STATS[type];
    // 20% per floor within dungeon + 30% per dungeon beyond the first
    const dungeonNum = getDungeonNumber(floor);
    const floorInDungeon = getFloorInDungeon(floor);
    const floorMultiplier = (1 + (floorInDungeon - 1) * 0.2) * (1 + (dungeonNum - 1) * 0.3);

    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      type,
      name: baseStats.name,
      health: Math.floor(baseStats.baseHealth * floorMultiplier),
      maxHealth: Math.floor(baseStats.baseHealth * floorMultiplier),
      attack: Math.floor(baseStats.baseAttack * floorMultiplier),
      defense: Math.floor(baseStats.baseDefense * floorMultiplier),
      coinReward: Math.floor(baseStats.coinReward * floorMultiplier),
      statusEffects: [],
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
