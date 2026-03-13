import { Player, CharacterClass, Skill } from './types';
import { CLASS_STATS } from './constants';
import { randomInt } from '@/lib/utils';

export class CharacterEngine {
  /**
   * Create a new player character
   */
  static createPlayer(characterClass: CharacterClass): Player {
    const stats = CLASS_STATS[characterClass];
    
    const basePlayer = {
      id: `player-${Date.now()}`,
      class: characterClass,
      health: stats.baseHealth,
      maxHealth: stats.baseHealth,
      attack: stats.baseAttack,
      defense: stats.baseDefense,
      coins: stats.startingCoins,
      position: 0,
      inventory: [],
      skills: this.getClassSkills(characterClass),
      statusEffects: [],
    };

    // Add mana for mage class
    if ('baseMana' in stats) {
      return {
        ...basePlayer,
        mana: stats.baseMana,
        maxMana: stats.baseMana,
      };
    }

    return basePlayer;
  }

  /**
   * Get skills for a character class
   */
  static getClassSkills(characterClass: CharacterClass): Skill[] {
    const skillsMap: Record<CharacterClass, Skill[]> = {
      knight: [
        {
          id: 'shield_wall',
          name: 'Shield Wall',
          description: 'Blocks next 3 attacks and reflects 50% damage',
          type: 'active',
          cooldown: 5,
          currentCooldown: 0,
          effect: { type: 'buff', value: 3, target: 'self', duration: 3 },
        },
        {
          id: 'guardians_resolve',
          name: "Guardian's Resolve",
          description: 'Gains +3 Defense per defeated ally',
          type: 'passive',
          cooldown: 0,
          currentCooldown: 0,
          effect: { type: 'buff', value: 3, target: 'self' },
        },
        {
          id: 'righteous_strike',
          name: 'Righteous Strike',
          description: '200% weapon damage with 30% stun chance',
          type: 'active',
          cooldown: 4,
          currentCooldown: 0,
          effect: { type: 'damage', value: 2, target: 'enemy' },
        },
      ],
      archer: [
        {
          id: 'piercing_shot',
          name: 'Piercing Shot',
          description: 'Arrow pierces through ignoring armor',
          type: 'active',
          cooldown: 3,
          currentCooldown: 0,
          effect: { type: 'damage', value: 1.5, target: 'enemy' },
        },
        {
          id: 'hunters_mark',
          name: "Hunter's Mark",
          description: '+100% crit chance vs enemies below 50% HP',
          type: 'passive',
          cooldown: 0,
          currentCooldown: 0,
          effect: { type: 'buff', value: 2, target: 'self' },
        },
        {
          id: 'explosive_arrow',
          name: 'Explosive Arrow',
          description: '150% damage with burn effect',
          type: 'active',
          cooldown: 5,
          currentCooldown: 0,
          effect: { type: 'damage', value: 1.5, target: 'enemy' },
        },
      ],
      mage: [
        {
          id: 'arcane_missiles',
          name: 'Arcane Missiles',
          description: '5 auto-targeting missiles',
          type: 'active',
          cooldown: 4,
          currentCooldown: 0,
          effect: { type: 'damage', value: 5, target: 'enemy' },
        },
        {
          id: 'mana_shield',
          name: 'Mana Shield',
          description: 'Damage absorbed by mana at 2:1 ratio',
          type: 'passive',
          cooldown: 0,
          currentCooldown: 0,
          effect: { type: 'buff', target: 'self' },
        },
        {
          id: 'elemental_mastery',
          name: 'Elemental Mastery',
          description: 'Cycles Fire/Ice/Lightning effects',
          type: 'active',
          cooldown: 3,
          currentCooldown: 0,
          effect: { type: 'special', value: 1.8, target: 'enemy' },
        },
      ],
      barbarian: [
        {
          id: 'berserker_rage',
          name: 'Berserker Rage',
          description: '+100% damage, +50% resistance for 4 turns',
          type: 'active',
          cooldown: 6,
          currentCooldown: 0,
          effect: { type: 'buff', value: 2, target: 'self', duration: 4 },
        },
        {
          id: 'bloodthirst',
          name: 'Bloodthirst',
          description: 'Heal 25% HP on kill, +5 ATK per kill',
          type: 'passive',
          cooldown: 0,
          currentCooldown: 0,
          effect: { type: 'heal', value: 0.25, target: 'self' },
        },
        {
          id: 'earthquake_slam',
          name: 'Earthquake Slam',
          description: '150% damage with 40% knockdown chance',
          type: 'active',
          cooldown: 5,
          currentCooldown: 0,
          effect: { type: 'damage', value: 1.5, target: 'all' },
        },
      ],
      assassin: [
        {
          id: 'shadow_step',
          name: 'Shadow Step',
          description: 'Become untargetable, next attack 300% damage',
          type: 'active',
          cooldown: 4,
          currentCooldown: 0,
          effect: { type: 'damage', value: 3, target: 'enemy' },
        },
        {
          id: 'poison_mastery',
          name: 'Poison Mastery',
          description: '35% poison chance, +25% damage vs poisoned',
          type: 'passive',
          cooldown: 0,
          currentCooldown: 0,
          effect: { type: 'debuff', value: 0.35, target: 'enemy' },
        },
        {
          id: 'thousand_cuts',
          name: 'Thousand Cuts',
          description: '5 escalating attacks',
          type: 'active',
          cooldown: 6,
          currentCooldown: 0,
          effect: { type: 'damage', value: 5, target: 'enemy' },
        },
      ],
      cleric: [
        {
          id: 'divine_healing',
          name: 'Divine Healing',
          description: 'Heal based on missing HP, removes debuffs',
          type: 'active',
          cooldown: 3,
          currentCooldown: 0,
          effect: { type: 'heal', value: 40, target: 'self' },
        },
        {
          id: 'blessed_aura',
          name: 'Blessed Aura',
          description: 'Regen and defense boost',
          type: 'passive',
          cooldown: 0,
          currentCooldown: 0,
          effect: { type: 'buff', value: 2, target: 'self' },
        },
        {
          id: 'wrath_of_heaven',
          name: 'Wrath of Heaven',
          description: 'AoE holy damage',
          type: 'active',
          cooldown: 5,
          currentCooldown: 0,
          effect: { type: 'damage', value: 1.5, target: 'all' },
        },
      ],
    };

    return skillsMap[characterClass] || [];
  }

