// Game Constants
export const GAME_CONFIG = {
  BOARD_SIZE: 20,
  STARTING_FLOOR: 1,
  MAX_FLOORS: 10,
  DICE_SIDES: 6,
} as const;

// Character Classes
export const CHARACTER_CLASSES = {
  KNIGHT: 'knight',
  ARCHER: 'archer',
  MAGE: 'mage',
  BARBARIAN: 'barbarian',
  ASSASSIN: 'assassin',
  CLERIC: 'cleric',
} as const;

// Character Base Stats
export const CLASS_STATS = {
  knight: {
    name: 'Knight',
    baseHealth: 120,
    baseAttack: 15,
    baseDefense: 8,
    startingCoins: 50,
    description: 'Balanced warrior with strong defense and moderate attack',
  },
  archer: {
    name: 'Archer',
    baseHealth: 90,
    baseAttack: 20,
    baseDefense: 3,
    startingCoins: 60,
    description: 'Agile ranged fighter with high attack but low defense',
  },
  mage: {
    name: 'Mage',
    baseHealth: 70,
    baseAttack: 12,
    baseDefense: 2,
    baseMana: 100,
    startingCoins: 40,
    description: 'Glass-cannon spellcaster with elemental magic',
  },
  barbarian: {
    name: 'Barbarian',
    baseHealth: 150,
    baseAttack: 18,
    baseDefense: 5,
    startingCoins: 30,
    description: 'Mighty warrior with massive health and devastating attacks',
  },
  assassin: {
    name: 'Assassin',
    baseHealth: 80,
    baseAttack: 16,
    baseDefense: 4,
    startingCoins: 70,
    description: 'Stealthy fighter with high crit chance and evasion',
  },
  cleric: {
    name: 'Cleric',
    baseHealth: 100,
    baseAttack: 10,
    baseDefense: 6,
    startingCoins: 45,
    description: 'Divine support with healing and protective magic',
  },
} as const;

// Tile Types
export const TILE_TYPES = {
  START: 'start',
  NORMAL: 'normal',
  ENEMY: 'enemy',
  SHOP: 'shop',
  EVENT: 'event',
  BOSS: 'boss',
  TRAP: 'trap',
} as const;

// Trap Types
export const TRAP_TYPES = {
  FIRE: 'fire',
  SPIKE: 'spike',
  POISON_GAS: 'poison_gas',
} as const;

// Enemy Types
export const ENEMY_TYPES = {
  GOBLIN: 'goblin',
  ORC: 'orc',
  SKELETON: 'skeleton',
  TROLL: 'troll',
  SLIME1: 'slime1',
  SLIME2: 'slime2',
  SLIME3: 'slime3',
} as const;

// Enemy Stats
export const ENEMY_STATS = {
  goblin: {
    name: 'Goblin',
    baseHealth: 30,
    baseAttack: 8,
    baseDefense: 2,
    coinReward: 15,
  },
  orc: {
    name: 'Orc',
    baseHealth: 50,
    baseAttack: 12,
    baseDefense: 4,
    coinReward: 25,
  },
  skeleton: {
    name: 'Skeleton',
    baseHealth: 40,
    baseAttack: 10,
    baseDefense: 3,
    coinReward: 20,
  },
  troll: {
    name: 'Troll',
    baseHealth: 80,
    baseAttack: 15,
    baseDefense: 6,
    coinReward: 40,
  },
  slime1: {
    name: 'Green Slime',
    baseHealth: 25,
    baseAttack: 6,
    baseDefense: 1,
    coinReward: 12,
  },
  slime2: {
    name: 'Blue Slime',
    baseHealth: 35,
    baseAttack: 9,
    baseDefense: 2,
    coinReward: 18,
  },
  slime3: {
    name: 'Red Slime',
    baseHealth: 45,
    baseAttack: 13,
    baseDefense: 3,
    coinReward: 28,
  },
} as const;

// Sprite config for animated enemies
export const ENEMY_SPRITES: Partial<Record<string, {
  sheet: (anim: string) => string;
  frameW: number | Partial<Record<string, number>>;
  frameH: number | Partial<Record<string, number>>;
  frames: Partial<Record<string, number>>;
}>> = {
  slime1: {
    sheet: (anim) => `/sprites/slimes/Slime1_${anim}.png`,
    frameW: { Idle: 58, Hurt: 58, Attack: 58, Run: 128, Walk: 128, Death: 58 },
    frameH: { Idle: 60, Hurt: 60, Attack: 60, Run: 128, Walk: 128, Death: 60 },
    frames: { Idle: 3, Hurt: 3, Attack: 10, Run: 4, Walk: 4, Death: 10 },
  },
  slime2: {
    sheet: (anim) => `/sprites/slimes/Slime2_${anim}.png`,
    frameW: { Idle: 58, Hurt: 58, Attack: 64, Run: 128, Walk: 128, Death: 58 },
    frameH: { Idle: 60, Hurt: 60, Attack: 60, Run: 128, Walk: 128, Death: 60 },
    frames: { Idle: 3, Hurt: 3, Attack: 11, Run: 4, Walk: 4, Death: 10 },
  },
  slime3: {
    sheet: (anim) => `/sprites/slimes/Slime3_${anim}.png`,
    frameW: { Idle: 58, Hurt: 58, Attack: 60, Run: 128, Walk: 128, Death: 58 },
    frameH: { Idle: 60, Hurt: 60, Attack: 60, Run: 128, Walk: 128, Death: 60 },
    frames: { Idle: 3, Hurt: 3, Attack: 9, Run: 4, Walk: 4, Death: 10 },
  },
};

// Status Effects
export const STATUS_EFFECTS = {
  POISON: 'poison',
  BURN: 'burn',
  STUN: 'stun',
  SHIELD: 'shield',
  REGEN: 'regen',
  BLESSED: 'blessed',
  CURSED: 'cursed',
} as const;

// Item Types
export const ITEM_TYPES = {
  HEALING_POTION: 'healing_potion',
  ANTIDOTE: 'antidote',
  STAT_UPGRADE: 'stat_upgrade',
  BLESSING_SCROLL: 'blessing_scroll',
  HEARTSTONE_AMULET: 'heartstone_amulet',
  HOLY_WATER: 'holy_water',
  BLESSING: 'blessing',
} as const;

// Shop Prices
export const SHOP_PRICES = {
  HEALING_POTION: 15,
  ANTIDOTE: 25,
  STAT_UPGRADE: 50,
  BLESSING_SCROLL: 75,
  HEARTSTONE_AMULET: 50,
  HOLY_WATER: 30,
  BLESSING: 40,
} as const;
