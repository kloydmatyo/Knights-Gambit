import { GameState, Player, CharacterClass, CombatResult } from './types';
import { CharacterEngine } from './CharacterEngine';
import { BoardEngine } from './BoardEngine';
import { CombatEngine } from './CombatEngine';
import { EnemyEngine } from './EnemyEngine';
import { GAME_CONFIG } from './constants';
import { randomInt } from '@/lib/utils';

/**
 * Main Game Engine - Orchestrates all game systems
 */
export class GameEngine {
  /**
   * Initialize a new game
   */
  static initializeGame(characterClass: CharacterClass): GameState {
    const player = CharacterEngine.createPlayer(characterClass);
    const board = BoardEngine.generateBoard(GAME_CONFIG.STARTING_FLOOR);

    return {
      player,
      currentFloor: GAME_CONFIG.STARTING_FLOOR,
      board,
      turnCount: 0,
      isInCombat: false,
      currentEnemy: null,
    };
  }

  /**
   * Roll dice and move player
   */
  static rollDice(state: GameState): { state: GameState; diceValue: number; lapped: boolean } {
    const diceValue = randomInt(1, GAME_CONFIG.DICE_SIDES);
    const currentPosition = state.player.position;
    const newPosition = BoardEngine.getNextPosition(
      currentPosition,
      diceValue,
      state.board.length
    );

    // Detect lap: wrapped past tile 0 (new position is less than current, and we actually moved forward)
    const lapped = newPosition < currentPosition || (currentPosition + diceValue >= state.board.length);

    // Reshuffle board on lap, then mark the new tile as visited
    let updatedBoard = lapped
      ? BoardEngine.reshuffleBoard(state.board, state.currentFloor)
      : state.board;

    updatedBoard = BoardEngine.visitTile(updatedBoard, newPosition);

    const updatedPlayer = {
      ...state.player,
      position: newPosition,
    };

    return {
      state: {
        ...state,
        player: updatedPlayer,
        board: updatedBoard,
        turnCount: state.turnCount + 1,
      },
      diceValue,
      lapped,
    };
  }

  /**
   * Start combat with enemy on current tile
   */
  static startCombat(state: GameState): GameState {
    const tile = BoardEngine.getTile(state.board, state.player.position);
    
    if (!tile || !tile.enemy) {
      return state;
    }

    return {
      ...state,
      isInCombat: true,
      currentEnemy: tile.enemy,
    };
  }

  /**
   * Execute combat turn
   */
  static executeCombatTurn(
    state: GameState,
    useSkillId?: string
  ): { state: GameState; result: CombatResult } {
    if (!state.currentEnemy) {
      throw new Error('No enemy in combat!');
    }

    const skill = useSkillId
      ? state.player.skills.find((s) => s.id === useSkillId)
      : undefined;

    const result = CombatEngine.executeTurn(state.player, state.currentEnemy, skill);

    // Update player
    let updatedPlayer = {
      ...state.player,
      health: result.playerHealth,
      coins: state.player.coins + result.coinsEarned,
    };

    // Update cooldowns
    updatedPlayer = CharacterEngine.updateCooldowns(updatedPlayer);

    // If skill was used, set its cooldown
    if (skill && skill.type === 'active') {
      updatedPlayer = {
        ...updatedPlayer,
        skills: updatedPlayer.skills.map((s) =>
          s.id === skill.id ? { ...s, currentCooldown: s.cooldown } : s
        ),
      };
    }

    // Update enemy
    const updatedEnemy = result.isEnemyDefeated
      ? null
      : { ...state.currentEnemy, health: result.enemyHealth };

    return {
      state: {
        ...state,
        player: updatedPlayer,
        currentEnemy: updatedEnemy,
        isInCombat: !result.isEnemyDefeated,
      },
      result,
    };
  }

  /**
   * End combat
   */
  static endCombat(state: GameState): GameState {
    return {
      ...state,
      isInCombat: false,
      currentEnemy: null,
    };
  }

  /**
   * Advance to next floor
   */
  static advanceFloor(state: GameState): GameState {
    const nextFloor = state.currentFloor + 1;
    const newBoard = BoardEngine.generateBoard(nextFloor);

    return {
      ...state,
      currentFloor: nextFloor,
      board: newBoard,
      // Keep player at their current position — board is the same circular layout
      turnCount: 0,
    };
  }

  /**
   * Check if game is over
   */
  static isGameOver(state: GameState): boolean {
    return !CharacterEngine.isAlive(state.player);
  }

  /**
   * Check if floor is complete.
   * On boss floors: player must defeat the boss (boss tile visited, not in combat).
   * On non-boss floors: handled by lap detection in rollDice.
   */
  static isFloorComplete(state: GameState): boolean {
    const bossTile = state.board.find((t) => t.type === 'boss');
    if (bossTile) {
      return bossTile.visited && !state.isInCombat;
    }
    return false;
  }

  /**
   * Get game statistics
   */
  static getStatistics(state: GameState) {
    return {
      floor: state.currentFloor,
      turns: state.turnCount,
      health: `${state.player.health}/${state.player.maxHealth}`,
      coins: state.player.coins,
      position: `${state.player.position + 1}/${state.board.length}`,
    };
  }
}
