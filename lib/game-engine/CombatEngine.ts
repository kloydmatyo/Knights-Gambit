import { Player, Enemy, CombatResult, Skill, WeaponUpgradeState } from './types';
import { randomInt } from '@/lib/utils';

export class CombatEngine {
  /**
   * Execute a combat turn, optionally with upgrade state for crits/specials.
   * Returns updated player mana alongside the standard CombatResult.
   */
  static executeTurn(
    player: Player,
    enemy: Enemy,
    useSkill?: Skill,
    upgradeState?: WeaponUpgradeState
  ): CombatResult & { updatedPlayerMana?: number; updatedEnemyStatusEffects?: Enemy['statusEffects'] } {
    const messages: string[] = [];
    let playerDamage = 0;
    let enemyDamage = 0;
    let updatedPlayerMana = player.mana;
    let updatedEnemyStatusEffects = [...enemy.statusEffects];

    const relics = player.relics ?? [];
    const hasCursedIdol = relics.includes('relic_cursed_idol');

    // Apply curse penalty to attack
    const isCursed = player.statusEffects.some((e) => e.type === 'cursed');
    const effectiveAttack = isCursed ? Math.max(1, Math.floor(player.attack * 0.6)) : player.attack;
    const effectiveDefense = isCursed ? Math.max(0, Math.floor(player.defense * 0.6)) : player.defense;
    if (isCursed) messages.push('💀 Curse weakens you! (-40% ATK & DEF)');

    // Crit params from upgrade state
    const critChanceBonus = upgradeState?.totalCritChanceBonus ?? 0;
    const critMultiplier = upgradeState ? (2.0 + upgradeState.totalCritDamageBonus) : 2.0;
    const unlockedAbilities = upgradeState?.unlockedAbilities ?? [];

    // Player attacks
    if (useSkill && useSkill.type === 'active' && useSkill.currentCooldown === 0) {
      const cursedPlayer = { ...player, attack: effectiveAttack };
      const skillResult = this.useSkill(cursedPlayer, enemy, useSkill, upgradeState);
      playerDamage = skillResult.damage;
      updatedPlayerMana = skillResult.updatedMana ?? updatedPlayerMana;
      if (skillResult.appliedPoison) {
        const alreadyPoisoned = updatedEnemyStatusEffects.some(e => e.type === 'poison');
        if (!alreadyPoisoned) {
          updatedEnemyStatusEffects = [...updatedEnemyStatusEffects, { type: 'poison' as const, duration: 3, value: 6 }];
        }
      }
      messages.push(...skillResult.messages);
    } else {
      // Check for special ability procs on basic attack
      if (unlockedAbilities.includes('holy_smite') && Math.random() < 0.25) {
        const smiteDmg = Math.floor(effectiveAttack * 1.5);
        playerDamage = smiteDmg;
        messages.push(`✨ Holy Smite! You deal ${smiteDmg} divine damage!`);
      } else if (unlockedAbilities.includes('storm_volley') && Math.random() < 0.3) {
        const volleyDmg = Math.floor(effectiveAttack * 1.8);
        playerDamage = volleyDmg;
        messages.push(`⚡ Storm Volley! Arrows rain down for ${volleyDmg} damage!`);
      } else if (unlockedAbilities.includes('arcane_nova') && Math.random() < 0.25) {
        const novaDmg = Math.floor(effectiveAttack * 2.0);
        playerDamage = novaDmg;
        messages.push(`🌌 Arcane Nova! Reality shatters for ${novaDmg} damage!`);
      } else if (unlockedAbilities.includes('ground_shatter') && Math.random() < 0.2) {
        const shatterDmg = Math.floor(effectiveAttack * 2.2);
        playerDamage = shatterDmg;
        messages.push(`🔨 Ground Shatter! The earth splits for ${shatterDmg} damage!`);
      } else if (unlockedAbilities.includes('death_mark') && Math.random() < 0.3) {
        const markDmg = Math.floor(effectiveAttack * 2.5);
        playerDamage = markDmg;
        messages.push(`💀 Death Mark! A lethal strike for ${markDmg} damage!`);
      } else if (unlockedAbilities.includes('divine_retribution') && Math.random() < 0.25) {
        const retribDmg = Math.floor(effectiveAttack * 1.6);
        playerDamage = retribDmg;
        messages.push(`⚡ Divine Retribution! Holy wrath deals ${retribDmg} damage!`);
      } else {
        // Normal attack with crit check
        const baseDmg = this.calculateDamage(effectiveAttack, enemy.defense);
        if (this.isCriticalHit(player, enemy, critChanceBonus)) {
          playerDamage = this.applyCritical(baseDmg, critMultiplier);
          messages.push(`💥 Critical hit! You deal ${playerDamage} damage!`);
        } else {
          playerDamage = baseDmg;
          messages.push(`You attack for ${playerDamage} damage!`);
        }
      }

      // Assassin poison passive: 35% chance to apply poison on basic attack
      if (player.class === 'assassin' && Math.random() < 0.35) {
        const alreadyPoisoned = updatedEnemyStatusEffects.some(e => e.type === 'poison');
        if (!alreadyPoisoned) {
          updatedEnemyStatusEffects = [...updatedEnemyStatusEffects, { type: 'poison' as const, duration: 3, value: 6 }];
          messages.push('🧪 Poison Mastery! Enemy is poisoned!');
        }
      }
    }

    // Apply damage to enemy (absorb through shield first)
    let remainingPlayerDamage = playerDamage;

    // Cursed Idol: +20% damage dealt, but enemy hits harder (handled below)
    if (hasCursedIdol && remainingPlayerDamage > 0) {
      const bonus = Math.floor(remainingPlayerDamage * 0.2);
      remainingPlayerDamage += bonus;
      playerDamage = remainingPlayerDamage;
    }
    const shieldEffect = updatedEnemyStatusEffects.find(e => e.type === 'shield');
    if (shieldEffect && remainingPlayerDamage > 0) {
      const absorbed = Math.min(shieldEffect.value ?? 0, remainingPlayerDamage);
      remainingPlayerDamage -= absorbed;
      const newShieldValue = (shieldEffect.value ?? 0) - absorbed;
      updatedEnemyStatusEffects = newShieldValue <= 0
        ? updatedEnemyStatusEffects.filter(e => e.type !== 'shield')
        : updatedEnemyStatusEffects.map(e => e.type === 'shield' ? { ...e, value: newShieldValue } : e);
      if (absorbed > 0) messages.push(`🛡️ Enemy shield absorbs ${absorbed} damage! (${newShieldValue} remaining)`);
    }
    const newEnemyHealth = Math.max(0, enemy.health - remainingPlayerDamage);
    const isEnemyDefeated = newEnemyHealth <= 0;

    // Enemy attacks back if still alive
    if (!isEnemyDefeated) {
      let incomingDamage = this.calculateDamage(enemy.attack, effectiveDefense);

      // Mage passive: Mana Shield — absorb damage with mana at 2:1 ratio
      if (player.class === 'mage' && updatedPlayerMana && updatedPlayerMana > 0) {
        const manaAbsorb = Math.min(updatedPlayerMana, incomingDamage * 2);
        const absorbed = Math.floor(manaAbsorb / 2);
        incomingDamage = Math.max(0, incomingDamage - absorbed);
        updatedPlayerMana = Math.max(0, updatedPlayerMana - manaAbsorb);
        if (absorbed > 0) messages.push(`🔮 Mana Shield absorbs ${absorbed} damage! (${updatedPlayerMana} mana left)`);
      }

      enemyDamage = incomingDamage;
      messages.push(`${enemy.name} attacks for ${enemyDamage} damage!`);

      // Cursed Idol: take 10% more incoming damage
      if (hasCursedIdol) {
        const penalty = Math.floor(enemyDamage * 0.1);
        enemyDamage += penalty;
      }

      // ── Enemy behavior effects ──────────────────────────────────────────
      switch (enemy.behavior) {
        case 'berserker': {
          // Gains +3 ATK each turn it survives (tracked via a stacking buff on the enemy object)
          // We signal this via a message; GameEngine.executeCombatTurn applies the stat change
          messages.push(`🔥 ${enemy.name} grows stronger! (+3 ATK)`);
          break;
        }
        case 'regenerator': {
          const regenAmt = 8;
          // Signal regen via message; GameEngine applies the HP change
          messages.push(`💚 ${enemy.name} regenerates ${regenAmt} HP!`);
          break;
        }
        case 'poisoner': {
          // Apply poison to player on every attack
          messages.push(`🧪 ${enemy.name}'s attack is venomous! You are poisoned!`);
          break;
        }
        case 'defender': {
          if (remainingPlayerDamage > 0) {
            const reflected = Math.floor(remainingPlayerDamage * 0.3);
            if (reflected > 0) {
              enemyDamage += reflected;
              messages.push(`🪞 ${enemy.name} reflects ${reflected} damage back at you!`);
            }
          }
          break;
        }
      }
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
      updatedPlayerMana,
      updatedEnemyStatusEffects,
      // Behavior side-effects for GameEngine to apply
      behaviorEnemyAtkGain: (!isEnemyDefeated && enemy.behavior === 'berserker') ? 3 : 0,
      behaviorEnemyRegen:   (!isEnemyDefeated && enemy.behavior === 'regenerator') ? 8 : 0,
      behaviorPoisonPlayer: (!isEnemyDefeated && enemy.behavior === 'poisoner'),
      // Relic side-effects
      relicVampiricHeal: (playerDamage > 0 && relics.includes('vampiric_fang')) ? 3 : 0,
      relicBonusCoins:   (isEnemyDefeated && relics.includes('philosophers_stone')) ? 5 : 0,
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
    skill: Skill,
    upgradeState?: WeaponUpgradeState
  ): { damage: number; messages: string[]; updatedMana?: number; appliedPoison?: boolean } {
    const messages: string[] = [];
    let damage = 0;
    let updatedMana = player.mana;
    let appliedPoison = false;

    // Mana cost for mage skills (20 mana per active skill use)
    const MANA_COST = 20;
    if (player.class === 'mage') {
      if ((updatedMana ?? 0) < MANA_COST) {
        // Not enough mana — fall back to basic attack
        const baseDmg = this.calculateDamage(player.attack, enemy.defense);
        messages.push(`🔮 Not enough mana! Basic attack for ${baseDmg} damage.`);
        return { damage: baseDmg, messages, updatedMana };
      }
      updatedMana = (updatedMana ?? 0) - MANA_COST;
    }

    messages.push(`You use ${skill.name}!`);

    const critChanceBonus = upgradeState?.totalCritChanceBonus ?? 0;
    const critMultiplier = upgradeState ? (2.0 + upgradeState.totalCritDamageBonus) : 2.0;

    switch (skill.effect.type) {
      case 'damage': {
        const raw = Math.floor(player.attack * (skill.effect.value || 1));
        if (this.isCriticalHit(player, enemy, critChanceBonus)) {
          damage = this.applyCritical(raw, critMultiplier);
          messages.push(`💥 Critical! ${skill.name} deals ${damage} damage!`);
        } else {
          damage = raw;
          messages.push(`${skill.name} deals ${damage} damage!`);
        }
        // Assassin: poison on skill hit
        if (player.class === 'assassin') appliedPoison = true;
        break;
      }

      case 'heal': {
        const healAmount = skill.effect.value || 0;
        messages.push(`You heal for ${healAmount} HP!`);
        // Cleric: also remove debuffs on divine_healing
        if (skill.id === 'divine_healing') {
          messages.push('✨ Debuffs cleansed!');
        }
        break;
      }

      case 'buff':
        messages.push(`${skill.name} empowers you!`);
        damage = player.attack;
        break;

      case 'special': {
        // Mage elemental mastery — cycles element for flavor
        const elements = ['🔥 Fire', '❄️ Ice', '⚡ Lightning'];
        const element = elements[Math.floor(Math.random() * elements.length)];
        const raw = Math.floor(player.attack * (skill.effect.value || 1.5));
        if (this.isCriticalHit(player, enemy, critChanceBonus)) {
          damage = this.applyCritical(raw, critMultiplier);
          messages.push(`💥 ${element} Critical! ${skill.name} deals ${damage} damage!`);
        } else {
          damage = raw;
          messages.push(`${element}! ${skill.name} deals ${damage} damage!`);
        }
        break;
      }

      default:
        damage = player.attack;
    }

    return { damage, messages, updatedMana, appliedPoison };
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

        case 'cursed':
          const curseDamage = effect.value || 8;
          totalDamage += curseDamage;
          messages.push(`💀 Curse drains ${curseDamage} HP!`);
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
  static isCriticalHit(player: Player, enemy: Enemy, critChanceBonus = 0): boolean {
    const baseCritChance = 0.1 + critChanceBonus;
    
    // Archer passive: +100% crit vs enemies below 50% HP
    if (player.class === 'archer' && enemy.health < enemy.maxHealth / 2) {
      return Math.random() < Math.min(0.95, baseCritChance + 0.2);
    }

    return Math.random() < baseCritChance;
  }

  /**
   * Apply critical damage
   */
  static applyCritical(damage: number, critMultiplier = 2.0): number {
    return Math.floor(damage * critMultiplier);
  }
}
