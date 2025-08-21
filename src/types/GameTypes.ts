export interface Player {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  coins: number;
  position: number;
  equipment: Equipment;
  inventory: Item[];
  stats: PlayerStats;
  statusEffects: StatusEffect[];
  baseStats: BaseStats; // Store original stats before buffs
  skills: PlayerSkill[]; // Available skills
  skillCooldowns: { [skillId: string]: number }; // Skill cooldowns
  mana?: number; // For mage class
  maxMana?: number; // For mage class
  experience: number; // Experience points
  experienceToNext: number; // Experience needed for next level
}

export interface CharacterClass {
  name: string;
  description: string;
  baseHealth: number;
  baseAttack: number;
  baseDefense: number;
  startingCoins: number;
  specialAbility: string;
  sprite: string;
  skills: Skill[]; // Class-specific skills
  baseMana?: number; // For mage class
}

export enum CharacterClassName {
  KNIGHT = "knight",
  ARCHER = "archer",
  MAGE = "mage",
  BARBARIAN = "barbarian",
  ASSASSIN = "assassin",
  CLERIC = "cleric",
}

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  description: string;
  effect: SkillEffect;
  cooldown: number;
  manaCost?: number;
  className: CharacterClassName;
}

export interface PlayerSkill {
  skillId: string;
  level: number;
  unlocked: boolean;
}

export interface SkillEffect {
  type: SkillEffectType;
  value: number;
  duration?: number;
  target: SkillTarget;
  conditions?: SkillCondition[];
  additionalEffects?: SkillEffect[];
}

export enum SkillType {
  ACTIVE = "active",
  PASSIVE = "passive",
}

export enum SkillEffectType {
  DAMAGE = "damage",
  HEAL = "heal",
  BUFF = "buff",
  DEBUFF = "debuff",
  SHIELD = "shield",
  SPECIAL = "special",
}

export enum SkillTarget {
  SELF = "self",
  ENEMY = "enemy",
  ALL_ENEMIES = "all_enemies",
  ALLY = "ally",
  ALL_ALLIES = "all_allies",
}

export interface SkillCondition {
  type: SkillConditionType;
  value: number;
}

export enum SkillConditionType {
  HEALTH_BELOW = "health_below",
  HEALTH_ABOVE = "health_above",
  ENEMY_POISONED = "enemy_poisoned",
  ALLY_DEFEATED = "ally_defeated",
  CONSECUTIVE_HIT = "consecutive_hit",
}

export interface BaseStats {
  attack: number;
  defense: number;
  maxHealth: number;
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // -1 for permanent until cured
  damage?: number; // damage per turn for poison
  description: string;
  applied?: boolean; // Track if buff has been applied
}

export interface Equipment {
  weapon?: Weapon;
  armor?: Armor;
  accessory?: Accessory;
  helmet?: Armor;
  boots?: Armor;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  value: number;
  quantity: number;
  rarity: ItemRarity;
  level: number;
}

export enum ItemRarity {
  COMMON = "common",
  UNCOMMON = "uncommon", 
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export interface Weapon extends Item {
  attack: number;
  critChance: number;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
}

export interface Armor extends Item {
  defense: number;
  healthBonus: number;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
}

export interface Accessory extends Item {
  effect: string;
  effectValue: number;
  enchantments: Enchantment[];
}

export interface Enchantment {
  id: string;
  name: string;
  description: string;
  effect: EnchantmentEffect;
}

export interface EnchantmentEffect {
  type: EnchantmentType;
  value: number;
  duration?: number;
}

export enum EnchantmentType {
  ATTACK_BONUS = "attack_bonus",
  DEFENSE_BONUS = "defense_bonus",
  HEALTH_BONUS = "health_bonus",
  MANA_BONUS = "mana_bonus",
  CRIT_CHANCE = "crit_chance",
  DAMAGE_REDUCTION = "damage_reduction",
  REGENERATION = "regeneration",
  FIRE_DAMAGE = "fire_damage",
  ICE_DAMAGE = "ice_damage",
  LIGHTNING_DAMAGE = "lightning_damage",
}

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  ACCESSORY = "accessory",
  CONSUMABLE = "consumable",
  TREASURE = "treasure",
}

export interface PlayerStats {
  gamesPlayed: number;
  enemiesDefeated: number;
  coinsEarned: number;
  floorsCompleted: number;
}

export enum TileType {
  EMPTY = "empty",
  ENEMY = "enemy",
  TREASURE = "treasure",
  SHOP = "shop",
  EVENT = "event",
  BOSS = "boss",
  START = "start",
}



export enum StatusEffectType {
  POISON = "poison",
  REGENERATION = "regeneration",
  STRENGTH_BOOST = "strength_boost",
  DEFENSE_BOOST = "defense_boost",
  BLESSING = "blessing",
  BURN = "burn",
  FREEZE = "freeze",
  STUN = "stun",
  BERSERKER_RAGE = "berserker_rage",
  SHADOW_STEP = "shadow_step",
  SHIELD_WALL = "shield_wall",
  MANA_SHIELD = "mana_shield",
  BLESSED_AURA = "blessed_aura",
  HUNTERS_MARK = "hunters_mark",
  BLOODTHIRST = "bloodthirst",
}

export interface BoardTile {
  id: number;
  type: TileType;
  data?: any;
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  coins: number;
  loot?: Item[];
  statusEffects?: StatusEffect[];
  isBoss?: boolean;
  bossAbilities?: BossAbility[];
  experience?: number;
}

export interface BossAbility {
  id: string;
  name: string;
  type: BossAbilityType;
  target: BossAbilityTarget;
  damage?: number;
  effect?: StatusEffectType;
  cooldown: number;
  currentCooldown: number;
  description: string;
}

export enum BossAbilityType {
  ATTACK = "attack",
  SPECIAL_ATTACK = "special_attack",
  BUFF = "buff",
  DEBUFF = "debuff",
  HEAL = "heal",
  SUMMON = "summon",
}

export enum BossAbilityTarget {
  PLAYER = "player",
  SELF = "self",
  ALL = "all",
}

export interface GameState {
  player: Player;
  currentFloor: number;
  board: BoardTile[];
  isPlayerTurn: boolean;
  diceValue: number;
}
