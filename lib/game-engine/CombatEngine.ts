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
    let updatedPlayerMana = player.mana ?? 0;
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
        const effectiveEnemyDef = Math.max(0, enemy.defense - player.armorPen);
        const baseDmg = this.calculateDamage(effectiveAttack, effectiveEnemyDef);
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
    let shieldAbsorbed = 0;

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

      // Player shield status effect — absorb incoming damage
      const playerShield = player.statusEffects.find(e => e.type === 'shield');
      if (playerShield && incomingDamage > 0) {
        shieldAbsorbed = Math.min(playerShield.value ?? 0, incomingDamage);
        incomingDamage = Math.max(0, incomingDamage - shieldAbsorbed);
        const newShieldVal = (playerShield.value ?? 0) - shieldAbsorbed;
        messages.push(`🛡️ Shield absorbs ${shieldAbsorbed} damage!${newShieldVal <= 0 ? ' Shield broken!' : ` (${newShieldVal} remaining)`}`);
        // Mirror shield: reflect 30% back — signal via a flag on result
        const isMirror = relics.includes('mirror_shield_active') || player.inventory.some(i => i.id === 'mirror_shield' && i.quantity > 0);
        if (isMirror && shieldAbsorbed > 0) {
          const reflected = Math.floor(shieldAbsorbed * 0.3);
          if (reflected > 0) messages.push(`🪞 Mirror Shield reflects ${reflected} damage back!`);
        }
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
      resolutionType: isPlayerVictory ? 'kill' : undefined,
      updatedPlayerMana,
      updatedEnemyStatusEffects,
      // Behavior side-effects for GameEngine to apply
      behaviorEnemyAtkGain: (!isEnemyDefeated && enemy.behavior === 'berserker') ? 3 : 0,
      behaviorEnemyRegen:   (!isEnemyDefeated && enemy.behavior === 'regenerator') ? 8 : 0,
      behaviorPoisonPlayer: (!isEnemyDefeated && enemy.behavior === 'poisoner'),
      // Relic side-effects
      relicVampiricHeal: (playerDamage > 0 && relics.includes('vampiric_fang')) ? 3 : 0,
      relicBonusCoins:   (isEnemyDefeated && relics.includes('philosophers_stone')) ? 5 : 0,
      shieldAbsorbed: shieldAbsorbed ?? 0,
    };
  }

  /**
   * Calculate damage with defense reduction.
   * Defense subtracts directly from attack (not halved), making it meaningfully impactful.
   * Minimum 1 damage always gets through.
   */
  static calculateDamage(attack: number, defense: number): number {
    const baseDamage = Math.max(1, attack - defense);
    const variance = randomInt(-1, 2); // slight upward bias to keep combat feeling active
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
    let updatedMana = player.mana ?? 0;
    let appliedPoison = false;

    // Mana cost for skills — mage only, 20 mana per active skill use
    const MANA_COST = 20;
    if (player.class === 'mage') {
      if (updatedMana < MANA_COST) {
        // Not enough mana — skill cannot be cast, fall back to basic attack
        const baseDmg = this.calculateDamage(player.attack, enemy.defense);
        messages.push(`🔮 Not enough mana to cast ${skill.name}! Basic attack for ${baseDmg} damage.`);
        return { damage: baseDmg, messages, updatedMana };
      }
      updatedMana = updatedMana - MANA_COST;
      messages.push(`🔮 ${MANA_COST} mana consumed. (${updatedMana} remaining)`);
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

  // ── Alternative Resolution Methods ─────────────────────────────────────

  /**
   * Attempt to flee from combat.
   * Base 40% chance, modified by ATK difference and enemy behavior.
   * On failure the enemy gets a free hit.
   */
  static attemptFlee(player: Player, enemy: Enemy): CombatResult {
    const messages: string[] = [];
    let fleeChance = 0.4;

    // Speed advantage: use attack difference as proxy (±5% per point)
    const atkDiff = player.attack - enemy.attack;
    fleeChance += atkDiff * 0.05;

    // Berserkers and bosses are harder to escape
    if (enemy.behavior === 'berserker' || enemy.behavior === 'enrager') {
      fleeChance -= 0.2;
    }

    // Glass cannons are easier to outrun
    if (enemy.behavior === 'glass_cannon') {
      fleeChance += 0.15;
    }

    fleeChance = Math.max(0.05, Math.min(0.85, fleeChance));

    if (Math.random() < fleeChance) {
      messages.push('🏃 You escaped successfully!');
      return {
        resolutionType: 'escape',
        playerDamage: 0,
        enemyDamage: 0,
        playerHealth: player.health,
        enemyHealth: enemy.health,
        isPlayerVictory: true,
        isEnemyDefeated: false,
        coinsEarned: 0,
        messages,
      };
    }

    // Failed: enemy gets a free hit
    const enemyDamage = this.calculateDamage(enemy.attack, player.defense);
    const newPlayerHealth = Math.max(0, player.health - enemyDamage);
    messages.push(`🏃 Failed to flee! ${enemy.name} strikes for ${enemyDamage} damage!`);

    return {
      resolutionType: undefined,
      playerDamage: 0,
      enemyDamage,
      playerHealth: newPlayerHealth,
      enemyHealth: enemy.health,
      isPlayerVictory: false,
      isEnemyDefeated: false,
      coinsEarned: 0,
      messages,
    };
  }

  /**
   * Attempt to bribe the enemy.
   * Requires enemy.canBeBribed and sufficient coins (2× coinReward).
   * On failure the enemy attacks and coins are NOT deducted.
   */
  static attemptBribe(player: Player, enemy: Enemy): CombatResult {
    const messages: string[] = [];
    const bribeCost = enemy.coinReward * 2;

    if (!enemy.canBeBribed) {
      const enemyDamage = this.calculateDamage(enemy.attack, player.defense);
      const newPlayerHealth = Math.max(0, player.health - enemyDamage);
      messages.push(`💰 ${enemy.name} is insulted by your bribe! Attacks for ${enemyDamage} damage!`);
      return {
        resolutionType: undefined,
        playerDamage: 0,
        enemyDamage,
        playerHealth: newPlayerHealth,
        enemyHealth: enemy.health,
        isPlayerVictory: false,
        isEnemyDefeated: false,
        coinsEarned: 0,
        messages,
      };
    }

    if (player.coins < bribeCost) {
      messages.push(`💰 Not enough coins to bribe! Need ${bribeCost} coins.`);
      return {
        resolutionType: undefined,
        playerDamage: 0,
        enemyDamage: 0,
        playerHealth: player.health,
        enemyHealth: enemy.health,
        isPlayerVictory: false,
        isEnemyDefeated: false,
        coinsEarned: 0,
        messages,
      };
    }

    // Success chance: 70% base, +15% if enemy HP < 50%
    let successChance = 0.7;
    if (enemy.health < enemy.maxHealth * 0.5) successChance += 0.15;
    successChance = Math.min(0.95, successChance);

    if (Math.random() < successChance) {
      messages.push(`💰 ${enemy.name} accepts your bribe of ${bribeCost} coins and walks away!`);
      return {
        resolutionType: 'bribe',
        playerDamage: 0,
        enemyDamage: 0,
        playerHealth: player.health,
        enemyHealth: enemy.health,
        isPlayerVictory: true,
        isEnemyDefeated: false,
        coinsEarned: 0,
        messages,
        bribeCost,
      };
    }

    // Failed: enemy attacks, coins NOT deducted
    const enemyDamage = this.calculateDamage(enemy.attack, player.defense);
    const newPlayerHealth = Math.max(0, player.health - enemyDamage);
    messages.push(`💰 ${enemy.name} takes your offer but attacks anyway for ${enemyDamage} damage!`);

    return {
      resolutionType: undefined,
      playerDamage: 0,
      enemyDamage,
      playerHealth: newPlayerHealth,
      enemyHealth: enemy.health,
      isPlayerVictory: false,
      isEnemyDefeated: false,
      coinsEarned: 0,
      messages,
    };
  }

  /**
   * Attempt a truce with the enemy.
   * Requires enemy.willAcceptTruce. Partial coin reward on success.
   * On failure the enemy attacks.
   */
  static attemptTruce(player: Player, enemy: Enemy): CombatResult {
    const messages: string[] = [];

    if (!enemy.willAcceptTruce) {
      const enemyDamage = this.calculateDamage(enemy.attack, player.defense);
      const newPlayerHealth = Math.max(0, player.health - enemyDamage);
      messages.push(`🤝 ${enemy.name} refuses your truce and attacks for ${enemyDamage} damage!`);
      return {
        resolutionType: undefined,
        playerDamage: 0,
        enemyDamage,
        playerHealth: newPlayerHealth,
        enemyHealth: enemy.health,
        isPlayerVictory: false,
        isEnemyDefeated: false,
        coinsEarned: 0,
        messages,
      };
    }

    // Success chance: 50% base, +20% if enemy HP < 30%, +10% if player HP < 30%
    let successChance = 0.5;
    if (enemy.health < enemy.maxHealth * 0.3) successChance += 0.2;
    if (player.health < player.maxHealth * 0.3) successChance += 0.1;
    successChance = Math.min(0.9, successChance);

    const partialReward = Math.floor(enemy.coinReward * 0.5);

    if (Math.random() < successChance) {
      messages.push(`🤝 ${enemy.name} agrees to a truce! You earn ${partialReward} coins.`);
      return {
        resolutionType: 'truce',
        playerDamage: 0,
        enemyDamage: 0,
        playerHealth: player.health,
        enemyHealth: enemy.health,
        isPlayerVictory: true,
        isEnemyDefeated: false,
        coinsEarned: partialReward,
        messages,
      };
    }

    // Failed: enemy attacks
    const enemyDamage = this.calculateDamage(enemy.attack, player.defense);
    const newPlayerHealth = Math.max(0, player.health - enemyDamage);
    messages.push(`🤝 ${enemy.name} rejects your truce and attacks for ${enemyDamage} damage!`);

    return {
      resolutionType: undefined,
      playerDamage: 0,
      enemyDamage,
      playerHealth: newPlayerHealth,
      enemyHealth: enemy.health,
      isPlayerVictory: false,
      isEnemyDefeated: false,
      coinsEarned: 0,
      messages,
    };
  }

  /**
   * Calculate the bribe cost for a given enemy.
   */
  static getBribeCost(enemy: Enemy): number {
    return enemy.coinReward * 2;
  }
}
