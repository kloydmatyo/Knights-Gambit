import { BoardTile, Enemy, TrapType } from './types';
import { TILE_TYPES, TRAP_TYPES, GAME_CONFIG } from './constants';
import { EnemyEngine } from './EnemyEngine';
import { randomInt } from '@/lib/utils';

export class BoardEngine {
  /** Tile index where the boss is placed on boss floors */
  static readonly BOSS_TILE_ID = 10;
  /** Floors that have a boss encounter */
  static readonly BOSS_FLOORS = [5, 10];

  /**
   * Generate a new game board
   */
  static generateBoard(floor: number): BoardTile[] {
    const tiles: BoardTile[] = [];
    const boardSize = GAME_CONFIG.BOARD_SIZE;
    const isBossFloor = this.BOSS_FLOORS.includes(floor);

    // Calculate positions in a circle - centered coordinates
    const centerX = 450; // Center of 900
    const centerY = 300; // Center of 600
    const radius = 240; // Increased for better spacing

    for (let i = 0; i < boardSize; i++) {
      const angle = (i / boardSize) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      let type: BoardTile['type'] = TILE_TYPES.NORMAL;

      if (i === 0) {
        // Tile 0 is always START
        type = TILE_TYPES.START;
      } else if (isBossFloor && i === this.BOSS_TILE_ID) {
        // Boss only appears at tile 10 on floors 5 and 10
        type = TILE_TYPES.BOSS;
      } else if (i % 5 === 0) {
        // Shop every 5 tiles (tiles 5, 15 — tile 10 is boss on boss floors)
        type = TILE_TYPES.SHOP;
      } else {
        const rand = Math.random();
        if (rand < 0.45) {
          type = TILE_TYPES.ENEMY;
        } else if (rand < 0.6) {
          type = TILE_TYPES.NORMAL;
        } else if (rand < 0.75) {
          type = TILE_TYPES.EVENT;
        } else {
          type = TILE_TYPES.TRAP;
        }
      }

      const trapTypes = Object.values(TRAP_TYPES) as TrapType[];
      const randomTrap = trapTypes[Math.floor(Math.random() * trapTypes.length)];

      tiles.push({
        id: i,
        type,
        x,
        y,
        visited: i === 0,
        ...(type === TILE_TYPES.ENEMY && {
          enemy: EnemyEngine.generateEnemy(floor),
        }),
        ...(type === TILE_TYPES.TRAP && {
          trapType: randomTrap,
          trapTriggered: false,
        }),
      });
    }

    return tiles;
  }

  /**
   * Get tile by position
   */
  static getTile(board: BoardTile[], position: number): BoardTile | undefined {
    return board.find((tile) => tile.id === position);
  }

  /**
   * Mark tile as visited
   */
  static visitTile(board: BoardTile[], position: number): BoardTile[] {
    return board.map((tile) =>
      tile.id === position ? { ...tile, visited: true } : tile
    );
  }

  /**
   * Mark trap as triggered (deactivates it)
   */
  static triggerTrap(board: BoardTile[], position: number): BoardTile[] {
    return board.map((tile) =>
      tile.id === position ? { ...tile, trapTriggered: true } : tile
    );
  }

  /**
   * Reshuffle all non-fixed tiles on the board (keeps START at 0 and BOSS at last).
   * Called when the player completes a lap past tile 0.
   */
  static reshuffleBoard(board: BoardTile[], floor: number): BoardTile[] {
    const isBossFloor = this.BOSS_FLOORS.includes(floor);

    return board.map((tile) => {
      // START tile always stays
      if (tile.id === 0) {
        return { ...tile, visited: true };
      }

      // Boss tile: present only on boss floors, otherwise becomes a shop
      if (tile.id === this.BOSS_TILE_ID) {
        if (isBossFloor) {
          return { ...tile, type: TILE_TYPES.BOSS, visited: false, enemy: undefined, trapType: undefined, trapTriggered: undefined };
        }
        // On non-boss floors tile 10 is a shop (falls through to shop check below)
      }

      // Fixed shop every 5 tiles
      if (tile.id % 5 === 0) {
        return { ...tile, type: TILE_TYPES.SHOP, visited: false, enemy: undefined, trapType: undefined, trapTriggered: undefined };
      }

      // Re-roll tile type
      const rand = Math.random();
      let type: BoardTile['type'];
      if (rand < 0.45) {
        type = TILE_TYPES.ENEMY;
      } else if (rand < 0.6) {
        type = TILE_TYPES.NORMAL;
      } else if (rand < 0.75) {
        type = TILE_TYPES.EVENT;
      } else {
        type = TILE_TYPES.TRAP;
      }

      const trapTypes = Object.values(TRAP_TYPES) as TrapType[];
      const randomTrap = trapTypes[Math.floor(Math.random() * trapTypes.length)];

      return {
        ...tile,
        type,
        visited: false,
        enemy: type === TILE_TYPES.ENEMY ? EnemyEngine.generateEnemy(floor) : undefined,
        trapType: type === TILE_TYPES.TRAP ? randomTrap : undefined,
        trapTriggered: type === TILE_TYPES.TRAP ? false : undefined,
      };
    });
  }

  /**
   * Get next position after dice roll
   */
  static getNextPosition(currentPosition: number, diceRoll: number, boardSize: number): number {
    return (currentPosition + diceRoll) % boardSize;
  }

  /**
   * Check if position is valid
   */
  static isValidPosition(position: number, boardSize: number): boolean {
    return position >= 0 && position < boardSize;
  }

  /**
   * Get distance between two positions
   */
  static getDistance(pos1: number, pos2: number, boardSize: number): number {
    const forward = (pos2 - pos1 + boardSize) % boardSize;
    const backward = (pos1 - pos2 + boardSize) % boardSize;
    return Math.min(forward, backward);
  }

  /**
   * Get tiles in range
   */
  static getTilesInRange(
    board: BoardTile[],
    position: number,
    range: number
  ): BoardTile[] {
    const boardSize = board.length;
    const tiles: BoardTile[] = [];

    for (let i = 1; i <= range; i++) {
      const nextPos = (position + i) % boardSize;
      const tile = this.getTile(board, nextPos);
      if (tile) tiles.push(tile);
    }

    return tiles;
  }
}
