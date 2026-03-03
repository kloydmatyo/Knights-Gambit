import { Player, Enemy, CombatResult, Skill } from './types';
import { randomInt, clamp } from '@/lib/utils';
import { CharacterEngine } from './CharacterEngine';

export class CombatEngine {
  /**
   * Execute a combat turn
   */
  static executeTurn(player: Player, enemy: Enemy, useSkill?: Skill): CombatResult {
    const messages: string[] = [];
    let playerDamage = 0;
    let enemyDamage = 0;

    // Player attacks
    if (useSkill && useSkill.type === 'active' && useSkill.currentCooldown === 0) {
      const skillResult = this.useSkill(player, enemy, useSkill);
      playerDamage = skillResult.damage;
      messages.push(...skillResult.messages);
    } else {
      playerDamage = this.calculateDamage(player.attack, enemy.defense);
      messages.push(`You attack for ${playerDamage} damage!`);
    }

    // Apply damage to enemy
    const newEnemyHealth = Math.max(0, enemy.health - playerDamage);
    const isEnemyDefeated = newEnemyHealth <= 0;

    // Enemy attacks back if still alive
    if (!isEnemyDefeated) {
      enemyDamage = this.calculateDamage(enemy.attack, player.defense);
      messages.push(`${enemy.name} attacks for ${enemyDamage} damage!`);
    }

    // Apply damage to player
    const newPlayerHealth = Math.max(0, player.health - enemyDamage);
    const isPlayerVictory = isEnemyDefeated;
    const coinsEarned = isPlayerVictory ? enemy.coinReward : 0;

    if (isPlayerVictory) {
      messages.push(`Victory! You earned ${coinsEarned} coins!`);
    }

    return {
      playerDamage,
      enemyDamage,
      playerHealth: newPlayerHealth,
      enemyHealth: newEnemyHealth,
      isPlayerVictory,
      isEnemyDefeated,
      coinsEarned,
      messages,
    };
  }

  /**
   * Calculate damage with defense reduction
   */
  static calculateDamage(attack: number, defense: number): number {
    const baseDamage = attack - Math.floor(defense / 2);
    const variance = randomInt(-2, 2);
    return Math.max(1, baseDamage + variance);
  }

  /**
   * Use a skill in combat
   */
  static useSkill(
    player: Player,
    enemy: Enemy,
    skill: Skill
  ): { damage: number; messages: string[] } {
    const messages: string[] = [];
    let damage = 0;

    messages.push(`You use ${skill.name}!`);

    switch (skill.effect.type) {
      case 'damage':
        damage = Math.floor(player.attack * (skill.effect.value || 1));
        messages.push(`${skill.name} deals ${damage} damage!`);
        break;

      case 'heal':
        const healAmount = skill.effect.value || 0;
        messages.push(`You heal for ${healAmount} HP!`);
        break;

      case 'buff':
        messages.push(`${skill.name} empowers you!`);
        damage = player.attack;
        break;

      case 'special':
        damage = Math.floor(player.attack * (skill.effect.value || 1.5));
        messages.push(`${skill.name} unleashes devastating power!`);
        break;

      default:
        damage = player.attack;
    }

    return { damage, messages };
  }

  /**
   * Apply status effects
   */
  static applyStatusEffects(entity: Player | Enemy): { damage: number; messages: string[] } {
    const messages: string[] = [];
    let totalDamage = 0;

    entity.statusEffects.forEach((effect) => {
      switch (effect.type) {
        case 'poison':
          const poisonDamage = effect.value || 5;
          totalDamage += poisonDamage;
          messages.push(`Poison deals ${poisonDamage} damage!`);
          break;

        case 'burn':
          const burnDamage = effect.value || 3;
          totalDamage += burnDamage;
          messages.push(`Burn deals ${burnDamage} damage!`);
          break;

        case 'regen':
          const regenAmount = effect.value || 5;
          messages.push(`Regeneration heals ${regenAmount} HP!`);
          break;
      }
    });

    return { damage: totalDamage, messages };
  }

  /**
   * Update status effect durations
   */
  static updateStatusEffects(entity: Player | Enemy): Player | Enemy {
    return {
      ...entity,
      statusEffects: entity.statusEffects
        .map((effect) => ({
          ...effect,
          duration: effect.duration - 1,
        }))
        .filter((effect) => effect.duration > 0),
    };
  }

  /**
   * Calculate critical hit
   */
  static isCriticalHit(player: Player, enemy: Enemy): boolean {
    const baseCritChance = 0.1; // 10% base crit chance
    
    // Archer passive: +100% crit vs enemies below 50% HP
    if (player.class === 'archer' && enemy.health < enemy.maxHealth / 2) {
      return Math.random() < 0.3; // 30% crit chance
    }

    return Math.random() < baseCritChance;
  }

  /**
   * Apply critical damage
   */
  static applyCritical(damage: number): number {
    return Math.floor(damage * 2);
  }
}