  /**
   * Apply damage to player
   */
  static damagePlayer(player: Player, damage: number): Player {
    const actualDamage = Math.max(0, damage - player.defense);
    const newHealth = Math.max(0, player.health - actualDamage);

    return {
      ...player,
      health: newHealth,
    };
  }

  /**
   * Heal player
   */
  static healPlayer(player: Player, amount: number): Player {
    const newHealth = Math.min(player.maxHealth, player.health + amount);

    return {
      ...player,
      health: newHealth,
    };
  }

  /**
   * Add coins to player
   */
  static addCoins(player: Player, amount: number): Player {
    return {
      ...player,
      coins: player.coins + amount,
    };
  }

  /**
   * Remove coins from player
   */
  static removeCoins(player: Player, amount: number): Player {
    return {
      ...player,
      coins: Math.max(0, player.coins - amount),
    };
  }

  /**
   * Upgrade player stat
   */
  static upgradeStat(
    player: Player,
    stat: 'health' | 'attack' | 'defense',
    amount: number
  ): Player {
    switch (stat) {
      case 'health':
        return {
          ...player,
          maxHealth: player.maxHealth + amount,
          health: player.health + amount,
        };
      case 'attack':
        return {
          ...player,
          attack: player.attack + amount,
        };
      case 'defense':
        return {
          ...player,
          defense: player.defense + amount,
        };
      default:
        return player;
    }
  }

  /**
   * Check if player is alive
   */
  static isAlive(player: Player): boolean {
    return player.health > 0;
  }

  /**
   * Reduce skill cooldowns
   */
  static updateCooldowns(player: Player): Player {
    return {
      ...player,
      skills: player.skills.map((skill) => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 1),
      })),
    };
  }
}
