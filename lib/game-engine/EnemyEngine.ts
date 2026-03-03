import { Enemy, EnemyType } from './types';
import { ENEMY_STATS, ENEMY_TYPES } from './constants';
import { randomInt } from '@/lib/utils';

export class EnemyEngine {
  /**
   * Generate a random enemy scaled to floor
   */
  static generateEnemy(floor: number): Enemy {
    const enemyTypes = Object.keys(ENEMY_STATS) as EnemyType[];
    const randomType = enemyTypes[randomInt(0, enemyTypes.length - 1)];
    
    return this.createEnemy(randomType, floor);
  }

  /**
   * Create an enemy of specific type
   */
  static createEnemy(type: EnemyType, floor: number): Enemy {
    const baseStats = ENEMY_STATS[type];
    const floorMultiplier = 1 + (floor - 1) * 0.2; // 20% increase per floor

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
   * Create a boss enemy
   */
  static createBoss(floor: number): Enemy {
    const bossMultiplier = 2.5;
    const floorMultiplier = 1 + (floor - 1) * 0.3;

    return {
      id: `boss-${Date.now()}`,
      type: ENEMY_TYPES.TROLL,
      name: `Floor ${floor} Boss`,
      health: Math.floor(100 * bossMultiplier * floorMultiplier),
      maxHealth: Math.floor(100 * bossMultiplier * floorMultiplier),
      attack: Math.floor(20 * bossMultiplier * floorMultiplier),
      defense: Math.floor(10 * bossMultiplier * floorMultiplier),
      coinReward: Math.floor(100 * floorMultiplier),
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
