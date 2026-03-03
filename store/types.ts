export interface Player {
  class: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  coins: number;
  position: number;
  inventory: InventoryItem[];
  skills: PlayerSkill[];
  statusEffects: StatusEffect[];
  mana?: number;
  maxMana?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'consumable' | 'equipment' | 'quest';
  description: string;
  effect?: any;
}

export interface PlayerSkill {
  skillId: string;
  unlocked: boolean;
  cooldown: number;
}

export interface StatusEffect {
  type: string;
  duration: number;
  value?: number;
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  type: string;
}

export interface BoardTile {
  id: number;
  type: 'normal' | 'enemy' | 'shop' | 'event' | 'boss' | 'start';
  x: number;
  y: number;
  visited: boolean;
}

export interface GameState {
  player: Player | null;
  currentFloor: number;
  currentPosition: number;
  board: BoardTile[];
  enemies: Enemy[];
  isInCombat: boolean;
  turnCount: number;
}

export interface UIState {
  activeModal: string | null;
  isLoading: boolean;
  isInventoryOpen: boolean;
  isMobileMenuOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
