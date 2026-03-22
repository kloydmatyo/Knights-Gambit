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
}

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
  type: 'heal' | 'cure' | 'cure_curse' | 'buff' | 'permanent';
  value?: number;
  stat?: 'health' | 'attack' | 'defense';
  duration?: number;
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
}

export interface GameState {
  player: Player;
  currentFloor: number;
  board: BoardTile[];
  turnCount: number;
  isInCombat: boolean;
  currentEnemy: Enemy | null;
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
