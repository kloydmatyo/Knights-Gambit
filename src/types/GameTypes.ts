export interface Player {
  id: string;
  name: string;
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
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // -1 for permanent until cured
  damage?: number; // damage per turn for poison
  description: string;
}

export interface Equipment {
  weapon?: Weapon;
  armor?: Armor;
  accessory?: Accessory;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  value: number;
  quantity: number;
}

export interface Weapon extends Item {
  attack: number;
  critChance: number;
}

export interface Armor extends Item {
  defense: number;
  healthBonus: number;
}

export interface Accessory extends Item {
  effect: string;
  value: number;
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

export enum ItemType {
  WEAPON = "weapon",
  ARMOR = "armor",
  ACCESSORY = "accessory",
  CONSUMABLE = "consumable",
}

export enum StatusEffectType {
  POISON = "poison",
  REGENERATION = "regeneration",
  STRENGTH_BOOST = "strength_boost",
  DEFENSE_BOOST = "defense_boost",
  BLESSING = "blessing",
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
}

export interface GameState {
  player: Player;
  currentFloor: number;
  board: BoardTile[];
  isPlayerTurn: boolean;
  diceValue: number;
}
