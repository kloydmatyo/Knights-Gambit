import { BoardTile, Enemy } from './types';
import { TILE_TYPES, GAME_CONFIG } from './constants';
import { EnemyEngine } from './EnemyEngine';
import { randomInt } from '@/lib/utils';

export class BoardEngine {
  /**
   * Generate a new game board
   */
  static generateBoard(floor: number): BoardTile[] {
    const tiles: BoardTile[] = [];
    const boardSize = GAME_CONFIG.BOARD_SIZE;

    // Calculate positions in a circle - centered coordinates
    const centerX = 450; // Center of 900
    const centerY = 300; // Center of 600
    const radius = 240; // Increased for better spacing

    for (let i = 0; i < boardSize; i++) {
      const angle = (i / boardSize) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      let type: BoardTile['type'] = TILE_TYPES.NORMAL;

      // First tile is always start
      if (i === 0) {
        type = TILE_TYPES.START;
      }
      // Last tile is boss
      else if (i === boardSize - 1) {
        type = TILE_TYPES.BOSS;
      }
      // Special shop floor every 5 tiles
      else if (i % 5 === 0) {
        type = TILE_TYPES.SHOP;
      }
      // Random distribution of other tiles
      else {
        const rand = Math.random();
        if (rand < 0.5) {
          type = TILE_TYPES.ENEMY;
        } else if (rand < 0.7) {
          type = TILE_TYPES.NORMAL;
        } else {
          type = TILE_TYPES.EVENT;
        }
      }

      tiles.push({
        id: i,
        type,
        x,
        y,
        visited: i === 0,
        ...(type === TILE_TYPES.ENEMY && {
          enemy: EnemyEngine.generateEnemy(floor),
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
