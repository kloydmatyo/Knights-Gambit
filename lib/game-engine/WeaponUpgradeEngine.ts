import { WeaponUpgrade, WeaponUpgradeState } from './types';
import { WEAPON_UPGRADES } from './constants';

export class WeaponUpgradeEngine {
  /**
   * Get all upgrades available to a specific class
   */
  static getClassUpgrades(characterClass: string): WeaponUpgrade[] {    return (WEAPON_UPGRADES as unknown as WeaponUpgrade[]).filter(
      (u) => u.requiredClass === characterClass
    );
  }

  /**
   * Get upgrades the player can currently see/purchase
   * - Must match player class
   * - Floor requirement met
   * - Prerequisite owned (if any)
   */
  static getAvailableUpgrades(
    characterClass: string,
    currentFloor: number,
    upgradeState: WeaponUpgradeState
  ): WeaponUpgrade[] {
    const classUpgrades = this.getClassUpgrades(characterClass);

    return classUpgrades.filter((upgrade) => {
      if (upgradeState.purchasedUpgradeIds.includes(upgrade.id)) return false;
      if (currentFloor < upgrade.requiredFloor) return false;
      if (upgrade.prerequisiteId && !upgradeState.purchasedUpgradeIds.includes(upgrade.prerequisiteId)) return false;
      return true;
    });
  }

  /**
   * Purchase an upgrade — returns deltas to apply to the store player
   */
  static purchaseUpgrade(
    characterClass: string,
    coins: number,
    upgradeId: string,
    currentFloor: number,
    upgradeState: WeaponUpgradeState
  ): {
    coins: number;
    attackDelta: number;
    defenseDelta: number;
    healthDelta: number;
    upgradeState: WeaponUpgradeState;
    message: string;
  } | null {
    const upgrade = (WEAPON_UPGRADES as unknown as WeaponUpgrade[]).find((u) => u.id === upgradeId);

    if (!upgrade) return null;
    if (upgrade.requiredClass !== characterClass) return null;
    if (currentFloor < upgrade.requiredFloor) return null;
    if (upgradeState.purchasedUpgradeIds.includes(upgradeId)) return null;
    if (upgrade.prerequisiteId && !upgradeState.purchasedUpgradeIds.includes(upgrade.prerequisiteId)) return null;
    if (coins < upgrade.cost) return null;

    const newUpgradeState = this.applyUpgrade(upgradeState, upgrade);

    return {
      coins: coins - upgrade.cost,
      attackDelta: upgrade.effect.attackBonus ?? 0,
      defenseDelta: upgrade.effect.defenseBonus ?? 0,
      healthDelta: upgrade.effect.healthBonus ?? 0,
      upgradeState: newUpgradeState,
      message: `Upgraded to ${upgrade.name}! ${upgrade.description}`,
    };
  }

  /**
   * Apply upgrade effects to the upgrade state tracker
   */
  private static applyUpgrade(state: WeaponUpgradeState, upgrade: WeaponUpgrade): WeaponUpgradeState {
    const { effect } = upgrade;
    return {
      purchasedUpgradeIds: [...state.purchasedUpgradeIds, upgrade.id],
      totalAttackBonus: state.totalAttackBonus + (effect.attackBonus ?? 0),
      totalDefenseBonus: state.totalDefenseBonus + (effect.defenseBonus ?? 0),
      totalCritChanceBonus: state.totalCritChanceBonus + (effect.critChanceBonus ?? 0),
      totalCritDamageBonus: state.totalCritDamageBonus + (effect.critDamageBonus ?? 0),
      totalHealthBonus: state.totalHealthBonus + (effect.healthBonus ?? 0),
      unlockedAbilities: effect.specialAbility
        ? [...state.unlockedAbilities, effect.specialAbility]
        : state.unlockedAbilities,
    };
  }

  /**
   * Get the effective crit chance for a player (base + upgrade bonuses)
   */
  static getEffectiveCritChance(upgradeState: WeaponUpgradeState, baseCritChance = 0.1): number {
    return Math.min(0.95, baseCritChance + upgradeState.totalCritChanceBonus);
  }

  /**
   * Get the effective crit damage multiplier (base 2x + upgrade bonuses)
   */
  static getEffectiveCritMultiplier(upgradeState: WeaponUpgradeState, baseMultiplier = 2.0): number {
    return baseMultiplier + upgradeState.totalCritDamageBonus;
  }

  /**
   * Check if a special ability is unlocked
   */
  static hasAbility(upgradeState: WeaponUpgradeState, abilityId: string): boolean {
    return upgradeState.unlockedAbilities.includes(abilityId);
  }

  /**
   * Create a fresh upgrade state
   */
  static createInitialState(): WeaponUpgradeState {
    return {
      purchasedUpgradeIds: [],
      totalAttackBonus: 0,
      totalDefenseBonus: 0,
      totalCritChanceBonus: 0,
      totalCritDamageBonus: 0,
      totalHealthBonus: 0,
      unlockedAbilities: [],
    };
  }

  /**
   * Get purchased upgrades for display
   */
  static getPurchasedUpgrades(upgradeState: WeaponUpgradeState): WeaponUpgrade[] {
    return (WEAPON_UPGRADES as unknown as WeaponUpgrade[]).filter((u) =>
      upgradeState.purchasedUpgradeIds.includes(u.id)
    );
  }
}
