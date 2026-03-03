import {
  Enemy,
  BossAbility,
  BossAbilityType,
  BossAbilityTarget,
  StatusEffect,
  StatusEffectType,
  Item,
  ItemType,
  ItemRarity,
} from "../types/GameTypes";

export class BossManager {
  // Generate a boss enemy for the specified floor
  generateBoss(floor: number): Enemy {
    const bossTemplate = this.getBossTemplate(floor);
    const floorMultiplier = 1 + (floor - 1) * 0.2;

    return {
      id: `boss_${floor}_${Date.now()}`,
      name: bossTemplate.name,
      health: Math.floor(bossTemplate.baseHealth * floorMultiplier),
      maxHealth: Math.floor(bossTemplate.baseHealth * floorMultiplier),
      attack: Math.floor(bossTemplate.baseAttack * floorMultiplier),
      defense: Math.floor(bossTemplate.baseDefense * floorMultiplier),
      coins: Math.floor(bossTemplate.baseCoins * floorMultiplier),
      statusEffects: [],
      loot: this.generateBossLoot(floor),
    };
  }

  // Get boss template based on floor
  private getBossTemplate(floor: number) {
    if (floor <= 5) {
      return {
        name: "Goblin Chieftain",
        baseHealth: 120,
        baseAttack: 18,
        baseDefense: 8,
        baseCoins: 75,
      };
    } else if (floor <= 10) {
      return {
        name: "Orc Warlord",
        baseHealth: 180,
        baseAttack: 25,
        baseDefense: 12,
        baseCoins: 125,
      };
    } else if (floor <= 14) {
      return {
        name: "Shadow Drake",
        baseHealth: 250,
        baseAttack: 35,
        baseDefense: 18,
        baseCoins: 200,
      };
    } else {
      return {
        name: "Ancient Dragon Lord",
        baseHealth: 400,
        baseAttack: 50,
        baseDefense: 25,
        baseCoins: 500,
      };
    }
  }

  // Get boss abilities based on boss type
  getBossAbilities(boss: Enemy): BossAbility[] {
    switch (boss.name) {
      case "Goblin Chieftain":
        return [
          {
            id: "war_cry",
            name: "War Cry",
            type: BossAbilityType.BUFF,
            target: BossAbilityTarget.SELF,
            effect: StatusEffectType.STRENGTH_BOOST,
            cooldown: 4,
            currentCooldown: 0,
            description: "Increases attack damage for 3 turns",
          },
          {
            id: "poison_blade",
            name: "Poison Blade",
            type: BossAbilityType.SPECIAL_ATTACK,
            target: BossAbilityTarget.PLAYER,
            damage: 20,
            effect: StatusEffectType.POISON,
            cooldown: 3,
            currentCooldown: 0,
            description: "Poisoned attack that deals damage over time",
          },
        ];

      case "Orc Warlord":
        return [
          {
            id: "berserker_rage",
            name: "Berserker Rage",
            type: BossAbilityType.BUFF,
            target: BossAbilityTarget.SELF,
            effect: StatusEffectType.BERSERKER_RAGE,
            cooldown: 5,
            currentCooldown: 0,
            description: "Enters rage mode with increased damage",
          },
          {
            id: "crushing_blow",
            name: "Crushing Blow",
            type: BossAbilityType.SPECIAL_ATTACK,
            target: BossAbilityTarget.PLAYER,
            damage: 35,
            cooldown: 4,
            currentCooldown: 0,
            description: "Devastating attack that ignores armor",
          },
        ];

      case "Shadow Drake":
        return [
          {
            id: "shadow_breath",
            name: "Shadow Breath",
            type: BossAbilityType.SPECIAL_ATTACK,
            target: BossAbilityTarget.PLAYER,
            damage: 30,
            effect: StatusEffectType.POISON,
            cooldown: 3,
            currentCooldown: 0,
            description: "Toxic breath that poisons the target",
          },
          {
            id: "dark_regeneration",
            name: "Dark Regeneration",
            type: BossAbilityType.HEAL,
            target: BossAbilityTarget.SELF,
            cooldown: 6,
            currentCooldown: 0,
            description: "Regenerates health using dark magic",
          },
        ];

      case "Ancient Dragon Lord":
        return [
          {
            id: "dragon_fire",
            name: "Dragon Fire",
            type: BossAbilityType.SPECIAL_ATTACK,
            target: BossAbilityTarget.PLAYER,
            damage: 45,
            effect: StatusEffectType.BURN,
            cooldown: 3,
            currentCooldown: 0,
            description: "Breathes fire that burns the target",
          },
          {
            id: "ancient_roar",
            name: "Ancient Roar",
            type: BossAbilityType.DEBUFF,
            target: BossAbilityTarget.PLAYER,
            effect: StatusEffectType.STUN,
            cooldown: 5,
            currentCooldown: 0,
            description: "Terrifying roar that stuns the enemy",
          },
          {
            id: "dragon_scales",
            name: "Dragon Scales",
            type: BossAbilityType.BUFF,
            target: BossAbilityTarget.SELF,
            effect: StatusEffectType.DEFENSE_BOOST,
            cooldown: 4,
            currentCooldown: 0,
            description: "Hardens scales for increased defense",
          },
        ];

      default:
        return [];
    }
  }

