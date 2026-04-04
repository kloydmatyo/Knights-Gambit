// Game Constants
export const GAME_CONFIG = {
  BOARD_SIZE: 20,
  STARTING_FLOOR: 1,
  MAX_FLOORS: 10,
  DICE_SIDES: 6,
  FLOORS_PER_DUNGEON: 10,
} as const;

/** Returns the 1-based dungeon number for a given floor (floors 1-10 = dungeon 1, 11-20 = dungeon 2, etc.) */
export function getDungeonNumber(floor: number): number {
  return Math.ceil(floor / GAME_CONFIG.FLOORS_PER_DUNGEON);
}

/** Returns the floor number within the current dungeon (1–10) */
export function getFloorInDungeon(floor: number): number {
  return ((floor - 1) % GAME_CONFIG.FLOORS_PER_DUNGEON) + 1;
}

/** Returns true if this floor is the last floor of a dungeon (boss floor) */
export function isDungeonBossFloor(floor: number): boolean {
  return floor % GAME_CONFIG.FLOORS_PER_DUNGEON === 0;
}

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
    frameW: { Idle: 66, Hurt: 64, Attack: 58, Run: 128, Walk: 128, Death: 58 },
    frameH: { Idle: 60, Hurt: 60, Attack: 60, Run: 128, Walk: 128, Death: 60 },
    frames: { Idle: 6, Hurt: 5, Attack: 10, Run: 4, Walk: 4, Death: 10 },
  },
  slime2: {
    sheet: (anim) => `/sprites/slimes/Slime2_${anim}.png`,
    frameW: { Idle: 66, Hurt: 64, Attack: 64, Run: 128, Walk: 128, Death: 58 },
    frameH: { Idle: 60, Hurt: 60, Attack: 60, Run: 128, Walk: 128, Death: 60 },
    frames: { Idle: 6, Hurt: 5, Attack: 11, Run: 4, Walk: 4, Death: 10 },
  },
  slime3: {
    sheet: (anim) => `/sprites/slimes/Slime3_${anim}.png`,
    frameW: { Idle: 66, Hurt: 64, Attack: 60, Run: 128, Walk: 128, Death: 58 },
    frameH: { Idle: 60, Hurt: 60, Attack: 60, Run: 128, Walk: 128, Death: 60 },
    frames: { Idle: 6, Hurt: 5, Attack: 9, Run: 4, Walk: 4, Death: 10 },
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

// Boss definitions per floor milestone (keyed by floor-within-dungeon: 5 = mid-boss, 10 = dungeon boss)
// For floors beyond dungeon 1, EnemyEngine scales these stats by dungeon number.
export const BOSS_STATS: Record<number, { name: string; health: number; attack: number; defense: number; coinReward: number }> = {
  5:  { name: 'The Stone Warden',   health: 280, attack: 38, defense: 18, coinReward: 150 },
  10: { name: 'The Void Tyrant',    health: 520, attack: 65, defense: 30, coinReward: 300 },
};

// Named dungeon bosses for the final floor of each dungeon (floor 10, 20, 30…)
export const DUNGEON_BOSS_NAMES: Record<number, string> = {
  1: 'The Void Tyrant',
  2: 'The Crimson Colossus',
  3: 'The Abyssal Warden',
  4: 'The Eternal Dread',
};
export const WEAPON_UPGRADE_TIERS = {
  BASIC: 'basic',
  ADVANCED: 'advanced',
  ELITE: 'elite',
  LEGENDARY: 'legendary',
} as const;

// Weapon Upgrade Paths per class
// Each class has 4 upgrades: basic -> advanced -> elite -> legendary (linear chain)
// Plus one branching advanced upgrade for build variety
export const WEAPON_UPGRADES = [
  // ─── KNIGHT ───────────────────────────────────────────────────────────────
  {
    id: 'knight_basic',
    name: 'Tempered Blade',
    description: '+5 ATK, +2 DEF — Your sword holds a sharper edge.',
    tier: 'basic',
    requiredClass: 'knight',
    requiredFloor: 1,
    cost: 60,
    effect: { attackBonus: 5, defenseBonus: 2 },
    emoji: '⚔️',
  },
  {
    id: 'knight_advanced_a',
    name: 'Crusader\'s Edge',
    description: '+8 ATK, +10% crit chance — Holy power infuses your strikes.',
    tier: 'advanced',
    requiredClass: 'knight',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 8, critChanceBonus: 0.1 },
    prerequisiteId: 'knight_basic',
    emoji: '🗡️',
  },
  {
    id: 'knight_advanced_b',
    name: 'Tower Shield Mastery',
    description: '+5 DEF, +20 HP — Become an immovable fortress.',
    tier: 'advanced',
    requiredClass: 'knight',
    requiredFloor: 3,
    cost: 100,
    effect: { defenseBonus: 5, healthBonus: 20 },
    prerequisiteId: 'knight_basic',
    emoji: '🛡️',
  },
  {
    id: 'knight_elite',
    name: 'Paladin\'s Wrath',
    description: '+12 ATK, +15% crit dmg — Divine fury empowers every blow.',
    tier: 'elite',
    requiredClass: 'knight',
    requiredFloor: 6,
    cost: 160,
    effect: { attackBonus: 12, critDamageBonus: 0.15 },
    prerequisiteId: 'knight_advanced_a',
    emoji: '✨',
  },
  {
    id: 'knight_legendary',
    name: 'Excalibur\'s Legacy',
    description: '+20 ATK, +8 DEF, +20% crit dmg — The blade of legends.',
    tier: 'legendary',
    requiredClass: 'knight',
    requiredFloor: 9,
    cost: 250,
    effect: { attackBonus: 20, defenseBonus: 8, critDamageBonus: 0.2, specialAbility: 'holy_smite' },
    prerequisiteId: 'knight_elite',
    emoji: '👑',
  },

  // ─── ARCHER ───────────────────────────────────────────────────────────────
  {
    id: 'archer_basic',
    name: 'Recurve Bow',
    description: '+6 ATK — A stronger draw for harder hits.',
    tier: 'basic',
    requiredClass: 'archer',
    requiredFloor: 1,
    cost: 60,
    effect: { attackBonus: 6 },
    emoji: '🏹',
  },
  {
    id: 'archer_advanced_a',
    name: 'Hawk-Eye Quiver',
    description: '+4 ATK, +15% crit chance — Never miss a vital spot.',
    tier: 'advanced',
    requiredClass: 'archer',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 4, critChanceBonus: 0.15 },
    prerequisiteId: 'archer_basic',
    emoji: '🎯',
  },
  {
    id: 'archer_advanced_b',
    name: 'Barbed Arrows',
    description: '+8 ATK — Arrows that tear on exit.',
    tier: 'advanced',
    requiredClass: 'archer',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 8 },
    prerequisiteId: 'archer_basic',
    emoji: '🪃',
  },
  {
    id: 'archer_elite',
    name: 'Windrunner\'s Bow',
    description: '+10 ATK, +20% crit chance, +25% crit dmg — Strike like the wind.',
    tier: 'elite',
    requiredClass: 'archer',
    requiredFloor: 6,
    cost: 160,
    effect: { attackBonus: 10, critChanceBonus: 0.2, critDamageBonus: 0.25 },
    prerequisiteId: 'archer_advanced_a',
    emoji: '💨',
  },
  {
    id: 'archer_legendary',
    name: 'Stormbreaker Longbow',
    description: '+18 ATK, +30% crit chance, +50% crit dmg — Storms follow your arrows.',
    tier: 'legendary',
    requiredClass: 'archer',
    requiredFloor: 9,
    cost: 250,
    effect: { attackBonus: 18, critChanceBonus: 0.3, critDamageBonus: 0.5, specialAbility: 'storm_volley' },
    prerequisiteId: 'archer_elite',
    emoji: '⚡',
  },

  // ─── MAGE ─────────────────────────────────────────────────────────────────
  {
    id: 'mage_basic',
    name: 'Enchanted Staff',
    description: '+4 ATK, +10 HP — Arcane energy flows through the wood.',
    tier: 'basic',
    requiredClass: 'mage',
    requiredFloor: 1,
    cost: 60,
    effect: { attackBonus: 4, healthBonus: 10 },
    emoji: '🪄',
  },
  {
    id: 'mage_advanced_a',
    name: 'Spellweaver\'s Orb',
    description: '+7 ATK, +10% crit chance — Spells detonate with arcane force.',
    tier: 'advanced',
    requiredClass: 'mage',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 7, critChanceBonus: 0.1 },
    prerequisiteId: 'mage_basic',
    emoji: '🔮',
  },
  {
    id: 'mage_advanced_b',
    name: 'Runic Tome',
    description: '+5 ATK, +30 HP — Ancient runes bolster your constitution.',
    tier: 'advanced',
    requiredClass: 'mage',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 5, healthBonus: 30 },
    prerequisiteId: 'mage_basic',
    emoji: '📖',
  },
  {
    id: 'mage_elite',
    name: 'Archmage\'s Focus',
    description: '+12 ATK, +20% crit dmg — Spells pierce magical resistance.',
    tier: 'elite',
    requiredClass: 'mage',
    requiredFloor: 6,
    cost: 160,
    effect: { attackBonus: 12, critDamageBonus: 0.2 },
    prerequisiteId: 'mage_advanced_a',
    emoji: '💫',
  },
  {
    id: 'mage_legendary',
    name: 'Staff of the Cosmos',
    description: '+22 ATK, +40% crit dmg, +20 HP — The universe bends to your will.',
    tier: 'legendary',
    requiredClass: 'mage',
    requiredFloor: 9,
    cost: 250,
    effect: { attackBonus: 22, critDamageBonus: 0.4, healthBonus: 20, specialAbility: 'arcane_nova' },
    prerequisiteId: 'mage_elite',
    emoji: '🌌',
  },

  // ─── BARBARIAN ────────────────────────────────────────────────────────────
  {
    id: 'barbarian_basic',
    name: 'Spiked Maul',
    description: '+7 ATK — Heavier head, harder hits.',
    tier: 'basic',
    requiredClass: 'barbarian',
    requiredFloor: 1,
    cost: 60,
    effect: { attackBonus: 7 },
    emoji: '🪓',
  },
  {
    id: 'barbarian_advanced_a',
    name: 'Bloodsoaked Axe',
    description: '+10 ATK, +10% crit chance — The more it bleeds, the harder it swings.',
    tier: 'advanced',
    requiredClass: 'barbarian',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 10, critChanceBonus: 0.1 },
    prerequisiteId: 'barbarian_basic',
    emoji: '🩸',
  },
  {
    id: 'barbarian_advanced_b',
    name: 'Warlord\'s Plate',
    description: '+4 DEF, +40 HP — Thick armor for a thick skull.',
    tier: 'advanced',
    requiredClass: 'barbarian',
    requiredFloor: 3,
    cost: 100,
    effect: { defenseBonus: 4, healthBonus: 40 },
    prerequisiteId: 'barbarian_basic',
    emoji: '🛡️',
  },
  {
    id: 'barbarian_elite',
    name: 'Titan\'s Cleaver',
    description: '+15 ATK, +25% crit dmg — One swing, one kill.',
    tier: 'elite',
    requiredClass: 'barbarian',
    requiredFloor: 6,
    cost: 160,
    effect: { attackBonus: 15, critDamageBonus: 0.25 },
    prerequisiteId: 'barbarian_advanced_a',
    emoji: '⚒️',
  },
  {
    id: 'barbarian_legendary',
    name: 'Ragnarok Hammer',
    description: '+25 ATK, +50% crit dmg, +30 HP — The weapon that ends worlds.',
    tier: 'legendary',
    requiredClass: 'barbarian',
    requiredFloor: 9,
    cost: 250,
    effect: { attackBonus: 25, critDamageBonus: 0.5, healthBonus: 30, specialAbility: 'ground_shatter' },
    prerequisiteId: 'barbarian_elite',
    emoji: '🔨',
  },

  // ─── ASSASSIN ─────────────────────────────────────────────────────────────
  {
    id: 'assassin_basic',
    name: 'Serrated Dagger',
    description: '+5 ATK, +8% crit chance — Cuts deep and bleeds longer.',
    tier: 'basic',
    requiredClass: 'assassin',
    requiredFloor: 1,
    cost: 60,
    effect: { attackBonus: 5, critChanceBonus: 0.08 },
    emoji: '🗡️',
  },
  {
    id: 'assassin_advanced_a',
    name: 'Venom-Coated Blades',
    description: '+6 ATK, +12% crit chance — Every nick is a death sentence.',
    tier: 'advanced',
    requiredClass: 'assassin',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 6, critChanceBonus: 0.12 },
    prerequisiteId: 'assassin_basic',
    emoji: '☠️',
  },
  {
    id: 'assassin_advanced_b',
    name: 'Shadow Cloak',
    description: '+3 DEF, +15% crit dmg — Strike from the dark.',
    tier: 'advanced',
    requiredClass: 'assassin',
    requiredFloor: 3,
    cost: 100,
    effect: { defenseBonus: 3, critDamageBonus: 0.15 },
    prerequisiteId: 'assassin_basic',
    emoji: '🌑',
  },
  {
    id: 'assassin_elite',
    name: 'Phantom Stiletto',
    description: '+10 ATK, +20% crit chance, +30% crit dmg — Ghosts leave no trace.',
    tier: 'elite',
    requiredClass: 'assassin',
    requiredFloor: 6,
    cost: 160,
    effect: { attackBonus: 10, critChanceBonus: 0.2, critDamageBonus: 0.3 },
    prerequisiteId: 'assassin_advanced_a',
    emoji: '👻',
  },
  {
    id: 'assassin_legendary',
    name: 'Deathwhisper Blades',
    description: '+18 ATK, +35% crit chance, +60% crit dmg — Death comes before the sound.',
    tier: 'legendary',
    requiredClass: 'assassin',
    requiredFloor: 9,
    cost: 250,
    effect: { attackBonus: 18, critChanceBonus: 0.35, critDamageBonus: 0.6, specialAbility: 'death_mark' },
    prerequisiteId: 'assassin_elite',
    emoji: '💀',
  },

  // ─── CLERIC ───────────────────────────────────────────────────────────────
  {
    id: 'cleric_basic',
    name: 'Blessed Mace',
    description: '+4 ATK, +3 DEF — Sanctified steel.',
    tier: 'basic',
    requiredClass: 'cleric',
    requiredFloor: 1,
    cost: 60,
    effect: { attackBonus: 4, defenseBonus: 3 },
    emoji: '✝️',
  },
  {
    id: 'cleric_advanced_a',
    name: 'Radiant Scepter',
    description: '+6 ATK, +10% crit chance — Holy light blinds and burns.',
    tier: 'advanced',
    requiredClass: 'cleric',
    requiredFloor: 3,
    cost: 100,
    effect: { attackBonus: 6, critChanceBonus: 0.1 },
    prerequisiteId: 'cleric_basic',
    emoji: '☀️',
  },
  {
    id: 'cleric_advanced_b',
    name: 'Warden\'s Vestments',
    description: '+5 DEF, +25 HP — Divine protection made manifest.',
    tier: 'advanced',
    requiredClass: 'cleric',
    requiredFloor: 3,
    cost: 100,
    effect: { defenseBonus: 5, healthBonus: 25 },
    prerequisiteId: 'cleric_basic',
    emoji: '🌟',
  },
  {
    id: 'cleric_elite',
    name: 'Seraph\'s Hammer',
    description: '+10 ATK, +6 DEF, +15% crit dmg — Angels guide your hand.',
    tier: 'elite',
    requiredClass: 'cleric',
    requiredFloor: 6,
    cost: 160,
    effect: { attackBonus: 10, defenseBonus: 6, critDamageBonus: 0.15 },
    prerequisiteId: 'cleric_advanced_a',
    emoji: '😇',
  },
  {
    id: 'cleric_legendary',
    name: 'Divine Judgment',
    description: '+16 ATK, +10 DEF, +30% crit dmg, +20 HP — The wrath of the heavens.',
    tier: 'legendary',
    requiredClass: 'cleric',
    requiredFloor: 9,
    cost: 250,
    effect: { attackBonus: 16, defenseBonus: 10, critDamageBonus: 0.3, healthBonus: 20, specialAbility: 'divine_retribution' },
    prerequisiteId: 'cleric_elite',
    emoji: '⚡',
  },
] as const;
