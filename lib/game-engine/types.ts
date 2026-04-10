import { CHARACTER_CLASSES, TILE_TYPES, ENEMY_TYPES, STATUS_EFFECTS, ITEM_TYPES, TRAP_TYPES, WEAPON_UPGRADE_TIERS } from './constants';

export type CharacterClass = typeof CHARACTER_CLASSES[keyof typeof CHARACTER_CLASSES];
export type TileType = typeof TILE_TYPES[keyof typeof TILE_TYPES];
export type EnemyType = typeof ENEMY_TYPES[keyof typeof ENEMY_TYPES];
export type StatusEffectType = typeof STATUS_EFFECTS[keyof typeof STATUS_EFFECTS];
export type ItemType = typeof ITEM_TYPES[keyof typeof ITEM_TYPES];
export type TrapType = typeof TRAP_TYPES[keyof typeof TRAP_TYPES];
export type WeaponUpgradeTier = typeof WEAPON_UPGRADE_TIERS[keyof typeof WEAPON_UPGRADE_TIERS];

export interface Player {
  id: string;
  class: CharacterClass;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  coins: number;
  position: number;
  inventory: Item[];
  skills: Skill[];
  statusEffects: StatusEffect[];
  mana?: number;
  maxMana?: number;
  /** Relic ids owned this run — drives passive effects */
  relics: string[];
}

export type EnemyBehavior =
  | 'normal'
  | 'berserker'      // gains +3 ATK each turn it survives
  | 'regenerator'    // heals 8 HP per turn
  | 'defender'       // reflects 30% of incoming damage back to player
  | 'glass_cannon'   // +50% ATK, -50% DEF
  | 'poisoner'       // applies poison on every attack
  | 'enrager';       // boss-only: gains +15 ATK when below 50% HP (one-time)

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  coinReward: number;
  statusEffects: StatusEffect[];
  behavior: EnemyBehavior;
  /** True once a boss has triggered its enrage phase */
  enraged?: boolean;
}

export interface BoardTile {
  id: number;
  type: TileType;
  x: number;
  y: number;
  visited: boolean;
  enemy?: Enemy;
  trapType?: TrapType;
  trapTriggered?: boolean;
  /** Branching: which tile ids this tile connects forward to */
  nextIds?: number[];
  /** Branching: which tile ids lead into this tile */
  prevIds?: number[];
  /** Branch depth (distance from start) */
  depth?: number;
}

/**
 * 2d6 Destiny States — outcome modifier applied AFTER player chooses a branch.
 * Roll 2d6 (2–12): 7 is most common, extremes are rare.
 */
export type DestinyState = 'cursed' | 'unlucky' | 'balanced' | 'favored' | 'exalted';

export interface DestinyResult {
  /** Sum of two d6 rolls (2–12) */
  total: number;
  /** Individual die values */
  die1: number;
  die2: number;
  /** Resolved destiny state */
  state: DestinyState;
  /** Display emoji */
  emoji: string;
  /** Short label */
  label: string;
  /** Description of effect */
  description: string;
}

/** Branch options shown to player BEFORE rolling — player picks one, then rolls 2d6 */
export interface BranchChoice {
  /** Tile ids the player can choose from (adjacent nextIds of current tile) */
  tileOptions: number[];
  /** Set after player picks a tile and rolls 2d6 */
  chosenTileId?: number;
  /** 2d6 outcome result, set after rolling */
  destinyResult?: DestinyResult;
  // Legacy fields kept for DiceManipulator compatibility
  diceValue?: number;
  altDiceValue?: number;
  altTileOptions?: number[];
}

/** Dice manipulation resources */
export interface DiceManipulation {
  rerolls: number;       // free rerolls remaining this floor
  modifiers: number;     // +1/-1 tokens remaining
  doubleRolls: number;   // "choose 1 of 2 rolls" tokens remaining
}

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  description: string;
  price: number;
  effect: ItemEffect;
  quantity: number;
  autoConsume?: boolean; // if true, item is applied immediately on purchase and never stored
}

export interface ItemEffect {
  type: 'heal' | 'cure' | 'cure_curse' | 'buff' | 'permanent' | 'relic';
  value?: number;
  stat?: 'health' | 'attack' | 'defense';
  duration?: number;
  /** For relic type: which passive bonus this relic grants */
  relicId?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive';
  cooldown: number;
  currentCooldown: number;
  effect: SkillEffect;
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'special';
  value?: number;
  target?: 'self' | 'enemy' | 'all';
  duration?: number;
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  value?: number;
}

export interface CombatResult {
  playerDamage: number;
  enemyDamage: number;
  playerHealth: number;
  enemyHealth: number;
  isPlayerVictory: boolean;
  isEnemyDefeated: boolean;
  coinsEarned: number;
  messages: string[];
  updatedPlayerMana?: number;
  updatedEnemyStatusEffects?: StatusEffect[];
  /** Behavior side-effects — applied by GameEngine after the turn */
  behaviorEnemyAtkGain?: number;
  behaviorEnemyRegen?: number;
  behaviorPoisonPlayer?: boolean;
  /** Relic side-effects — applied by GameEngine after the turn */
  relicVampiricHeal?: number;
  relicBonusCoins?: number;
}

export interface GameState {
  player: Player;
  currentFloor: number;
  board: BoardTile[];
  turnCount: number;
  isInCombat: boolean;
  currentEnemy: Enemy | null;
  statUpgradeCounts: StatUpgradeCounts;
  enemiesKilled: number;
  /** Pending branch choice waiting for player to pick a tile */
  pendingBranchChoice?: BranchChoice | null;
  /** Dice manipulation resources */
  diceManipulation: DiceManipulation;
  /** Destiny state active for the current combat (cleared on combat end) */
  activeCombatDestiny?: DestinyState | null;
}

export interface StatUpgradeCounts {
  attack: number;
  defense: number;
  health: number;
}

// --- Weapon Upgrade System ---

export interface WeaponUpgradeEffect {
  attackBonus?: number;
  defenseBonus?: number;
  critChanceBonus?: number;   // 0.0 - 1.0
  critDamageBonus?: number;   // multiplier bonus e.g. 0.5 = +50%
  healthBonus?: number;
  specialAbility?: string;    // unique ability id granted by this upgrade
}

export interface WeaponUpgrade {
  id: string;
  name: string;
  description: string;
  tier: WeaponUpgradeTier;
  requiredClass: CharacterClass;
  requiredFloor: number;       // minimum floor to unlock
  cost: number;
  effect: WeaponUpgradeEffect;
  prerequisiteId?: string;     // must own this upgrade first
  emoji: string;
}

export interface WeaponUpgradeState {
  purchasedUpgradeIds: string[];
  // Computed totals applied to player stats
  totalAttackBonus: number;
  totalDefenseBonus: number;
  totalCritChanceBonus: number;
  totalCritDamageBonus: number;
  totalHealthBonus: number;
  unlockedAbilities: string[];
}