  // Generate special loot for boss defeats
  private generateBossLoot(floor: number): Item[] {
    // Bosses drop better loot than regular enemies
    const lootCount = Math.floor(Math.random() * 3) + 2; // 2-4 items
    const loot: Item[] = [];

    for (let i = 0; i < lootCount; i++) {
      // Boss loot has higher rarity chances
      loot.push({
        id: `boss_loot_${floor}_${i}`,
        name: `Boss Treasure ${i + 1}`,
        type: ItemType.TREASURE,
        description: "Valuable treasure from a defeated boss",
        value: Math.floor((50 + floor * 10) * (1 + Math.random())),
        quantity: 1,
        rarity: ItemRarity.RARE,
        level: floor,
      });
    }

    return loot;
  }

  // Determine boss AI action
  chooseBossAction(
    boss: Enemy,
    abilities: BossAbility[],
    turn: number
  ): BossAbility | null {
    // Filter abilities that are not on cooldown
    const availableAbilities = abilities.filter((ability: BossAbility) => {
      // Simple cooldown tracking - in a real implementation, you'd track this per boss
      return turn % (ability.cooldown + 1) === 0;
    });

    if (availableAbilities.length === 0) {
      return null; // No abilities available, use basic attack
    }

    // Simple AI: prioritize healing when low health, otherwise use random ability
    if (boss.health < boss.maxHealth * 0.3) {
      const healAbility = availableAbilities.find(
        (a) => a.type === BossAbilityType.HEAL
      );
      if (healAbility) return healAbility;
    }

    // Use random available ability
    return availableAbilities[
      Math.floor(Math.random() * availableAbilities.length)
    ];
  }

  // Apply boss ability effects
  applyBossAbility(boss: Enemy, ability: BossAbility, target: any): string {
    let message = `${boss.name} uses ${ability.name}!`;

    switch (ability.type) {
      case BossAbilityType.ATTACK:
      case BossAbilityType.SPECIAL_ATTACK:
        if (ability.damage && target) {
          const damage = Math.max(1, ability.damage - (target.defense || 0));
          target.health = Math.max(0, target.health - damage);
          message += ` Deals ${damage} damage!`;

          if (ability.effect) {
            this.applyStatusEffect(target, ability.effect);
            message += ` ${this.getStatusEffectMessage(ability.effect)}`;
          }
        }
        break;

      case BossAbilityType.HEAL:
        const healAmount = Math.floor(boss.maxHealth * 0.2);
        boss.health = Math.min(boss.maxHealth, boss.health + healAmount);
        message += ` Heals for ${healAmount} HP!`;
        break;

      case BossAbilityType.BUFF:
        if (ability.effect) {
          this.applyStatusEffect(boss, ability.effect);
          message += ` ${boss.name} is empowered!`;
        }
        break;

      case BossAbilityType.DEBUFF:
        if (ability.effect && target) {
          this.applyStatusEffect(target, ability.effect);
          message += ` ${this.getStatusEffectMessage(ability.effect)}`;
        }
        break;
    }

    return message;
  }

  // Apply status effect to target
  private applyStatusEffect(target: any, effectType: StatusEffectType): void {
    if (!target.statusEffects) target.statusEffects = [];

    const statusEffect: StatusEffect = {
      type: effectType,
      duration: this.getStatusEffectDuration(effectType),
      description: this.getStatusEffectDescription(effectType),
    };

    // Remove existing effect of same type
    target.statusEffects = target.statusEffects.filter(
      (e: StatusEffect) => e.type !== effectType
    );
    target.statusEffects.push(statusEffect);
  }

  private getStatusEffectDuration(effectType: StatusEffectType): number {
    switch (effectType) {
      case StatusEffectType.POISON:
        return 3;
      case StatusEffectType.BURN:
        return 3;
      case StatusEffectType.STUN:
        return 1;
      case StatusEffectType.STRENGTH_BOOST:
        return 3;
      case StatusEffectType.DEFENSE_BOOST:
        return 3;
      case StatusEffectType.BERSERKER_RAGE:
        return 4;
      default:
        return 2;
    }
  }

  private getStatusEffectDescription(effectType: StatusEffectType): string {
    switch (effectType) {
      case StatusEffectType.POISON:
        return "Poisoned - takes damage each turn";
      case StatusEffectType.BURN:
        return "Burning - takes fire damage each turn";
      case StatusEffectType.STUN:
        return "Stunned - cannot act";
      case StatusEffectType.STRENGTH_BOOST:
        return "Empowered - increased attack";
      case StatusEffectType.DEFENSE_BOOST:
        return "Armored - increased defense";
      case StatusEffectType.BERSERKER_RAGE:
        return "Enraged - increased damage and resistance";
      default:
        return "Unknown effect";
    }
  }

  private getStatusEffectMessage(effectType: StatusEffectType): string {
    switch (effectType) {
      case StatusEffectType.POISON:
        return "Target is poisoned!";
      case StatusEffectType.BURN:
        return "Target is burning!";
      case StatusEffectType.STUN:
        return "Target is stunned!";
      case StatusEffectType.STRENGTH_BOOST:
        return "Attack increased!";
      case StatusEffectType.DEFENSE_BOOST:
        return "Defense increased!";
      case StatusEffectType.BERSERKER_RAGE:
        return "Enters berserker rage!";
      default:
        return "Effect applied!";
    }
  }
}
